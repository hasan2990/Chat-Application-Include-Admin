using Microsoft.AspNetCore.SignalR;

namespace ChatApplication.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IDictionary<string, UserRoomConnection> _connections;
        private readonly IDictionary<string, string> _adminList; 

        public ChatHub(IDictionary<string, UserRoomConnection> connections, IDictionary<string, string> adminList)
        {
            _connections = connections;
            _adminList = adminList;
        }

        public async Task JoinRoom(UserRoomConnection userConnection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room!);

            _connections[Context.ConnectionId] = userConnection;

            if (userConnection.isAdmin)
            {
                _adminList[userConnection.Room!] = Context.ConnectionId;
                await Clients.Client(Context.ConnectionId)
                    .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} are the admin of this group.");
            }
            else
            {
                await Clients.Client(_adminList[userConnection.Room!])
                        .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has joined the group.");
            }
           
            await SendConnectedUser(userConnection.Room!);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (!_connections.TryGetValue(Context.ConnectionId, out UserRoomConnection roomConnection))
            {
                await base.OnDisconnectedAsync(exception);
                return;
            }

            _connections.Remove(Context.ConnectionId);

            if (roomConnection.isAdmin)
            {
                _adminList.Remove(roomConnection.Room!);
            }

            await Clients.Group(roomConnection.Room!)
                .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{roomConnection.User} has left the group.");
            await SendConnectedUser(roomConnection.Room!);

            await base.OnDisconnectedAsync(exception);
        }

        public Task SendConnectedUser(string room)
        {
            var users = _connections.Values
                .Where(u => u.Room == room)
                .Select(x => x.User);
            return Clients.Group(room).SendAsync("ConnectedUser", users);
        }

        public async Task KickUser(string user)
        {
            if (_connections.TryGetValue(Context.ConnectionId, out UserRoomConnection adminConnection) && adminConnection.isAdmin && _adminList[adminConnection.Room!] == Context.ConnectionId)
            {
                var userConnection = _connections.Values.FirstOrDefault(c => c.User == user && c.Room == adminConnection.Room);
                if (userConnection != null)
                {
                    var connectionId = _connections.FirstOrDefault(c => c.Value == userConnection).Key;
                    if (connectionId != null)
                    {
                        await Groups.RemoveFromGroupAsync(connectionId, userConnection.Room);
                        _connections.Remove(connectionId);

                        string adminUserName = adminConnection.User;

                        await Clients.Client(connectionId).SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"You have been kicked by admin: {adminUserName}.");

                        await Clients.Client(Context.ConnectionId).SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has been kicked by admin: {adminUserName}.");

                        await SendConnectedUser(userConnection.Room);
                    }
                }
            }
        }

        public async Task SendPrivateMessageToAdmin(string user, string message)
        {
            if (_connections.TryGetValue(Context.ConnectionId, out UserRoomConnection userConnection))
            {
                var room = userConnection.Room;
                if (_adminList.TryGetValue(room, out string adminConnectionId))
                {
                    await Clients.Client(adminConnectionId).SendAsync("ReceivePrivateMessage", user, message, DateTime.Now);
                    await Clients.Client(Context.ConnectionId).SendAsync("ReceivePrivateMessage", user, message, DateTime.Now);
                }
            }
        }


    }
}


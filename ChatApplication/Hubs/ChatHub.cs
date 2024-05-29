using ChatApplication.Helper;
using ChatApplication.Models;
using Microsoft.AspNetCore.SignalR;


namespace ChatApplication.Hubs
{
    public class ChatHub : Hub
    {
        private readonly Container _container;
        public ChatHub(Container container)
        {
            _container = container;
        }

        public async Task JoinRoom(UserRoomConnection userConnection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room!);
            userConnection.connectionId = Context.ConnectionId;
            _container._connections[Context.ConnectionId] = userConnection;

            if (userConnection.isAdmin)
            {


                _container._adminList[userConnection.Room!] = Context.ConnectionId;
                
                Console.WriteLine("Admins are" + _container._adminList);
                await Clients.Client(Context.ConnectionId)
                    .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} are the admin of this group.");
            }
            else
            {
                await Clients.Client(_container._adminList[userConnection.Room!])
                        .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has joined the group.");
            }
           
            await SendConnectedUser(userConnection.Room!);
        }
        public async Task KickUser(string user)
        {
            /*if (_container._connections.TryGetValue(Context.ConnectionId, out UserRoomConnection adminConnection) && adminConnection.isAdmin && _container._adminList[adminConnection.Room!] == Context.ConnectionId)
            {
                var userConnection = _container._connections.Values.FirstOrDefault(c => c.User == user && c.Room == adminConnection.Room);
                if (userConnection != null)
                {
                    var connectionId = _container._connections.FirstOrDefault(c => c.Value == userConnection).Key;
                    if (connectionId != null)
                    {
                        await Groups.RemoveFromGroupAsync(connectionId, userConnection.Room);
                        _container._connections.TryRemove(connectionId, out _);

                        string adminUserName = adminConnection.User;

                        await Clients.Client(connectionId).SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"You have been kicked by admin: {adminUserName}.");

                        await Clients.Client(Context.ConnectionId).SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has been kicked by admin: {adminUserName}.");

                        await SendConnectedUser(userConnection.Room);
                    }
                }
            }*/
            
            var rUser = _container._connections[Context.ConnectionId];
            var userConnection = _container._connections.Values.FirstOrDefault(c => c.User == user && c.Room == rUser.Room);
            var userconnectionId = _container._connections.FirstOrDefault(c => c.Value == userConnection).Key;

            _container._connections.TryRemove(userconnectionId, out _);

            if (rUser.isAdmin)
            {
                string adminUserName = rUser.User;

                
                await Clients.Client(userconnectionId).SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"You have been kicked by admin: {adminUserName}.");

                await Clients.Client(Context.ConnectionId).SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has been kicked by admin: {adminUserName}.");
            }
            else
            {
                await Clients.Client(_container._adminList[userConnection.Room!])
                        .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has left the room.");
            }
            await SendConnectedUser(userConnection.Room);

        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (!_container._connections.TryGetValue(Context.ConnectionId, out UserRoomConnection roomConnection))
            {
                await base.OnDisconnectedAsync(exception);
                return;
            }
            _container._adminList.TryRemove(Context.ConnectionId, out _);


            if (roomConnection.isAdmin && roomConnection.Room != null)
            {
                _container._adminList.TryRemove(roomConnection.Room, out _);
            }

            await KickUser(roomConnection.User);

           

            await base.OnDisconnectedAsync(exception);
        }

        public Task SendConnectedUser(string room)
        {
            var users = _container._connections.Values
                .Where(u => u.Room == room)
                .Select(x => x.User);
            return Clients.Group(room).SendAsync("ConnectedUser", users);
        }

        

        public async Task SendPrivateMessageToAdmin(string user, string message)
        {
            if (_container._connections.TryGetValue(Context.ConnectionId, out UserRoomConnection userConnection))
            {
                var room = userConnection.Room;
                if (_container._adminList.TryGetValue(room, out string adminConnectionId))
                {
                    await Clients.Client(adminConnectionId).SendAsync("ReceivePrivateMessage", user, message, DateTime.Now);
                    await Clients.Client(Context.ConnectionId).SendAsync("ReceivePrivateMessage", user, message, DateTime.Now);
                }
            }
        }

        public async Task SendPrivateMessageToUser(string user, string message)
        {

            var userConnectionId = _container._connections.FirstOrDefault(c => c.Key == Context.ConnectionId); 
            await Clients.Client(Context.ConnectionId).SendAsync("ReceivePrivateMessage", $"admin->{userConnectionId.Value.User}", message, DateTime.Now);

            var connection = _container._connections.Values.FirstOrDefault(c => c.User == user);
            await Clients.Client(connection.connectionId).SendAsync("ReceivePrivateMessage", $"admin->{ userConnectionId.Value.User}", message, DateTime.Now);


        }
    }
}


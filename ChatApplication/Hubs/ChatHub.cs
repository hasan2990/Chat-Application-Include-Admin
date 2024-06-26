﻿using ChatApplication.Helper;
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
            await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room);
            userConnection.connectionId = Context.ConnectionId;
            _container._connections[Context.ConnectionId] = userConnection;

            if (userConnection.isAdmin)
            {
                _container._adminList[userConnection.Room!] = Context.ConnectionId;

                await Clients.Client(Context.ConnectionId)
                    .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} is the admin of this group.");
            }
            else
            {
                var adminConnectionId = _container._adminList.GetValueOrDefault(userConnection.Room!);
                if (adminConnectionId != null)
                {
                    await Clients.Client(adminConnectionId)
                        .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has joined the group.");
                }
            }

            await SendConnectedUser(userConnection.Room);
        }

        public async Task KickUser(string user)
        {
            var adminInfo = _container._connections[Context.ConnectionId];
            var userConnection = _container._connections.Values.FirstOrDefault(c => c.User == user && c.Room == adminInfo.Room);
            var userconnectionId = _container._connections.FirstOrDefault(c => c.Value == userConnection).Key;

            _container._connections.TryRemove(userconnectionId, out _);

            if (adminInfo.isAdmin)
            {
                string adminUserName = adminInfo.User;

                await Clients.Client(userconnectionId)
                    .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"You have been kicked by admin: {adminUserName}.");

                await Clients.Client(Context.ConnectionId)
                    .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has been kicked by admin: {adminUserName}.");
            }
            else
            {
                var adminConnectionId = _container._adminList.GetValueOrDefault(userConnection.Room);
                if (adminConnectionId != null)
                {
                    await Clients.Client(adminConnectionId)
                        .SendAsync("ReceivePrivateMessage", "Lets Program Bot", $"{userConnection.User} has left the room.");
                }
            }
            await SendConnectedUser(userConnection.Room);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_container._connections.TryGetValue(Context.ConnectionId, out UserRoomConnection roomConnection))
            {
                _container._adminList.TryRemove(Context.ConnectionId, out _);

                if (roomConnection.isAdmin && roomConnection.Room != null)
                {
                    _container._adminList.TryRemove(roomConnection.Room, out _);
                }

                await KickUser(roomConnection.User);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public Task SendConnectedUser(string room)
        {
            var users = _container._connections.Values
                .Where(u => u.Room == room)
                .Select(x => x.User);
            return Clients.Group(room).SendAsync("ConnectedUser", users);
        }

        public async Task SetMessages(Messages msg)
        {
            try
            {
                if (msg.Message.Length>0)
                {
                    var users = msg.From + msg.To;

                    ChatMessage currentMessage = new ChatMessage();

                    currentMessage.From = msg.From;
                    currentMessage.To = msg.To;
                    currentMessage.Message = msg.Message;
                    currentMessage.Timestamp = DateTime.Now;
                    if (!_container._messageHistory.ContainsKey(users))
                        _container._messageHistory[users] = new List<ChatMessage>();

                    _container._messageHistory[users].Add(currentMessage);
                }
                

                await GetMessages(msg.From!, msg.To!);
            }catch (Exception ex)
            {
                Console.WriteLine("Error "+ ex.Message);
            }

        }
        public async Task GetMessages(string from,string to)
        {

            var fromConnectionId = _container._connections.FirstOrDefault(c => c.Value.User == from).Key;
            var toConnectionId = _container._connections.FirstOrDefault(c => c.Value.User == to).Key;

            List<ChatMessage> currentMessage = new List<ChatMessage>();

            if (_container._messageHistory.ContainsKey(from + to))
            {
                currentMessage.AddRange(_container._messageHistory[from + to]);
            }
            if (_container._messageHistory.ContainsKey(to + from))
            {
                currentMessage.AddRange(_container._messageHistory[to + from]);
            }

            currentMessage = currentMessage.OrderBy(x => x.Timestamp).ToList(); 

            List<GetMessagesModel> getmessagemodels = currentMessage.Select(x => new GetMessagesModel
            {
                user = x.From,
                message = x.Message,
                messageTime = x.Timestamp
            }).ToList();

            await Clients.Client(fromConnectionId).SendAsync("ReceiveIndividualMessages", getmessagemodels);
            await Clients.Client(toConnectionId).SendAsync("ReceiveIndividualMessages", getmessagemodels);
        }
    }
}

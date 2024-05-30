using ChatApplication.Models;
using System.Collections.Concurrent;

namespace ChatApplication.Helper
{
    public class Container
    {
        public ConcurrentDictionary<string, UserRoomConnection> _connections;
        public ConcurrentDictionary<string, string> _adminList;
        public ConcurrentDictionary<string, List<ChatMessage>> _messageHistory;
        public Container()
        {
            _connections = new();
            _adminList = new();
            _messageHistory = new();
        }
    }
}

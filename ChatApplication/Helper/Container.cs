using ChatApplication.Models;
using System.Collections.Concurrent;

namespace ChatApplication.Helper
{
    public class Container
    {
        public ConcurrentDictionary<string, UserRoomConnection> _connections;
        public ConcurrentDictionary<string, string> _adminList;

        public Container()
        {
            _connections = new();
            _adminList = new();
        }
    }
}

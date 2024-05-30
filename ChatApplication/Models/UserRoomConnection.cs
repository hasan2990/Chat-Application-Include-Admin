namespace ChatApplication.Models
{
    public class UserRoomConnection
    {
        public string? User { get; set; }
        public string? Room { get; set; }
        public bool isAdmin { get; set; }
        public string connectionId { get; set; }

    }
}

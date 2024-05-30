namespace ChatApplication.Models
{
    public class ChatMessage
    {
        public string From { get; set; }
        public string To{ get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
       
    }
}

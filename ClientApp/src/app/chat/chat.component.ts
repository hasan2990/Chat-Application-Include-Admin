import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';
import { amdinToUserMessages } from '../Models/privateMessage';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  inputMessage = "";

  constructor(
    private chatService: ChatService,
    private router: Router,
  ) {}

  connectedUsers: any[] = [];
  chatmessages: amdinToUserMessages[] = [];

  adminName: any = localStorage.getItem("adminName");
  user: any = localStorage.getItem("user");
  loggedInUserName: string | null = localStorage.getItem("user");

  roomName: string | null = localStorage.getItem("room");
  isAdmin: boolean = localStorage.getItem("isAdmin") == "true";

  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  ngOnInit(): void {
    console.log(this.loggedInUserName);

    if (this.isAdmin) {
      this.router.navigate(['/admin']);
      return;
    }

    this.chatService.chatmessages$.subscribe(res => {
      this.chatmessages = res;
      console.log(res);
      console.log("chatmessages from chat component: ", this.chatmessages);
    });

    if (this.isAdmin) {
      this.chatService.connectedUsers$.subscribe(res => {
        console.log("Connected Users from chat component: ", res);
        this.connectedUsers = res;
      });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }

  sendPrivateMessageToAdmin(): void {
    this.chatService.setMessages(this.user, this.adminName, this.inputMessage)
      .then(res => {
        console.log("Message sent successfully from chat component: ", this.user, this.inputMessage);
        this.inputMessage = '';
      })
      .catch(err => {
        console.log(err);
      });
  }

  leaveChat() {
    this.chatService.leaveChat()
      .then(() => {
        this.router.navigate(['welcome']);
        setTimeout(() => {
          location.reload();
        }, 0);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

import { Component, ElementRef, OnInit, ViewChild, inject, AfterViewChecked } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  chatService = inject(ChatService);  
  router = inject(Router);
  inputMessage = "";
  user: any = localStorage.getItem("user");
  
  privateMessages: any[] = [];
  connectedUsers: any[] = [];

  loggedInUserName = localStorage.getItem("user");
  roomName = localStorage.getItem("room");
  isAdmin: boolean = localStorage.getItem("isAdmin") == "true";

  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  ngOnInit(): void {
    this.chatService.privateMessages$.subscribe(res => {
      this.privateMessages = res;
      console.log("privateMessages: ", this.privateMessages);
    });
    if(this.isAdmin){
        this.chatService.connectedUsers$.subscribe(res => {
          console.log("Connected Users: ", res);
          this.connectedUsers = res;
        });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }

  sendMessage(){
    this.chatService.sendPrivateMessageToAdmin(this.user, this.inputMessage)
      .then(res => {
        console.log("Message sent successfully: ", this.user, this.inputMessage);
        console.log(res);
        this.inputMessage = '';
      })
      .catch(err => {
        console.log(err);
      });
  }

  leaveChat(){
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

  kickUser(username: any){
    this.chatService.kickUser(username)
      .then(() => {
        console.log("User kicked successfully.");
      })
      .catch(err => {
        console.log(err);
      });
  }
}

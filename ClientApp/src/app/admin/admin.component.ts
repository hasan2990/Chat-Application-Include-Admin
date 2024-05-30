import { Component, OnInit, inject } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  chatService = inject(ChatService);
  router = inject(Router);
  user: any = localStorage.getItem("user");
  inputMessage = "";
  connectedUsers: any[] = [];
  privateMessages: any[] = []; 
  temp: any[] = [];
  loggedInUserName: string | null = localStorage.getItem("user");
  roomName: string | null = localStorage.getItem("room");
  isAdmin: boolean = localStorage.getItem("isAdmin") === "true";

  lastMessageSender: string | null = null;
  SelectedMessageSender: string | null = null;
  
  ngOnInit(): void {
    this.loadPrivateMessages();
    if (this.isAdmin) {
      this.loadConnectedUsers();
    }
  }

  private loadPrivateMessages(): void {
    this.chatService.privateMessages$.subscribe(res => {
      this.privateMessages = res;
      // if(this.SelectedMessageSender == null){
      //   this.temp = this.privateMessages;
      // }
      // else{

      //   this.temp = this.privateMessages.filter(msg => msg.user === this.SelectedMessageSender);
      //   this.temp = this.temp.filter(msg => msg.user.includes('admin'));
      // }

      console.log("privateMessages: ", this.privateMessages,this.loggedInUserName);
      const lastMessage = this.privateMessages[this.privateMessages.length - 1];
      if (lastMessage && lastMessage.user !== this.user) {
        this.lastMessageSender = lastMessage.user;
      }
    });
  }

  private loadConnectedUsers(): void {
    this.chatService.connectedUsers$.subscribe(res => {
      console.log("Connected Users res from admin: ", res);
      this.connectedUsers = res;
      console.log("Connected Users Array from admin: ", this.connectedUsers); 
    });
  }

  sendPrivateMessageToUser(): void {
    if (this.SelectedMessageSender) {
        this.chatService.sendPrivateMessageToUser(this.SelectedMessageSender, this.inputMessage)
            .then(res => {
                console.log("Message sent successfully: ", this.lastMessageSender, this.inputMessage);
                this.inputMessage = '';
            })
            .catch(err => {
                console.log(err);
            });
        
    }
  }

  replyToLastMessageSender(Selectuser : string): void {
    this.SelectedMessageSender = Selectuser;
    // this.temp = this.privateMessages.filter(msg => msg.user === this.SelectedMessageSender);
    // this.temp = this.temp.filter(msg => msg.user.includes('admin'));
    // console.log(this.temp);
    
    console.log("Reply to SelectedMessageSender: ", this.SelectedMessageSender);
    console.log("replyToLastMessageSender " + this.lastMessageSender);
    this.inputMessage = ""; 
  }

  kickUser(username: string): void {
    this.chatService.kickUser(username)
      .then(() => {
        console.log("User kicked successfully.");
        this.loadConnectedUsers(); // Refresh the user list after kicking a user
      })
      .catch(err => {
        console.log(err);
      });
  }

  leaveChat(): void {
   
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


import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  user: any = localStorage.getItem("user");
  inputMessage = "";
  connectedUsers: any[] = [];

  public chatmessages: any[] = [];
  loggedInUserName: string | null = localStorage.getItem("user");
  roomName: string | null = localStorage.getItem("room");
  isAdmin: boolean = localStorage.getItem("isAdmin") === "true";

  lastMessageSender: string | null = null;
  SelectedMessageSender: string | null = null;

  constructor(
    private chatService: ChatService,
    private router: Router,
  ){
    
  }
  ngOnInit(): void {
    this.loadPrivateMessages();
    if (this.isAdmin) {
      this.loadConnectedUsers();
    }
  }

  private loadPrivateMessages(): void {

    this.chatService.chatmessages$.subscribe(res => {
      console.log(res);
      this.chatmessages = res; // Append new messages
      console.log("chatmessages: ", this.chatmessages, this.loggedInUserName);
      
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
    console.log(this.user + " " + this.SelectedMessageSender + " " + this.inputMessage);
    this.chatService.setMessages(this.user, this.SelectedMessageSender,this.inputMessage)
      .then(messages => {
        this.chatmessages = [...this.chatmessages,messages];
        console.log(this.chatmessages);
        
        this.inputMessage = '';
      
      })
      .catch(err => {
        console.log(err);
      });
    }
    
  }

  replyToLastMessageSender(Selectuser: string): void {
    this.SelectedMessageSender = Selectuser;
    this.sendPrivateMessageToUser();
    console.log("replyToLastMessageSender called " + this.SelectedMessageSender);
    
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

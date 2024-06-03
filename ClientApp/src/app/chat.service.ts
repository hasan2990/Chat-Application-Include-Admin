import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { amdinToUserMessages } from './Models/privateMessage';
import { message } from './Models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public hubConnection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7012/chat", {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  public connectedUsers$ = new BehaviorSubject<string[]>([]);
  public privateMessages$ = new BehaviorSubject<any[]>([]);
  public chatmessages$ = new BehaviorSubject<any[]>([]);
  public connectedUsers: string[] = [];
  public privateMessages: any[] = [];
  public chatmessages: any[] = [];
  public users: string[] = [];
  public Messages: amdinToUserMessages[] = [];

  public chat: message = {
    from: "",
    to: "",
    message: "",
  };

  constructor() {
    this.start().then(() => {
      console.log("Welcome  ")
      this.hubConnection.on("ReceivePrivateMessage", (user: string, message: string, messageTime: string) => {
        console.log("received private message");
        this.privateMessages = [...this.privateMessages, { user, message, messageTime }];
        this.privateMessages$.next(this.privateMessages);
        console.log("private messages:", this.privateMessages);
      });
      
      this.hubConnection.on("ConnectedUser", (users: any) => {
        console.log("Connected");
        this.connectedUsers$.next(users);
      });
      
      this.hubConnection.on("ReceiveIndividualMessages", (msg : amdinToUserMessages[])=>{
        console.log('msg',);
        // this.Messages = [...this.Messages, ...msg];
        console.log(msg);
        // this.chatmessages = msg;
        console.log(this.chatmessages);
        this.chatmessages$.next(msg);
        console.log(this.chatmessages$);
      });
    });
    
  }

  public async start() {
    try {
      await this.hubConnection.start();
      console.log("Connection is established!")
    } catch (error) {
      console.log(error);
    }
  }

  public async joinRoom(user: string, room: string, isAdmin: boolean) {
    console.log("JoinRoom is called", user, room, isAdmin);
    return this.hubConnection.invoke('JoinRoom', { user, room, isAdmin });
  }

  // public async sendPrivateMessageToAdmin(user: string, message: string) {
  //   console.log("sendPrivateMessageToAdmin is called", user, message);
  //   return this.hubConnection.invoke('SendPrivateMessageToAdmin', user, message)
  //     .catch(err => console.error(err));
  // }

  // public async sendPrivateMessageToUser(user: string, message: string) {
  //   console.log("sendPrivateMessageToUser is called", user, message);
  //   return this.hubConnection.invoke('SendPrivateMessageToUser', user, message)
  //       .catch(err => console.error(err));
  // }

  public async leaveChat() {
    return this.hubConnection.stop();
  }

  public async kickUser(user: string) {
    console.log("kickUser is called");
    return this.hubConnection.invoke('KickUser', user)
      .catch(err => console.error(err));
  }

  public async setMessages(from:string,to:string,msg:string) {
    this.chat.from = from;
    this.chat.to = to;
    this.chat.message = msg;
    console.log("here",this.chat);
    return this.hubConnection.invoke('SetMessages',this.chat)
       .catch(err => console.error(err));
      
  }
}

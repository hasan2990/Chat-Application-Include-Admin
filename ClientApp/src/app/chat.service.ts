import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

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
  public privateMessages: any[] = [];
  public users: string[] = [];

  constructor() {
    this.start();

    this.hubConnection.on("ReceivePrivateMessage", (user: string, message: string, messageTime: string) => {
      this.privateMessages = [...this.privateMessages, { user, message, messageTime }];
      this.privateMessages$.next(this.privateMessages);
    });

    this.hubConnection.on("ConnectedUser", (users: any) => {
      this.connectedUsers$.next(users);
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

  public async sendPrivateMessageToAdmin(user: string, message: string) {
    console.log("sendPrivateMessageToAdmin is called", user, message);
    return this.hubConnection.invoke('SendPrivateMessageToAdmin', user, message)
      .catch(err => console.error(err));
  }

  public leaveChat() {
    return this.hubConnection.stop();
  }

  public kickUser(user: string): Promise<void> {
    console.log("kickUser is called");
    return this.hubConnection.invoke('KickUser', user)
      .catch(err => console.error(err));
  }
}

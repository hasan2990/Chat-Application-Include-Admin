import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  public title: string = 'Welcome to the Chat Application';
  public description: string = 'Join a room to start chatting with others. If you have admin privileges, you can manage the room and users.';
}

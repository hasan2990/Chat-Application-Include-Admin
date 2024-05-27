import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.css']
})
export class JoinRoomComponent implements OnInit {

  joinRoomForm!: FormGroup;
  isAdmin: boolean = false;
  fb = inject(FormBuilder);
  router = inject(Router);
  chatService = inject(ChatService);

  ngOnInit(): void {
    this.joinRoomForm = this.fb.group({
      user: ['', Validators.required],
      room: ['', Validators.required],
      isAdmin: [false]
    });
  }

  joinRoom(){
    console.log(this.joinRoomForm.value);
    const {user, room, isAdmin} = this.joinRoomForm.value;
    localStorage.setItem("user", user);
    localStorage.setItem("room", room);
    localStorage.setItem("isAdmin", isAdmin);
    this.chatService.joinRoom(user, room, isAdmin)
    .then(()=>{
      console.log("navigate to chat component.");
      this.router.navigate(['chat']);
    }).catch((err)=>{
      console.log(err);
    })
  }
}

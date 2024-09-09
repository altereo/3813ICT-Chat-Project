import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { ChatApiService, User, Group, Channel, Message } from '../chat-api.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  private serverID = "";
  private channelID = "";
  chatTitle = "";
  messages: Message[] = [];

  // Bind the input box so we can clear it later.
  message = "";

  // Get human friendly date from Date.now().
  getDate(date: number) {
    return(new Date(date).toLocaleString('en-GB'));
  }

  sendMessage(newMessage: string) {
    this.chatApiService.emitMessage(
      +this.serverID,
      +this.channelID,
      this.chatApiService.getUser().id,
      this.message
    );

    this.message = "";
    return;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      let path: string[] = params.get('path' as string)?.split("::") || [];
      if (path.length === 2) {
        this.serverID = path[0];
        this.channelID = path[1];

        this.chatTitle = this.chatApiService.getChatTitle(+this.serverID, +this.channelID);
        if (this.chatTitle === "") {
          this.router.navigateByUrl("/home");
        }
      }
    });

    this.chatApiService.onMessage().subscribe((data: Message) => {
      if (`${data.group}` === this.serverID && `${data.channel}` === this.channelID) {
        this.messages.push(data);
      }
    });
  }

  constructor(private router:Router, private route: ActivatedRoute, private chatApiService: ChatApiService) { }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterOutlet, Router } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { ChatApiService, Group, Channel } from '../chat-api.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbAccordionModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private userID = -1;
  groups: Observable<Group[]>;


  ngOnInit() {
    if (this.chatApiService.isLoggedIn()) {
      this.userID = this.chatApiService.getUser()?.id || -1;
      
      setTimeout(() => {
        this.chatApiService.synchroniseService();
      }, 0);

      if (this.userID !== -1) {
        this.chatApiService.getGroups(this.userID)
      }
    }
    return;
  }

  constructor (private router:Router, private chatApiService: ChatApiService) {
    this.groups = this.chatApiService.groups;
  }
}

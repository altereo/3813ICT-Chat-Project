import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { ChatApiService, User } from './chat-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  user: Observable<User>;

  isLoggedIn: boolean = false;

  title = '3813ICT-Chat';


  triggerLogout() {
    this.chatApiService.clearUser();
    this.router.navigateByUrl('/login');
    return;
  }

  ngOnInit() {
    if (!this.chatApiService.isLoggedIn()) {
      this.router.navigateByUrl("/login");
    }
    return;
  }

  constructor (private router:Router, private chatApiService: ChatApiService) {
    this.user = this.chatApiService.user;
  }
}

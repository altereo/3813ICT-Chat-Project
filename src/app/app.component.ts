import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import * as $ from 'jquery';

import { ChatApiService, User } from './chat-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, HttpClientModule, NgbPopoverModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  user: Observable<User>;
  isLoggedIn: boolean = false;

  fileInput: string = "";
  profileImage: string = "";

  title = '3813ICT-Chat';


  onFileChange(event: any) {
    let files = event.target.files as FileList;

    if (files.length > 0) {
      let _file = URL.createObjectURL(files[0]);
      this.profileImage = _file;
      this.fileInput = "";
    }
  }


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

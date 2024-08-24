import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ChatApiService } from '../chat-api.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private user: any = {};

  submitted = false;
  error = false;

  email = "";
  password = "";

  attemptLogon() {
    this.submitted = true;
    this.chatApiService.authorise(this.email, this.password);

    return;
  }

  onChange() {
    this.submitted = false;
    this.error = false;

    return;
  }

  ngOnInit() {
    this.user = this.chatApiService.user;
    this.user.subscribe((data: any) => {
      // When the BehaviourSubject has its value changed, a login attempt was made.
      if (data.valid) {
        this.router.navigateByUrl('/home');
        return;
      }

      this.error = true;
    });
    return;
  }

  constructor(private router:Router, private chatApiService:ChatApiService) {}
}

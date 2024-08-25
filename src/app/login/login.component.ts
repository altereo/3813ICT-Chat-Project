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

  loginSubmitted = false;
  loginError = false;

  registerSubmitted = false;
  registerError = false;

  username = "";
  newEmail = "";
  newPassword = "";

  email = "";
  password = "";

  attemptLogon() {
    this.loginSubmitted = true;
    this.chatApiService.authorise(this.email, this.password);

    return;
  }

  attemptCreateAccount() {
    this.registerSubmitted = true;
    this.chatApiService.createAccount(this.username, this.newEmail, this.newPassword)
    .subscribe((data: any) => {
      if (data?.status == "OK") {
        this.chatApiService.authorise(this.newEmail, this.newPassword);
        return;
      }

      this.registerError = true;
      return;
    });

    return;
  }

  onChange() {
    this.loginSubmitted = false;
    this.loginError = false;

    return;
  }

  onRegChange() {
    this.registerSubmitted = false;
    this.registerError = false;
  }

  ngOnInit() {
    this.user = this.chatApiService.user;
    this.user.subscribe((data: any) => {
      // When the BehaviourSubject has its value changed, a login attempt was made.
      if (data.valid) {
        this.router.navigateByUrl('/home');
        return;
      }

      this.loginError = true;
    });
    return;
  }

  constructor(private router:Router, private chatApiService:ChatApiService) {}
}

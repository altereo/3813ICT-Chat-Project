import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ChatApiService } from '../chat-api.service';
import { MockChatApiService } from '../../mocks/chat-api.service.mock';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, CommonModule, FormsModule, RouterTestingModule],
      providers: [Router, { provide: ChatApiService, useClass: MockChatApiService }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with correct form defaults', () => {
    expect(component.loginSubmitted).toEqual(false);
    expect(component.loginError).toEqual(false);

    expect(component.registerSubmitted).toEqual(false);
    expect(component.registerError).toEqual(false);

    expect(component.username).toEqual("");
    expect(component.newEmail).toEqual("");
    expect(component.newPassword).toEqual("");
    expect(component.email).toEqual("");
    expect(component.password).toEqual("");
  });
});

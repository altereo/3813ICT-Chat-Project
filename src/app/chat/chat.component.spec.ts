import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ChatApiService } from '../chat-api.service';
import { MockChatApiService } from '../../mocks/chat-api.service.mock';
import { of } from 'rxjs';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {
          paramMap: of({ get: () => "nil" }) // Mock parammap
        }},
        { provide: ChatApiService, useClass: MockChatApiService }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with blank Chat Title', () => {
    expect(component.chatTitle).toEqual("");
  });

  it('should start with no messages in cache', () => {
    expect(component.messages).toEqual([]);
  });

  it('should start with correct form defaults', () => {
    expect(component.message).toEqual("");
    expect(component.fileInput).toEqual("");
    expect(component.blobURL).toEqual("");
    expect(component.toUpload).toEqual(null);
  });

  it('should start scrolled to bottom of chat log', () => {
    expect(component.canScrollToBottom).toBeTruthy();
  });

  it('should start with no call running', () => {
    expect(component.viewers).toEqual([]);
    expect(component.isCallRunning).toEqual(false);
  })
});

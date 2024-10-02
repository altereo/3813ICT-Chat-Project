import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallComponent } from './call.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ChatApiService } from '../chat-api.service';
import { MockChatApiService } from '../../mocks/chat-api.service.mock';
import { of } from 'rxjs';

describe('CallComponent', () => {
  let component: CallComponent;
  let fixture: ComponentFixture<CallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {
          paramMap: of({ get: () => "nil" }) // Mock parammap
        }},
        { provide: ChatApiService, useClass: MockChatApiService }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with no call running', () => {
    expect(component.elapsedTime$.value).toEqual(0);
    expect(component.participantCount).toEqual(0);
    expect(component.remoteStreams.value).toEqual([]);
  });

  it('should start with blank chat title', () => {
    expect(component.chatTitle).toEqual("");
  });

  it('should correctly convert seconds to timestamp', () => {
    expect(component.convertTimeToString(0)).toEqual("00:00");
    expect(component.convertTimeToString(32768)).toEqual("09:06:08");
    expect(component.convertTimeToString(-1)).toEqual("-1:-1");
    expect(component.convertTimeToString(99999999999999999)).toEqual("27777777777777:46:40");
  });


});

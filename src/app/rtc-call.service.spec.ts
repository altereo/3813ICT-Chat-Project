import { TestBed } from '@angular/core/testing';

import { RtcCallService } from './rtc-call.service';
import { ChatApiService } from './chat-api.service';
import { MockChatApiService } from '../mocks/chat-api.service.mock';

describe('RtcCallService', () => {
  let service: RtcCallService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ChatApiService, useClass: MockChatApiService }]
    });
    service = TestBed.inject(RtcCallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with correct camera state', () => {
    expect(service.cameraState.video).toBeTruthy();
    expect(service.cameraState.audio).toBeTruthy();
  });

  it('should refuse to toggle video with no MediaStream', () => {
    expect(service.toggleVideo().video).toEqual(true);
  });

  it('should refuse to toggle audio with no MediaStream', () => {
    expect(service.toggleAudio().audio).toEqual(true);
  });
});

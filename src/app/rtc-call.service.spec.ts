import { TestBed } from '@angular/core/testing';

import { RtcCallService } from './rtc-call.service';

describe('RtcCallService', () => {
  let service: RtcCallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RtcCallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

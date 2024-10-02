import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ChatApiService } from './chat-api.service';

describe('ChatApiService', () => {
  let service: ChatApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });

    service = TestBed.inject(ChatApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate ID on command', () => {
    expect(service.generateID(9)).toBeDefined();
    expect(service.generateID(9)).toBeTruthy();
    expect(service.generateID(9).toString().length).toEqual(10);
  });
});

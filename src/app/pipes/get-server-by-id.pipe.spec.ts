import { TestBed } from '@angular/core/testing';
import { GetServerByIDPipe } from './get-server-by-id.pipe';
import { ChatApiService } from '../chat-api.service';
import { MockChatApiService } from '../../mocks/chat-api.service.mock';
import { ChangeDetectorRef } from '@angular/core';

describe('GetServerByIDPipe', () => {
  let pipe: GetServerByIDPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetServerByIDPipe],
      providers: [
        GetServerByIDPipe,
        ChangeDetectorRef,
        { provide: ChatApiService, useClass: MockChatApiService }
      ]
    }).compileComponents();

    pipe = TestBed.inject(GetServerByIDPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});

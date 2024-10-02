import { TestBed } from '@angular/core/testing';
import { GetUserPipe } from './get-user.pipe';
import { ChatApiService } from '../chat-api.service';
import { MockChatApiService } from '../../mocks/chat-api.service.mock';

describe('GetUserPipe', () => {
  let pipe: GetUserPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetUserPipe],
      providers: [GetUserPipe, { provide: ChatApiService, useClass: MockChatApiService }]
    }).compileComponents();

    pipe = TestBed.inject(GetUserPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});

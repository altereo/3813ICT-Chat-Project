import { TestBed } from '@angular/core/testing';
import { GetUsernameByIDPipe } from './get-username-by-id.pipe';
import { ChatApiService } from '../chat-api.service';
import { MockChatApiService } from '../../mocks/chat-api.service.mock';

describe('GetUsernameByIDPipe', () => {
  let pipe: GetUsernameByIDPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetUsernameByIDPipe],
      providers: [GetUsernameByIDPipe, { provide: ChatApiService, useClass: MockChatApiService }]
    }).compileComponents();

    pipe = TestBed.inject(GetUsernameByIDPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});

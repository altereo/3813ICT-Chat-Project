import { TestBed } from '@angular/core/testing';
import { GetRoleNoAPIPipe } from './get-role-no-api.pipe';
import { ChatApiService } from '../chat-api.service';
import { MockChatApiService } from '../../mocks/chat-api.service.mock';

describe('GetRoleNoAPIPipe', () => {
  let pipe: GetRoleNoAPIPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetRoleNoAPIPipe],
      providers: [GetRoleNoAPIPipe, { provide: ChatApiService, useClass: MockChatApiService }]
    }).compileComponents();

    pipe = TestBed.inject(GetRoleNoAPIPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});

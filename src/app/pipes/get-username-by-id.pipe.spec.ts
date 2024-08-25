import { GetUsernameByIDPipe } from './get-username-by-id.pipe';

describe('GetUsernameByIDPipe', () => {
  it('create an instance', () => {
    const pipe = new GetUsernameByIDPipe();
    expect(pipe).toBeTruthy();
  });
});

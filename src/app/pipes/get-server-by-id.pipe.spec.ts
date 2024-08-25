import { GetServerByIDPipe } from './get-server-by-id.pipe';

describe('GetServerByIDPipe', () => {
  it('create an instance', () => {
    const pipe = new GetServerByIDPipe();
    expect(pipe).toBeTruthy();
  });
});

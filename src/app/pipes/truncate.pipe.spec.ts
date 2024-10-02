import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  it('create an instance', () => {
    const pipe = new TruncatePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return string', () => {
    const pipe = new TruncatePipe();
    expect(typeof(pipe.transform("TEST", 1))).toEqual("string");
  });

  it('should reduce length correctly', () => {
    const pipe = new TruncatePipe();
    expect(pipe.transform("TESTING", 1).length).toEqual(4);
  });

  it('should append with ellipses', () => {
    const pipe = new TruncatePipe();
    expect(pipe.transform("TESTING", 1)).toContain("...");
  })
});

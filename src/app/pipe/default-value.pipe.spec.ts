import { DefaultValuePipe } from './default-value.pipe';

describe('DefaultValuePipe', () => {
  it('create an instance', () => {
    const pipe = new DefaultValuePipe();
    expect(pipe).toBeTruthy();
  });
});

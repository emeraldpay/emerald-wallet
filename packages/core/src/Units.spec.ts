import Units from './Units';

describe('Units', () => {
  it('should create from int num', () => {
    const u = new Units('123', 2);
    expect(u.amount).toEqual('123');
  });

  it('should not create from non int num', () => {
    expect(() => {
      const u = new Units('qwqwerwe', 2);
    }).toThrow();
  });
});

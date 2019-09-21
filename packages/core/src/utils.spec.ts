import { addHexPrefix, separateThousands } from './utils';

describe('addHexPrefix', () => {
  it('should work', () => {
    expect(addHexPrefix('01')).toEqual('0x01');
    expect(addHexPrefix('0x01')).toEqual('0x01');
  });
});

describe('Number formatting', () => {
  it('format number with separated thousands', () => {
    expect(separateThousands('123456789', ' ')).toEqual('123 456 789');
    expect(separateThousands('123456789', '*')).toEqual('123*456*789');
  });
});

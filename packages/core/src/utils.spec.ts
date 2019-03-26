import { addHexPrefix } from "./utils";

describe ('addHexPrefix', () => {
  it('should work', () => {
    expect(addHexPrefix('01')).toEqual('0x01');
    expect(addHexPrefix('0x01')).toEqual('0x01');
  })
});

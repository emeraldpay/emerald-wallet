import { BlockchainCode } from "./blockchains";

describe('BlockchainCode', () => {
  it('should contain codes', () => {
    expect(BlockchainCode.XSM).toEqual('xsm');
  })
});

import { BlockchainCode } from "./blockchains";

describe('BlockchainCode', () => {
  it('should contain codes', () => {
    expect(BlockchainCode.Mainet).toEqual('mainnet');
  })
});

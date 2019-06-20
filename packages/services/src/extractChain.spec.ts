import extractChain from "./extractChain";

describe('chainUtils', () => {
  it('works for eth', () => {
    expect(extractChain('eth').fullname).toEqual('Ethereum');
    expect(extractChain('ETH').fullname).toEqual('Ethereum');
  });

  it('works for etc', () => {
    expect(extractChain('etc').fullname).toEqual('Ethereum Classic');
    expect(extractChain('ETC').fullname).toEqual('Ethereum Classic');
  });

  it('works for etc as mainnet', () => {
    expect(extractChain('mainnet').fullname).toEqual('Ethereum Classic');
    expect(extractChain('Mainnet').fullname).toEqual('Ethereum Classic');
    expect(extractChain('MAINNET').fullname).toEqual('Ethereum Classic');
  });

  it('works for morden', () => {
    expect(extractChain('morden').code).toEqual('MORDEN');
    expect(extractChain('MORDEN').code).toEqual('MORDEN');
  });

});

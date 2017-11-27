/* eslint-disable max-len */
import Contract from './contract';

const abi = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    type: 'function',
  },
];


describe('Function to Data Converter', () => {
  const contract = new Contract(abi);
  const balanceArgs = { _owner: '0xbb0000000aaaa000000000000000000000000bb' };
  const transferArgs = { _to: '0xaa00000000bbbb000000000000000000000000aa', _value: 10 };

  it('convert function to data', () => {
    expect(contract.functionToData('balanceOf', balanceArgs))
      .toEqual('0x70a082310000000000000000000000000bb0000000aaaa000000000000000000000000bb');
  });

  it('convert function to data', () => {
    expect(contract.functionToData('transfer', transferArgs))
      .toEqual('0xa9059cbb000000000000000000000000aa00000000bbbb000000000000000000000000aa000000000000000000000000000000000000000000000000000000000000000a');

    expect(contract.functionToData('transfer', { _to: '0x0178537bb1d7bb412101cdb7389c28fd4cf5ac0a', _value: 100 }))
      .toEqual('0xa9059cbb0000000000000000000000000178537bb1d7bb412101cdb7389c28fd4cf5ac0a0000000000000000000000000000000000000000000000000000000000000064');

    expect(contract.functionToData('transfer', { _to: '0x0178537bb1d7bb412101cdb7389c28fd4cf5ac0a', _value: 100000000 }))
      .toEqual('0xa9059cbb0000000000000000000000000178537bb1d7bb412101cdb7389c28fd4cf5ac0a0000000000000000000000000000000000000000000000000000000005f5e100');
  });

  it('ignore bad args', () => {
    const badArgs = { _owner: '0xbb0000000aaaa000000000000000000000000bb', _elaine: 123 };
    expect(contract.functionToData('balanceOf', badArgs))
      .toEqual('0x70a082310000000000000000000000000bb0000000aaaa000000000000000000000000bb');
  });
});

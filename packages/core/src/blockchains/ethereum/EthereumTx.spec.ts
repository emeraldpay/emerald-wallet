import { convert } from '@emeraldplatform/core';
import EthereumTx from './EthereumTx';

describe('EthereumTx', () => {
  it('should decode from raw hex rlp', () => {
    const tx = EthereumTx.fromRaw('0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f', 1);
    expect(tx.getSenderAddress()).toEqual('be862AD9AbFe6f22BCb087716c7D89a26051f74C'.toLowerCase());
    expect(tx.getValue()).toEqual('0x');
    expect(tx.getRecipientAddress()).toEqual('0000000000000000000000000000000000000000');
  });

  it('should decode all fields for ordinary tx', () => {
    const tx = EthereumTx.fromRaw('0xf86c8203be85012a05f20082520894532c801e9cc47dd8b165e04d60dc4809d184ea9186c724990520008026a0757a98c3e116bf1dc3f0b2e6d6c5d42cd5e3bd7edb8385b7e31acc6aac1d67afa0616c169a9297bc04cec57be60184d9c8f524e6768a9395475548851572e031e9', 1);
    expect(tx.getRecipientAddress()).toEqual('532c801e9cc47dd8b165e04d60dc4809d184ea91');
    expect(tx.getSenderAddress()).toEqual('f39caf1020a0ca6f50c223ffef9e4437569d4801');
    expect(tx.getHash()).toEqual('0x8dfde3b5831f378da8f9fb4f708dd9543da8ffff6297976b99011e2e77389482');
    expect(convert.toNumber(tx.getValue())).toEqual(218960000000000);
  });

  it('should verify signature', () => {
    const tx = EthereumTx.fromRaw('0xf86c8203be85012a05f20082520894532c801e9cc47dd8b165e04d60dc4809d184ea9186c724990520008026a0757a98c3e116bf1dc3f0b2e6d6c5d42cd5e3bd7edb8385b7e31acc6aac1d67afa0616c169a9297bc04cec57be60184d9c8f524e6768a9395475548851572e031e9', 1);
    expect(tx.verifySignature()).toBeTruthy();
  });

});

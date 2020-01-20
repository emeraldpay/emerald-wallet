import { convert } from '@emeraldplatform/core';
import EthereumTx from './EthereumTx';

describe('EthereumTx', () => {
  it('should decode from raw hex rlp', () => {
    const tx = EthereumTx.fromRaw('0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f', 1);
    expect(tx.getSenderAddress().toString()).toEqual('0xbe862AD9AbFe6f22BCb087716c7D89a26051f74C'.toLowerCase());
    expect(tx.getValue()).toEqual('0x');
    expect(tx.getRecipientAddress().toString()).toEqual('0x0000000000000000000000000000000000000000');
  });

  it('should decode all fields for ordinary tx', () => {
    const tx = EthereumTx.fromRaw('0xf86c8203be85012a05f20082520894532c801e9cc47dd8b165e04d60dc4809d184ea9186c724990520008026a0757a98c3e116bf1dc3f0b2e6d6c5d42cd5e3bd7edb8385b7e31acc6aac1d67afa0616c169a9297bc04cec57be60184d9c8f524e6768a9395475548851572e031e9', 1);
    expect(tx.getRecipientAddress().toString()).toEqual('0x532c801e9cc47dd8b165e04d60dc4809d184ea91');
    expect(tx.getSenderAddress().toString()).toEqual('0xf39caf1020a0ca6f50c223ffef9e4437569d4801');
    expect(tx.getHash()).toEqual('0x8dfde3b5831f378da8f9fb4f708dd9543da8ffff6297976b99011e2e77389482');
    expect(convert.toNumber(tx.getValue())).toEqual(218960000000000);
  });

  it('should verify signature', () => {
    const tx = EthereumTx.fromRaw('0xf86c8203be85012a05f20082520894532c801e9cc47dd8b165e04d60dc4809d184ea9186c724990520008026a0757a98c3e116bf1dc3f0b2e6d6c5d42cd5e3bd7edb8385b7e31acc6aac1d67afa0616c169a9297bc04cec57be60184d9c8f524e6768a9395475548851572e031e9', 1);
    expect(tx.verifySignature()).toBeTruthy();
  });

  it('should return data field of tx', () => {
    const tx = EthereumTx.fromRaw('0xf8aa01850a3e9ab80083419ce094aff4481d10270f50f203e0763e2597776068cbc580b844a9059cbb00000000000000000000000027346de44a32bd9943c57a961854a1d28a9c220d0000000000000000000000000000000000000000000000000de0b6b3a76400001ca0e07cc0402d3c982a7c73cf24b14d4e2ad429854271c78d940051ea4a9be0ac48a0115964f37f5066962b132e2165b272f51f76f6321f8a43183b7ad6f23398dd56', 42);
    console.log(JSON.stringify(tx));
    expect(tx.getValue()).toEqual('0x');
    expect(tx.getData()).toEqual('a9059cbb00000000000000000000000027346de44a32bd9943c57a961854a1d28a9c220d0000000000000000000000000000000000000000000000000de0b6b3a7640000');
    expect(tx.getNonce()).toEqual(1);
  });

  it('should handle 0x nonce', () => {
    const tx = EthereumTx.fromRaw('0xf881808504e3b2920083061a80944abe410ae11835263203d4ca8ee222a38725396b8806f05b59d3b200009414ab686eb9aafea98c6b39e2b6a487d726b9486226a0425ab7faea6fac638f1677cd1e50041db9c6983638f9576021e8acc1c3256e44a0235f29b02719c4f2271c8def0cee62ffc47a2c2e1fffb1ce073532351e48d3b9', 1);
    expect(tx.getNonce()).toEqual(0);
  });

});

import * as fs from 'fs';
import { InputDataDecoder, decodeData } from './decoder';
import { abi1, abi2 } from './testing/abi';

describe('decoder', () => {
  it('should decode tx data', () => {
    const data =
      'a9059cbb00000000000000000000000027346de44a32bd99' +
      '43c57a961854a1d28a9c220d000000000000000000000000' +
      '0000000000000000000000000de0b6b3a7640000';

    const decoded = decodeData(data);

    expect(decoded.name).toEqual('transfer');
    expect(decoded.inputs[0]).toEqual('27346DE44a32Bd9943C57A961854A1D28A9c220D'.toLowerCase());
  });
});

describe('InputDataDecoder', () => {
  it('should handle nulls', () => {
    const data = [''];
    delete data[0];
    const decoder = new InputDataDecoder(abi1);
    decoder.decodeData(data[0]);
  });

  it('should decode contract call', () => {
    // https://etherscan.io/tx/0xa6f019f2fc916bd8df607f1c99148ebb06322999ff08bc88927fe8406acae1b2
    const data =
      '0x67043cae0000000000000000000000005a9dac9315fdd1' +
      'c3d13ef8af7fdfeb522db08f020000000000000000000000' +
      '000000000000000000000000000000000058a20230000000' +
      '000000000000000000000000000000000000000000000000' +
      '000040293400000000000000000000000000000000000000' +
      '000000000000000000000000a0f3df64775a2dfb6bc9e09d' +
      'ced96d0816ff5055bf95da13ce5b6c3f53b97071c8000000' +
      '000000000000000000000000000000000000000000000000' +
      '000000000342544300000000000000000000000000000000' +
      '00000000000000000000000000';

    const decoder = new InputDataDecoder(abi1);
    const result = decoder.decodeData(data);
    expect(result.name).toEqual('registerOffChainDonation');
    expect(result.types).toEqual(['address', 'uint256', 'uint256', 'string', 'bytes32']);
    expect(result.inputs[0].toString(16)).toEqual('5a9dac9315fdd1c3d13ef8af7fdfeb522db08f02');
    expect(result.inputs[1].toString(16)).toEqual('58a20230');
    expect(result.inputs[2].toString(16)).toEqual('402934');
    expect(result.inputs[3]).toEqual('BTC');
  });

  it('should decode contract creation data', () => {
    const decoder = new InputDataDecoder(abi1);

    // https://etherscan.io/tx/0xc7add41f6ae5e4fe268f654709f450983510ab7da67812be608faf2133a90b5a
    const data = fs.readFileSync(`${__dirname}/testing/contract.txt`);
    const result = decoder.decodeData(data.toString());

    expect(result.inputs[0].toString(16)).toEqual('b2cb826c945d8df01802b5cf3c4105685d4933a0');
    expect(result.inputs[1].toString(16)).toEqual('STIFTUNG Dfinity FDC');
  });

  // https://github.com/miguelmota/ethereum-input-data-decoder/issues/8
  it('256 address', () => {
    const decoder = new InputDataDecoder(abi2);

    const data =
      '0xa9059cbb85f1150654584d0192059454e9dc1532d9d9cf' +
      '914926406a02370cea80cf32f60000000000000000000000' +
      '0000000000000000000000000000000000033dc10b';

    const result = decoder.decodeData(data);
    expect(result.inputs[0].toString(16)).toEqual('e9dc1532d9d9cf914926406a02370cea80cf32f6');
    expect(result.inputs[1].toString(10)).toEqual('54378763');
  });
});

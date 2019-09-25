import { decodeData } from './decoder';

describe('decoder', () => {
  it('should decode tx data', () => {
    const decoded = decodeData('a9059cbb00000000000000000000000027346de44a32bd9943c57a961854a1d28a9c220d0000000000000000000000000000000000000000000000000de0b6b3a7640000');
    expect(decoded.name).toEqual('transfer');
    expect(decoded.inputs[0]).toEqual('27346DE44a32Bd9943C57A961854A1D28A9c220D'.toLowerCase());
  });
});

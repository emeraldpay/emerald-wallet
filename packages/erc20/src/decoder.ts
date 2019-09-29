import { InputDataDecoder } from '@emeraldplatform/core';
import abi from './abi';

const decoder = new InputDataDecoder(abi);

export function decodeData (data: any): any {
  return decoder.decodeData(data);
}

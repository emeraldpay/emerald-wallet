import { BlockchainCode } from '@emeraldwallet/core';

export function blockchainCodeToId (code: BlockchainCode): number {
  if (code === BlockchainCode.ETH) {
    return 100;
  }
  if (code === BlockchainCode.ETC) {
    return 101;
  }
  if (code === BlockchainCode.Kovan) {
    return 10002;
  }
  throw Error('Unsupported blockchain: ' + code);
}

export function blockchainIdToCode (id: number): BlockchainCode {
  if (id === 100) {
    return BlockchainCode.ETH;
  }
  if (id === 101) {
    return BlockchainCode.ETC;
  }
  if (id === 10002) {
    return BlockchainCode.Kovan;
  }
  throw Error('Unsupported blockchain id: ' + id);
}

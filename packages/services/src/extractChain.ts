import { chainByCode, ChainSpec } from '@emeraldpay/grpc-client';

export default function extractChain (chain: string): ChainSpec {
  if (chain.toLowerCase() === 'mainnet') {
    chain = 'etc';
  }
  return chainByCode(chain);
}

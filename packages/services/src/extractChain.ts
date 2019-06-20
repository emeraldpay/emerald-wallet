import {chainByCode, ChainSpec} from "@emeraldplatform/grpc";

export default function extractChain(chain: string): ChainSpec {
  if (chain.toLowerCase() === 'mainnet') {
    chain = 'etc';
  }
  return chainByCode(chain);
}
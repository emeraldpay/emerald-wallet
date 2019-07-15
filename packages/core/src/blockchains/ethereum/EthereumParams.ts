import BlockchainParams from '../BlockchainParams';
import {BlockchainCode} from "../blockchains";

class EthereumParams implements BlockchainParams {
  decimals: number = 18;
  coinTicker: string;
  chainId: number;
  hdPath: string;
  code: BlockchainCode;

  constructor(code: BlockchainCode, coinTicker: string, chainId: number, hdPaths: string) {
    this.code = code;
    this.coinTicker = coinTicker;
    this.chainId = chainId;
    this.hdPath = hdPaths;
  }
}

export default EthereumParams;

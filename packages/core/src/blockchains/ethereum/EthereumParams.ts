import IBlockchainParams from '../IBlockchainParams';
import { BlockchainCode } from '../blockchains';

class EthereumParams implements IBlockchainParams {
  public decimals: number = 18;
  public coinTicker: string;
  public chainId: number;
  public hdPath: string;
  public code: BlockchainCode;

  constructor (code: BlockchainCode, coinTicker: string, chainId: number, hdPaths: string) {
    this.code = code;
    this.coinTicker = coinTicker;
    this.chainId = chainId;
    this.hdPath = hdPaths;
  }
}

export default EthereumParams;

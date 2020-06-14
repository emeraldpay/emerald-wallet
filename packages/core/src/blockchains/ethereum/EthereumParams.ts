import { AnyCoinCode, AnyTokenCode } from '../../Asset';
import { BlockchainCode } from '../blockchains';
import { CoinTicker } from '../CoinTicker';
import IBlockchainParams from '../IBlockchainParams';
import {HDPath} from "../hdpath";

class EthereumParams implements IBlockchainParams {
  public decimals: number = 18;
  public coinTicker: AnyCoinCode;
  public chainId: number;
  public hdPath: HDPath;
  public code: BlockchainCode;

  constructor(code: BlockchainCode, coinTicker: AnyCoinCode, chainId: number, hdPath: HDPath) {
    this.code = code;
    this.coinTicker = coinTicker;
    this.chainId = chainId;
    this.hdPath = hdPath;
  }
}

export default EthereumParams;

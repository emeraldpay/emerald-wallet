import { BlockchainCode } from '../blockchains';
import IBlockchainParams from '../IBlockchainParams';
import {CoinTicker} from "../CoinTicker";
import {AnyCoinCode, AnyTokenCode} from "../../Asset";

class EthereumParams implements IBlockchainParams {
  public decimals: number = 18;
  public coinTicker: AnyCoinCode;
  public chainId: number;
  public hdPath: string;
  public code: BlockchainCode;

  constructor (code: BlockchainCode, coinTicker: AnyCoinCode, chainId: number, hdPaths: string) {
    this.code = code;
    this.coinTicker = coinTicker;
    this.chainId = chainId;
    this.hdPath = hdPaths;
  }
}

export default EthereumParams;

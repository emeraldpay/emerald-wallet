import { BlockchainCode } from '../blockchains';
import { CoinCode } from '../coin';
import { CoinTicker } from '../coinTicker';
import { HDPath } from '../HDPath';
import IBlockchainParams from '../IBlockchainParams';

export class EthereumParams implements IBlockchainParams {
  public readonly decimals = 18;

  chainId: number;
  code: BlockchainCode;
  coin: CoinCode;
  coinTicker: CoinTicker;
  confirmations: number;
  eip1559: boolean;
  hdPath: HDPath;

  constructor(
    code: BlockchainCode,
    coin: CoinCode,
    coinTicker: CoinTicker,
    chainId: number,
    hdPath: HDPath,
    confirmations: number,
    eip1559 = false,
  ) {
    this.code = code;
    this.coin = coin;
    this.coinTicker = coinTicker;
    this.chainId = chainId;
    this.hdPath = hdPath;
    this.confirmations = confirmations;
    this.eip1559 = eip1559;
  }
}

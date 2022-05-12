import { AnyCoinCode } from '../../Asset';
import { BlockchainCode } from '../blockchains';
import { HDPath } from '../hdpath';
import IBlockchainParams from '../IBlockchainParams';

class EthereumParams implements IBlockchainParams {
  public readonly decimals = 18;

  public code: BlockchainCode;
  public coinTicker: AnyCoinCode;
  public chainId: number;
  public hdPath: HDPath;
  public confirmations: number;
  public eip1559: boolean;

  constructor(
    code: BlockchainCode,
    coinTicker: AnyCoinCode,
    chainId: number,
    hdPath: HDPath,
    confirmations: number,
    eip1559 = false,
  ) {
    this.code = code;
    this.coinTicker = coinTicker;
    this.chainId = chainId;
    this.hdPath = hdPath;
    this.confirmations = confirmations;
    this.eip1559 = eip1559;
  }
}

export default EthereumParams;

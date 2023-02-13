import { BlockchainCode } from './blockchains';
import { CoinCode } from './coin';
import { CoinTicker } from './coinTicker';
import { HDPath } from './HDPath';

/**
 * Parameters of particular blockchain
 */
export default interface IBlockchainParams {
  chainId: number;
  code: BlockchainCode;
  coin: CoinCode;
  coinTicker: CoinTicker;
  confirmations: number;
  decimals: number;
  eip1559?: boolean;
  hdPath: HDPath;
}

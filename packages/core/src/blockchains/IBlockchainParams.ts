import { BlockchainCode } from './blockchains';
import { CoinTicker } from './CoinTicker';
import { HDPath } from './HDPath';

/**
 * Parameters of particular blockchain
 */
export default interface IBlockchainParams {
  chainId: number;
  code: BlockchainCode;
  coinTicker: CoinTicker;
  confirmations: number;
  decimals: number;
  eip1559?: boolean;
  hdPath: HDPath;
}

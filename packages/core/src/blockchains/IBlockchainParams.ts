/**
 * Parameters of particular blockchain
 */
import { BlockchainCode } from './blockchains';

export default interface IBlockchainParams {
  decimals: number;
  coinTicker: string;
  chainId: number;
  hdPath: string;
  code: BlockchainCode;
}

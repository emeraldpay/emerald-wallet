/**
 * Parameters of particular blockchain
 */
import { AnyCoinCode } from '../Asset';
import { BlockchainCode } from './blockchains';

export default interface IBlockchainParams {
  decimals: number;
  coinTicker: AnyCoinCode;
  chainId: number;
  hdPath: string;
  code: BlockchainCode;
}

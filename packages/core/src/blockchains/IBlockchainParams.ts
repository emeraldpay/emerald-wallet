/**
 * Parameters of particular blockchain
 */
import { BlockchainCode } from './blockchains';
import {AnyCoinCode} from "../Asset";

export default interface IBlockchainParams {
  decimals: number;
  coinTicker: AnyCoinCode;
  chainId: number;
  hdPath: string;
  code: BlockchainCode;
}

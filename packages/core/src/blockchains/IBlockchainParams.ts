/**
 * Parameters of particular blockchain
 */
import { AnyCoinCode } from '../Asset';
import {BlockchainCode} from './blockchains';
import {HDPath} from "./hdpath";

export default interface IBlockchainParams {
  decimals: number;
  coinTicker: AnyCoinCode;
  chainId: number;
  hdPath: HDPath;
  code: BlockchainCode;
  confirmations: number;
}

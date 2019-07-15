/**
 * Parameters of particular blockchain
 */
import {BlockchainCode} from "./blockchains";

export default interface BlockchainParams {
  decimals: number;
  coinTicker: string;
  chainId: number;
  hdPath: string;
  code: BlockchainCode;
}

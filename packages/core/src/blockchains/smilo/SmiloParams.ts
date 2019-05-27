import {BlockchainParams} from '../types';

class SmiloParams implements BlockchainParams {
  decimals: number = 18;
  tokenSymbol: string = "XSM";

}

export default SmiloParams;

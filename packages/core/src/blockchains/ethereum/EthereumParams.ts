import {BlockchainParams} from '../types';

class EthereumParams implements BlockchainParams {
  decimals: number = 18;
  tokenSymbol: string = "ETH";

}

export default EthereumParams;

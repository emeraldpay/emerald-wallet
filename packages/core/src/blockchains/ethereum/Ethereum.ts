import {EthAddress} from '@emeraldplatform/core';
import {Blockchain} from "../Blockchain";
import {BlockchainParams} from "../types";
import EthereumParams from './EthereumParams';

export default class Ethereum implements Blockchain {
  params: BlockchainParams = new EthereumParams();

  isValidAddress(address: string): boolean {
    return EthAddress.fromHexString(address).isValid();
  }
}
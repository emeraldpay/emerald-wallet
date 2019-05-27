import {EthAddress} from '@emeraldplatform/core';
import {Blockchain} from "../Blockchain";
import {BlockchainParams} from "../types";
import SmiloParams from './SmiloParams';

export default class Smilo implements Blockchain {
  params: BlockchainParams = new SmiloParams();

  isValidAddress(address: string): boolean {
    return EthAddress.fromHexString(address).isValid();
  }
}

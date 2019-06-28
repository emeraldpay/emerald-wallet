import {EthAddress} from '@emeraldplatform/core';
import {Blockchain} from "../Blockchain";
import {BlockchainParams} from "../types";

export default class Ethereum implements Blockchain {
  params: BlockchainParams;
  title: string;

  constructor(params: BlockchainParams, title: string) {
    this.params = params;
    this.title = title;
  }

  isValidAddress(address: string): boolean {
    return EthAddress.fromHexString(address).isValid();
  }

  getTitle(): string {
    return this.title;
  }
}
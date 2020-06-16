import {BlockchainCode} from "@emeraldwallet/core";
import {Uuid} from "@emeraldpay/emerald-vault-core";

export enum SeedType {
  SELECTED,
  GENERATE
}

export interface SeedSelected {
  type: SeedType.SELECTED,
  id: string
}

export interface SeedGenerated {
  type: SeedType.GENERATE,
  mnemonic?: string,
  password?: string
}

export interface SeedUnlock {
  id: Uuid,
  password: string
}

export type SeedResult = SeedSelected | SeedGenerated | 'empty';

export function isSeedSelected(obj: SeedResult): obj is SeedSelected {
  return typeof obj == 'object' && obj.type == SeedType.SELECTED
}

export function isSeedGenerate(obj: SeedResult): obj is SeedGenerated {
  return typeof obj == 'object' && obj.type == SeedType.GENERATE
}

export interface TWalletOptions {
  label?: string
}

export interface Result {
  type: SeedResult;
  options: TWalletOptions;
  blockchains: BlockchainCode[];
  seedAccount?: number;
  unlock?: SeedUnlock
}

export function defaultResult(): Result {
  return {
    type: 'empty',
    options: {},
    blockchains: []
  }
}

export interface StepDescription {
  title: string;
  code: string;
}

export interface StepDetails {
  index: number;
  code: string;
}
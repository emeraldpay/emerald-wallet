import {BlockchainCode} from "@emeraldwallet/core";

export interface SeedSelected {
  id: string
}

export type SeedResult = SeedSelected | 'create-seed' | 'import-seed' | 'import-key' | 'empty';

export function isSeedSelected(obj: SeedResult): obj is SeedSelected {
  return typeof obj == 'object'
}

export interface TWalletOptions {
  label?: string
}

export interface Result {
  type: SeedResult;
  options: TWalletOptions;
  blockchains: BlockchainCode[];
  seedAccount?: number;
  seedPassword?: string;
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
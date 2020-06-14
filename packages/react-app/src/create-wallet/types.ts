import {BlockchainCode} from "@emeraldwallet/core";

export type SeedSelected = {
  id: string
}

export type SeedResult = SeedSelected | 'create-seed' | 'import-seed' | 'import-key' | 'empty';

export function isSeedSelected(obj: SeedResult): obj is SeedSelected {
  return typeof obj == 'object'
}

export type TWalletOptions = {
  label?: string
}

export type Result = {
  type: SeedResult,
  options: TWalletOptions,
  blockchains: BlockchainCode[],
  seedAccount?: number,
  seedPassword?: string
}

export function defaultResult(): Result {
  return {
    type: 'empty',
    options: {},
    blockchains: []
  }
}
import { SeedReference, Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { HDPathAddresses, HDPathIndexes } from '@emeraldwallet/store';

export enum KeySourceType {
  LEDGER,
  PK_ANY,
  PK_RAW,
  PK_WEB3_JSON,
  SEED_GENERATE,
  SEED_IMPORT,
  SEED_SELECTED,
}

export interface SeedSelected {
  type: KeySourceType.SEED_SELECTED;
  id: string;
}

export interface SeedCreate {
  type: KeySourceType.SEED_GENERATE | KeySourceType.SEED_IMPORT;
  mnemonic?: string;
  password?: string;
}

export interface PkImportAny {
  type: KeySourceType.PK_ANY;
}

export interface PkImportRaw {
  type: KeySourceType.PK_RAW;
  pk: string;
  password: string;
}

export interface PkImportJson {
  type: KeySourceType.PK_WEB3_JSON;
  json: string;
  jsonPassword: string;
  password: string;
}

export interface LedgerSeed {
  type: KeySourceType.LEDGER;
  // undefined if not yet created, i.e. first use
  id?: Uuid;
}

export type KeysSource =
  | SeedSelected
  | SeedCreate
  | PkImportJson
  | PkImportRaw
  | PkImportAny
  | LedgerSeed
  | 'start-ledger';

export function isSeedSelected(source: KeysSource): source is SeedSelected {
  return typeof source === 'object' && source.type == KeySourceType.SEED_SELECTED;
}

export function isSeedCreate(source: KeysSource): source is SeedCreate {
  return (
    typeof source === 'object' &&
    (source.type == KeySourceType.SEED_GENERATE || source.type == KeySourceType.SEED_IMPORT)
  );
}

export function isPk(source: KeysSource): source is PkImportRaw | PkImportJson {
  return (
    typeof source === 'object' &&
    (source.type === KeySourceType.PK_WEB3_JSON ||
      source.type === KeySourceType.PK_RAW ||
      source.type === KeySourceType.PK_ANY)
  );
}

export function isLedger(source: KeysSource): source is LedgerSeed {
  return typeof source === 'object' && source.type === KeySourceType.LEDGER;
}

export function isLedgerStart(source: KeysSource): boolean {
  return typeof source === 'string' && source === 'start-ledger';
}

export function isPkJson(obj: KeysSource): obj is PkImportJson {
  return isPk(obj) && obj.type === KeySourceType.PK_WEB3_JSON;
}

export function isPkRaw(obj: KeysSource): obj is PkImportRaw {
  return isPk(obj) && obj.type === KeySourceType.PK_RAW;
}

export interface Options {
  label?: string;
}

export interface Result {
  addresses?: HDPathAddresses;
  blockchains: BlockchainCode[];
  indexes?: HDPathIndexes;
  options: Options;
  seed?: SeedReference;
  seedAccount?: number;
  type: KeysSource;
}

export function defaultResult(): Result {
  return {
    addresses: {},
    blockchains: [],
    options: {},
    type: {
      type: KeySourceType.SEED_GENERATE,
    },
  };
}

export interface StepDescription {
  code: string;
  title: string;
}

export interface StepDetails {
  code: string;
  index: number;
}

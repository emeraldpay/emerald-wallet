import {BlockchainCode} from "@emeraldwallet/core";
import {SeedReference, Uuid} from "@emeraldpay/emerald-vault-core";

export enum KeySourceType {
  SEED_SELECTED,
  SEED_GENERATE,
  SEED_IMPORT,
  PK_ANY,
  PK_WEB3_JSON,
  PK_RAW,
  LEDGER
}

export interface SeedSelected {
  type: KeySourceType.SEED_SELECTED,
  id: string
}

export interface SeedCreate {
  type: KeySourceType.SEED_GENERATE | KeySourceType.SEED_IMPORT,
  mnemonic?: string,
  password?: string
}

export interface PkImportAny {
  type: KeySourceType.PK_ANY
}

export interface PkImportRaw {
  type: KeySourceType.PK_RAW;
  pk: string;
  password: string;
}

export interface PkImportJson {
  type: KeySourceType.PK_WEB3_JSON;
  json: string;
}

export interface LedgerSeed {
  type: KeySourceType.LEDGER;
  // undefined if not yet created, i.e. first use
  id?: Uuid;
}

export type KeysSource =
  SeedSelected
  | SeedCreate
  | PkImportJson
  | PkImportRaw
  | PkImportAny
  | 'empty'
  | 'start-ledger'
  | LedgerSeed;

export function isSeedSelected(obj: KeysSource): obj is SeedSelected {
  return typeof obj == 'object' && obj.type == KeySourceType.SEED_SELECTED
}

export function isSeedCreate(obj: KeysSource): obj is SeedCreate {
  return typeof obj == 'object' && (obj.type == KeySourceType.SEED_GENERATE || obj.type == KeySourceType.SEED_IMPORT)
}

export function isPk(obj: KeysSource): obj is (PkImportRaw | PkImportJson) {
  return typeof obj == 'object' && (
    obj.type == KeySourceType.PK_WEB3_JSON || obj.type == KeySourceType.PK_RAW || obj.type == KeySourceType.PK_ANY
  );
}

export function isLedger(obj: KeysSource): obj is LedgerSeed {
  return typeof obj == "object" && obj.type == KeySourceType.LEDGER;
}

export function isLedgerStart(obj: KeysSource): boolean {
  return typeof obj == "string" && obj == "start-ledger";
}

export function isPkJson(obj: KeysSource): obj is PkImportJson {
  return isPk(obj) && obj.type == KeySourceType.PK_WEB3_JSON;
}

export function isPkRaw(obj: KeysSource): obj is PkImportRaw {
  return isPk(obj) && obj.type == KeySourceType.PK_RAW;
}

export interface TWalletOptions {
  label?: string
}

export interface Result {
  type: KeysSource;
  options: TWalletOptions;
  blockchains: BlockchainCode[];
  seedAccount?: number;
  seed?: SeedReference;
  addresses?: Partial<Record<BlockchainCode, string>>;
}

export function defaultResult(): Result {
  return {
    type: 'empty',
    options: {},
    blockchains: [],
    addresses: {},
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
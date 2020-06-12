export type SeedSelected = {
  id: string
}

export type SeedResult = SeedSelected | 'create-seed' | 'import-seed' | 'import-key' | 'empty';


export type CreateEmpty = {}

export type TWalletOptions = {
  label?: string
}

export type Result = {
  type: CreateEmpty,
  options: TWalletOptions
}

export function defaultResult(): Result {
  return {
    type: 'empty',
    options: {}
  }
}
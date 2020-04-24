import { IState } from '../types';
import { moduleName } from './types';

export function getMessage (state: any): any {
  return state[moduleName].message;
}

export function isConnecting (state: any): boolean {
  return state[moduleName].connecting;
}

export function terms (state: IState): string {
  return state[moduleName].terms;
}

export function isConfigured (state: any): boolean {
  return state[moduleName].configured;
}

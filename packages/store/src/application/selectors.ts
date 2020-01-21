import { moduleName } from './types';

export function getMessage (state: any): any {
  return state[moduleName].get('message').toJSON();
}

export function isConnecting (state: any): boolean {
  return state[moduleName].get('connecting');
}

export function terms (state: any): string {
  return state[moduleName].get('terms');
}

export function isConfigured (state: any): boolean {
  return state[moduleName].get('configured');
}

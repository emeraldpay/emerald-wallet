import { TokenData } from '@emeraldwallet/core';
import fetch from 'node-fetch';
import { tokens as defaults } from '../../../defaults.json';

export default async function (appVersion: string, stored: TokenData[]): Promise<TokenData[]> {
  const response = await fetch(
    `https://updates.emerald.cash/tokens.json?ref_app=desktop-wallet&ref_version=${appVersion}`,
  );

  if (response.status === 200) {
    const tokens = (await response.json()) as TokenData[];

    const merged = [...tokens, ...stored]
      .reduce((carry, token) => {
        const key = `${token.blockchain}:${token.address}`;

        if (carry.has(key)) {
          return carry;
        }

        return carry.set(key, token);
      }, new Map())
      .values();

    return [...defaults, ...merged] as TokenData[];
  }

  if (stored.length > 0) {
    return stored;
  }

  return defaults as TokenData[];
}

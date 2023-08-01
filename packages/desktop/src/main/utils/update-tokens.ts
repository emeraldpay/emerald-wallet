import { Logger, TokenData } from '@emeraldwallet/core';
import fetch from 'node-fetch';
import { tokens as defaults } from '../../../defaults.json';

type Updated = { changed: boolean; tokens: TokenData[] };

const { NODE_ENV } = process.env;

const HOST: Readonly<string> =
  NODE_ENV === 'development' || NODE_ENV === 'verifying' ? 'cdn.emeraldpay.dev' : 'updates.emerald.cash';

const log = Logger.forCategory('Store::UpdateTokens');

export default async function (appVersion: string, stored: TokenData[]): Promise<Updated> {
  const response = await fetch(`https://${HOST}/tokens-v2.json?ref_app=desktop-wallet&ref_version=${appVersion}`);

  if (response.status === 200) {
    try {
      const tokens = (await response.json()) as TokenData[];

      const addresses = stored.map(({ address }) => address.toLowerCase());

      if (tokens.reduce((carry, { address }) => carry || !addresses.includes(address.toLowerCase()), false)) {
        const merged: Map<string, TokenData> = [...tokens, ...stored].reduce((carry, token) => {
          const key = `${token.blockchain}:${token.address.toLowerCase()}`;

          if (carry.has(key)) {
            return carry;
          }

          return carry.set(key, token);
        }, new Map());

        return { changed: true, tokens: [...merged.values()] };
      }
    } catch (exception) {
      log.error('Error while parsing tokens update from server:', exception);
    }
  }

  if (stored.length > 0) {
    return { changed: false, tokens: stored };
  }

  return { changed: true, tokens: defaults as TokenData[] };
}

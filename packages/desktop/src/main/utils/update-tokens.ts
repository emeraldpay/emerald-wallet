import { Logger, TokenData } from '@emeraldwallet/core';
import fetch from 'node-fetch';
import { tokens as defaults } from '../../../defaults.json';
import {isBlockchainId} from "@emeraldwallet/core";

type Updated = { changed: boolean; tokens: TokenData[] };

const { NODE_ENV } = process.env;

const HOST: Readonly<string> =
  NODE_ENV === 'development' || NODE_ENV === 'verifying' ? 'cdn.emeraldpay.dev' : 'updates.emerald.cash';

const log = Logger.forCategory('Store::UpdateTokens');

export default async function (appVersion: string, stored: TokenData[]): Promise<Updated> {
  let remoteTokens: TokenData[] = [];

  const response = await fetch(`https://${HOST}/tokens-v2.json?ref_app=desktop-wallet&ref_version=${appVersion}`);
  if (response.status === 200) {
    try {
      remoteTokens = (await response.json()) as TokenData[];
    } catch (exception) {
      log.error('Error while parsing tokens update from server:', exception);
    }
  }

  // @ts-ignore
  const defaultTokens: TokenData[] = defaults;

  // merge all sources, because a new token may be added at the remote server, or also added to the defaults, etc.
  const merged: Map<string, TokenData> = [...remoteTokens, ...stored, ...defaultTokens]
    // make sure it has only token for blockchain that the current app version supports
    .filter((token) => isBlockchainId(token.blockchain))
    // keep all tokens defined at any of the sources
    .reduce((carry, token) => {
      const key = `${token.blockchain}:${token.address.toLowerCase()}`;
      // this order ensure the priority, the first defined token will be kept
      if (carry.has(key)) {
        return carry;
      }
      return carry.set(key, token);
    }, new Map());

  return { changed: true, tokens: [...merged.values()] }
}

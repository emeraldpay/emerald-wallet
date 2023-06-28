import { AnyCurrency, GetRatesRequest, isErc20Asset } from '@emeraldpay/api';
import { MarketClient } from '@emeraldpay/api-node';
import { Logger } from '@emeraldwallet/core';

export type PriceHandler = (prices: { [key: string]: string }) => void;

const log = Logger.forCategory('PricesListener');

export class PriceListener {
  readonly client: MarketClient;

  constructor(client: MarketClient) {
    this.client = client;
  }

  request(from: AnyCurrency[], to: AnyCurrency, handler: PriceHandler): void {
    const request: GetRatesRequest = from.map((from) => ({ base: from, target: to }));

    this.client
      .getRates(request)
      .then((response) => {
        const result: { [key: string]: string } = {};

        response.forEach(({ base, rate }) => {
          const key = isErc20Asset(base) ? `${base.blockchain}:${base.contractAddress}` : base;

          result[key] = rate;
        });

        handler(result);
      })
      .catch((error) => log.error('Error getting prices', error));
  }
}

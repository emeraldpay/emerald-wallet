import { AnyCurrency, GetRatesRequest } from '@emeraldpay/api';
import { MarketClient } from '@emeraldpay/api-node';

export type PriceHandler = (prices: { [key: string]: string }) => void;

export class PriceListener {
  public client: MarketClient;

  constructor(client: MarketClient) {
    this.client = client;
  }

  request(from: AnyCurrency[], to: AnyCurrency, handler: PriceHandler): void {
    const request: GetRatesRequest = from.map((from) => ({ base: from, target: to }));

    this.client
      .getRates(request)
      .then((response) => {
        const result: { [key: string]: string } = {};

        response.forEach((item) => {
          if (item.target === to && from.indexOf(item.base) >= 0) {
            result[item.base] = item.rate;
          }
        });

        handler(result);
      })
      .catch((error) => console.error('Error getting prices', error));
  }
}

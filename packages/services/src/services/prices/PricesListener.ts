import {MarketClient} from '@emeraldpay/api-node';
import {GetRatesRequest, AnyCurrency} from "@emeraldpay/api";

export type PriceHandler = (prices: { [key: string]: string }) => void;

export class PriceListener {
  public client: MarketClient;

  constructor(client: MarketClient) {
    this.client = client;
  }

  public stop() {
  }

  public request(froms: AnyCurrency[], to: AnyCurrency, handler: PriceHandler) {
    const request: GetRatesRequest = [];
    froms.forEach((from) => {
      request.push({
        base: from,
        target: to
      });
    });

    this.client.getRates(request).then((resp) => {
      if (handler) {
        const result: { [key: string]: string } = {};
        resp.forEach((item) => {
          if (item.target === to && froms.indexOf(item.base) >= 0) {
            result[item.base] = item.rate;
          }
        });
        handler(result);
      }
    }).catch((err) => {
      console.error("Error getting prices", err)
    });
  }
}

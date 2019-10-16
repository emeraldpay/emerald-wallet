import {
  ClientReadable, GetRatesRequest, GetRatesResponse, MarketClient,
  Pair,
  Rate
} from '@emeraldpay/grpc-client';

export type PriceHandler = (prices: {[key: string]: string}) => void;

export class PriceListener {
  public client: MarketClient;
  public response?: ClientReadable<GetRatesResponse>;

  constructor (client: MarketClient) {
    this.client = client;
  }

  public stop () {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  public request (froms: string[], to: string, handler: PriceHandler) {
    const request = new GetRatesRequest();
    froms.forEach((from) => {
      const pair = new Pair();
      pair.setBase(from);
      pair.setTarget(to);
      request.addPairs(pair);
    });

    this.client.getRates(request).then((resp) => {
      if (handler) {
        const result: {[key: string]: string} = {};
        resp.getRatesList().forEach((item) => {
          if (item.getTarget() === to && froms.indexOf(item.getBase()) >= 0) {
            result[item.getBase()] = item.getRate();
          }
        });
        handler(result);
      }
    }).catch((_) => {});
  }
}

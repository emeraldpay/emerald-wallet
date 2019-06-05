import {
  GetRateReply, GetRateRequest,
  MarketClient,
} from "@emeraldplatform/grpc";
import {ClientReadableStream} from "grpc";
import * as grpc from "grpc";

export type PriceHandler = (prices: {[key: string]: string}) => void;

export class PriceListener {
  client: MarketClient;
  response?: ClientReadableStream<GetRateReply>;

  constructor(client: MarketClient) {
    this.client = client;
  }

  stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  subscribe(froms: string[], to: string, handler: PriceHandler) {
    const request = new GetRateRequest();
    froms.forEach((from) => request.addFrom(from));
    request.setTo(to);

    this.client.streamRates(request, (response: grpc.ClientReadableStream<GetRateReply>) => {
      response.on('data', (data: GetRateReply) => {
        if (handler) {
          const result: {[key: string]: string} = {};
          data.getItemsList().forEach((item) => {
            if (item.getTo() === to && froms.indexOf(item.getFrom()) >= 0) {
              result[item.getFrom()] = item.getRate();
            }
          });
          handler(result)
        }
      });
      response.on('end', () => {
      });
      response.on('error', (err) => {
        console.warn("response error", err)
      });
      this.response = response;
    });
  }
}
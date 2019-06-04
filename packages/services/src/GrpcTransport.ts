import {JsonRpcRequest, Transport} from '@emeraldplatform/rpc';
import {
  // @ts-ignore
  BlockchainClient,
  CallBlockchainRequest,
  CallBlockchainItem,
  CallBlockchainReplyItem,
  ChainSpec, chainByCode,
} from '@emeraldplatform/grpc';
import { TextEncoder, TextDecoder } from 'text-encoding';
import {ServiceError} from "grpc";

const decoder =  new TextDecoder('utf-8');
const encoder = new TextEncoder();

/**
 * It should be used for request/response trace in dev version
 */
class GrpcTransport implements Transport {
  client: BlockchainClient;
  chain: ChainSpec;

  constructor(chain: string, client: BlockchainClient) {
    this.client = client;
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chainByCode(chain.toUpperCase());
  }
  request(req: Array<JsonRpcRequest>): Promise<Array<any>> {
    const request = new CallBlockchainRequest();
    request.setChain(this.chain.id);
    req.forEach((json) => {
      const item = new CallBlockchainItem();
      item.setId(json.id);
      item.setName(json.method);
      item.setPayload(encoder.encode(JSON.stringify(json.params)));
      request.addItems(item);
    });

    return new Promise((resolve, reject) => {
      this.client.nativeCall(request,(response) => {
        const result: Array<any> = [];
        response.on('data', (data: CallBlockchainReplyItem) => {
          const bytes: Uint8Array = data.getPayload_asU8();
          let json = JSON.parse(decoder.decode(bytes));
          result.push(json);
        });
        response.on('end', () => {
          resolve(result);
        });
        response.on('error', (err: ServiceError) => {
          reject(err)
        })
      });
    });
  }
}

export default GrpcTransport;

import {JsonRpcRequest, Transport} from '@emeraldplatform/rpc';
import {
  credentials,
  // @ts-ignore
  BlockchainClientPb as BlockchainClient,
  CallBlockchainRequest,
  CallBlockchainItem,
  CallBlockchainReplyItem,
  ChainSpec, chainByCode
} from '@emeraldplatform/grpc';
import { TextEncoder, TextDecoder } from 'text-encoding';
import {ServiceError} from "grpc";

/**
 * It should be used for request/response trace in dev version
 */
class GrpcTransport implements Transport {
  client: BlockchainClient;
  chain: ChainSpec;

  constructor(chain: string, host: string) {
    const cred = credentials.createInsecure();
    this.client = new BlockchainClient(host, cred);
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chainByCode(chain.toUpperCase());
  }
  request(req: Array<JsonRpcRequest>): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      const request = new CallBlockchainRequest();
      request.setChain(this.chain.id);
      req.forEach((json) => {
        const item = new CallBlockchainItem();
        item.setId(json.id);
        item.setName(json.method);
        item.setPayload(new TextEncoder().encode(JSON.stringify(json.params)));
        request.addItems(item);
      });
      const response = this.client.call(request);
      const decoder =  new TextDecoder('utf-8');
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
  }
}

export default GrpcTransport;

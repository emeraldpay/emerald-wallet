import {
  // @ts-ignore
  BlockchainClient,
  chainByCode,
  ChainSpec,
  NativeCallItem,
  NativeCallReplyItem, NativeCallRequest
} from '@emeraldpay/grpc-client';
import { JsonRpcRequest, Transport } from '@emeraldplatform/rpc';
import { ServiceError } from 'grpc';
import { TextDecoder, TextEncoder } from 'text-encoding';

const decoder = new TextDecoder('utf-8');
const encoder = new TextEncoder();

/**
 * It should be used for request/response trace in dev version
 */
class GrpcTransport implements Transport {
  public client: BlockchainClient;
  public chain: ChainSpec;

  constructor (chain: string, client: BlockchainClient) {
    this.client = client;
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chainByCode(chain.toUpperCase());
  }
  public request (req: JsonRpcRequest[]): Promise<any[]> {
    const request = new NativeCallRequest();
    request.setChain(this.chain.id);
    req.forEach((json) => {
      const item = new NativeCallItem();
      item.setId(json.id);
      item.setMethod(json.method);
      item.setPayload(encoder.encode(JSON.stringify(json.params)));
      request.addItems(item);
    });

    return new Promise((resolve, reject) => {
      this.client.nativeCall(request, (response) => {
        const result: any[] = [];
        response.on('data', (data: NativeCallReplyItem) => {
          const bytes: Uint8Array = data.getPayload_asU8();
          const json = JSON.parse(decoder.decode(bytes));
          result.push(json);
        });
        response.on('end', () => {
          resolve(result);
        });
        response.on('error', (err: ServiceError) => {
          reject(err);
        });
      });
    });
  }
}

export default GrpcTransport;

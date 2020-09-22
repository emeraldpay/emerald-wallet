import {
  BlockchainClient,
} from '@emeraldpay/api-node';
import {
  NativeCallItem, isNativeCallResponse, isNativeCallError
} from '@emeraldpay/api';
import {JsonRpcRequest, Transport} from '@emeraldplatform/rpc';
import {BlockchainCode, blockchainCodeToId} from "@emeraldwallet/core";
import {Blockchain} from '@emeraldpay/api';

/**
 * It should be used for request/response trace in dev version
 */
class GrpcTransport implements Transport {
  public client: BlockchainClient;
  public chain: Blockchain;

  constructor(chain: BlockchainCode, client: BlockchainClient) {
    this.client = client;
    this.chain = blockchainCodeToId(chain);
  }

  public request(req: JsonRpcRequest[]): Promise<any[]> {
    const request: NativeCallItem[] = req.map((json) => {
      return {
        id: json.id,
        method: json.method,
        payload: json.params
      }
    });

    return new Promise((resolve, reject) => {
      const results: any[] = [];
      this.client.nativeCall(this.chain, request)
        .onData((data) => {
          let error = null;
          let result = null;
          if (isNativeCallResponse(data)) {
            result = data.payload
          } else if (isNativeCallError(data)) {
            error = {
              code: -32000,
              message: data.message
            }
          }
          const full = {
            jsonrpc: "2.0",
            id: data.id,
            result,
            error
          };
          results.push(full);
        })
        .onError((err) => {
          console.warn("Native Call error", err.message);
          reject(err)
        })
        .finally(() => {
          resolve(results);
        });
    });
  }
}

export default GrpcTransport;

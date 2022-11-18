/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ILogger } from '@emeraldwallet/core';
import { providers } from 'ethers';
import { Batch, BatchItem, DefaultBatch, RawBatchResponse } from './Batch';

export interface JsonRpc {
  batch(): Batch;
  call(method: string, params: any): Promise<any>;
  execute(batch: Batch): Promise<RawBatchResponse>;
}

export interface JsonRpcRequest {
  id: number;
  jsonrpc: string;
  method: string;
  params?: any;
}

export class JsonRpcError extends Error {
  code: number;

  constructor(error: { code: number; message: string }) {
    super(error.message);

    this.code = error.code;
    this.message = error.message;
    this.name = super.constructor.name;
  }
}

export interface JsonRpcResponse {
  error?: JsonRpcError;
  id: number;
  jsonrpc: string;
  result?: any;
}

export interface Transport {
  request(req: Array<JsonRpcRequest>): Promise<Array<JsonRpcResponse>>;
}

export abstract class AbstractJsonRpc implements JsonRpc {
  logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  batch(): Batch {
    return new DefaultBatch();
  }

  call(method: string, params: any): Promise<any> {
    const batch = new DefaultBatch();

    const promise = batch.addCall(method, params);

    this.execute(batch).catch((error) => this.logger.error('Error occurred while executing batch request:', error));

    return promise;
  }

  // eslint-disable-next-line
  execute(batch: Batch): Promise<RawBatchResponse> {
    throw new Error('Not implemented');
  }
}

export class DefaultJsonRpc extends AbstractJsonRpc implements JsonRpc {
  transport: Transport;

  constructor(transport: Transport, logger: ILogger) {
    super(logger);

    this.transport = transport;
  }

  execute(batch: Batch): Promise<RawBatchResponse> {
    const requests = batch.getItems();

    if (requests.length === 0) {
      return Promise.resolve(new RawBatchResponse([], batch));
    }

    // build map id -> handler
    const handlers: Map<number, BatchItem> = new Map();

    requests.forEach((request, index) => {
      request.request.id = index;

      handlers.set(index, request);
    });

    return new Promise<RawBatchResponse>((resolve, reject) => {
      this.transport
        .request(requests.map(({ request }) => request))
        .then((responses) => {
          // call handler associated with request
          responses.forEach((response) => {
            const item = handlers.get(response.id);

            if (item != null) {
              item.response = response;
            }
          });

          batch.resolve();

          resolve(new RawBatchResponse(responses, batch));
        })
        .catch((error) => {
          batch.reject(error);
          reject(error);
        });
    });
  }
}

export class FailingJsonRpc extends AbstractJsonRpc implements JsonRpc {
  execute(batch: Batch): Promise<RawBatchResponse> {
    batch.reject('Always Fail');

    return Promise.reject(new Error('Always Fail'));
  }
}

export class EthersJsonRpc extends providers.JsonRpcProvider {
  rpc: JsonRpc;

  constructor(jsonRpc: JsonRpc) {
    super();

    this.rpc = jsonRpc;
  }

  send(method: string, params: Array<any>): Promise<any> {
    return this.rpc.call(method, params);
  }
}

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

import { DefaultJsonRpc, JsonRpcError, JsonRpcRequest, Transport } from './';

type DefinedAnswer = {
  method: string;
  params: string;
  result?: any;
  error?: any;
};

/**
 * Transport which replies with predefined responses
 */
export class PredefinedTransport implements Transport {
  responses: Array<DefinedAnswer> = [];

  addResponse(method: string, params: Array<any>, result?: any, error?: any): PredefinedTransport {
    this.responses.push({
      method,
      params: JSON.stringify(params),
      result,
      error,
    });

    return this;
  }

  request(req: Array<JsonRpcRequest>): Promise<Array<any>> {
    return Promise.resolve(
      req.map((it) => {
        const result = this.responses.find(
          (resp) => resp.method === it.method && resp.params == JSON.stringify(it.params),
        );

        if (typeof result == 'undefined') {
          return {
            id: it.id,
            error: 'Result not set',
          };
        }

        if (result.error) {
          return {
            id: it.id,
            error: result.error,
          };
        }

        return {
          id: it.id,
          result: result.result,
        };
      }),
    );
  }
}

test('JsonRpcError constructor', () => {
  const err = new JsonRpcError({ code: 1, message: 'errmsg' });

  expect(err.message).toEqual('errmsg');
  expect(err.name).toEqual('Error');
  expect(err.code).toEqual(1);
});

test('batch request with handlers', () => {
  const transport = new PredefinedTransport();

  transport
    .addResponse('eth_getBalance', ['0x01', 'latest'], '0x100')
    .addResponse('eth_getBalance', ['0x02', 'latest'], '0x200')
    .addResponse('eth_getBalance', ['0x03', 'latest'], '0x300');

  const rpc = new DefaultJsonRpc(transport, console);

  let balance1: string;
  let balance2: string;
  let balance3: string;

  const batch = rpc.batch();

  batch.addCall('eth_getBalance', ['0x01', 'latest']).then((resp) => {
    balance1 = resp;
  });
  batch.addCall('eth_getBalance', ['0x02', 'latest']).then((resp) => {
    balance2 = resp;
  });
  batch.addCall('eth_getBalance', ['0x03', 'latest']).then((resp) => {
    balance3 = resp;
  });

  return rpc.execute(batch).then(() => {
    expect(balance1).toEqual('0x100');
    expect(balance2).toEqual('0x200');
    expect(balance3).toEqual('0x300');
  });
});

test('batch request without handlers', () => {
  const balancesResponse = [
    { id: 0, result: '0x300' },
    { id: 1, result: '0x200' },
    { id: 2, result: '0x100' },
  ];

  const transport = new PredefinedTransport();

  transport
    .addResponse('eth_getBalance', ['0x01', 'latest'], '0x100')
    .addResponse('eth_getBalance', ['0x02', 'latest'], '0x200')
    .addResponse('eth_getBalance', ['0x03', 'latest'], '0x300');

  const rpc = new DefaultJsonRpc(transport, console);

  const batch = rpc.batch();

  batch.addCall('eth_getBalance', ['0x03', 'latest']);
  batch.addCall('eth_getBalance', ['0x02', 'latest']);
  batch.addCall('eth_getBalance', ['0x01', 'latest']);

  const promise = rpc.execute(batch);

  return promise.then((response) => expect(JSON.stringify(response.results)).toEqual(JSON.stringify(balancesResponse)));
});

test('empty batch request', () => {
  const transport = new PredefinedTransport();
  const rpc = new DefaultJsonRpc(transport, console);

  const batch = rpc.batch();
  const promise = rpc.execute(batch);

  return promise.then((response) => expect(response.results).toHaveLength(0));
});

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
import {BatchItem, DefaultBatch} from './Batch';

describe('DefaultBatch', () => {
  it('DefaultBatch: Call Added', () => {
    const batch = new DefaultBatch();
    const promise = batch.addCall('test_foo', ['bar', 'baz']);
    expect(promise).toBeDefined();
    expect(batch.getItems()).toHaveLength(1);
    expect(batch.getItems()[0].request).toEqual({id: 0, jsonrpc: '2.0', method: 'test_foo', params: ['bar', 'baz']});
  });

  it('DefaultBatch: Process : empty', () => {
    const batch = new DefaultBatch();
    const item: BatchItem = {
      request: {
        jsonrpc: '2.0',
        method: 'test_foo',
        id: 0,
      },
      reject: jest.fn(),
      resolve: jest.fn(),
    };
    batch.processResponse(item);
    expect(item.reject).toBeCalled();
    expect(item.resolve).not.toBeCalled();
  });

  it('DefaultBatch: Process : string', () => {
    const batch = new DefaultBatch();
    const item: BatchItem = {
      request: {
        jsonrpc: '2.0',
        method: 'test_foo',
        id: 0,
      },
      response: {
        jsonrpc: '2.0',
        result: 'foo',
      },
      reject: jest.fn(),
      resolve: jest.fn(),
    };
    batch.processResponse(item);
    expect(item.reject).not.toBeCalled();
    expect(item.resolve).toBeCalledWith('foo');
  });

  it('DefaultBatch: Process : false', () => {
    const batch = new DefaultBatch();
    const item: BatchItem = {
      request: {
        jsonrpc: '2.0',
        method: 'test_foo',
        id: 0,
      },
      response: {
        jsonrpc: '2.0',
        result: false,
      },
      reject: jest.fn(),
      resolve: jest.fn(),
    };
    batch.processResponse(item);
    expect(item.reject).not.toBeCalled();
    expect(item.resolve).toBeCalledWith(false);
  });

  it('DefaultBatch: Process : object', () => {
    const batch = new DefaultBatch();
    const item: BatchItem = {
      request: {
        jsonrpc: '2.0',
        method: 'test_foo',
        id: 0,
      },
      response: {
        jsonrpc: '2.0',
        result: {foo: 'bar'},
      },
      reject: jest.fn(),
      resolve: jest.fn(),
    };
    batch.processResponse(item);
    expect(item.reject).not.toBeCalled();
    expect(item.resolve).toBeCalledWith({foo: 'bar'});
  });

  it('DefaultBatch: Process : error', () => {
    const batch = new DefaultBatch();
    const item: BatchItem = {
      request: {
        jsonrpc: '2.0',
        method: 'test_foo',
        id: 0,
      },
      response: {
        jsonrpc: '2.0',
        error: {code: -1}
      },
      reject: jest.fn(),
      resolve: jest.fn(),
    };
    batch.processResponse(item);
    expect(item.reject).toBeCalled();
    expect(item.resolve).not.toBeCalled();
  });


  it('DefaultBatch: resolves all', () => {
    const batch = new DefaultBatch();
    batch.addCall('test_foo', ['1']);
    batch.addCall('test_foo', ['2']);

    batch.getItems()[0].response = {
      jsonrpc: '2.0',
      result: 'bar',
    };
    batch.getItems()[1].response = {
      jsonrpc: '2.0',
      result: 'baz',
    };
    batch.getItems()[0].resolve = jest.fn();
    batch.getItems()[1].resolve = jest.fn();

    batch.resolve();

    expect(batch.getItems()[0].resolve).toBeCalledWith('bar');
    expect(batch.getItems()[1].resolve).toBeCalledWith('baz');
  });

  it('DefaultBatch: rejects all', () => {
    const batch = new DefaultBatch();
    batch.addCall('test_foo', ['1']);
    batch.addCall('test_foo', ['2']);

    batch.getItems()[0].reject = jest.fn();
    batch.getItems()[1].reject = jest.fn();

    batch.reject('bar');

    expect(batch.getItems()[0].reject).toBeCalledWith('bar');
    expect(batch.getItems()[1].reject).toBeCalledWith('bar');
  });

});

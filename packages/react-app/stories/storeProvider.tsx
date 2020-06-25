import * as React from 'react';
import {Provider} from 'react-redux';
import {createStore} from '@emeraldwallet/store';
import {ApiMock, BackendMock, VaultMock} from "./backendMock";
import {StoryContext, StoryFn} from "@storybook/addons/dist/types";
import {IApi} from "@emeraldwallet/core";

function createApi(backend: BackendMock): IApi {
  return new ApiMock(
    new VaultMock(backend.vault)
  )
}

const defaultBackend = new BackendMock();
const defaultStore = createStore(createApi(defaultBackend), defaultBackend);


export function providerForStore(backend: BackendMock) {
  const store = createStore(createApi(backend), backend);
  return (story: StoryFn, c: StoryContext) =>
    (<Provider store={store}>
      {story()}
    </Provider>)
    ;
}

const withProvider = (story) => (
  <Provider store={defaultStore}>
    {story()}
  </Provider>
);

export default withProvider;
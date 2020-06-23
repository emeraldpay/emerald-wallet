import * as React from 'react';
import {Provider} from 'react-redux';
import {createStore} from '@emeraldwallet/store';
import {BackendMock} from "./backendMock";
import {StoryContext, StoryFn} from "@storybook/addons/dist/types";

const defaultBackend = new BackendMock();
const defaultStore = createStore(null, defaultBackend)

export function providerForStore(backend: BackendMock) {
  const store = createStore(null, backend)
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
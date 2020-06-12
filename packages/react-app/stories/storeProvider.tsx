import * as React from 'react';
import {Provider} from 'react-redux';
import {createStore} from '@emeraldwallet/store';

const store = createStore(null, null)

const withProvider = (story) => (
  <Provider store={store}>
    {story()}
  </Provider>
);

export default withProvider;
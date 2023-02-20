import { Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, tokenAmount, workflow } from '@emeraldwallet/core';
import * as addressBook from '@emeraldwallet/store/lib/address-book';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import CreateTx from './CreateTx';
import { createTestStore } from '../../_tests';

describe('CreateTx', () => {
  it('it renders without crash', () => {
    const tx = new workflow.CreateEthereumTx(null, BlockchainCode.ETH);
    tx.amount = new Wei(1, 'ETHER');
    tx.gas = 100000;
    tx.gasPrice = new Wei(0.0001, 'ETHER');
    tx.totalBalance = new Wei(5, 'ETHER');

    const store = createTestStore({ [addressBook.moduleName]: { contacts: {} } });

    const wrapper = shallow(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <CreateTx
            chain={BlockchainCode.ETH}
            token="ETH"
            tx={tx}
            txFeeToken="ETH"
            tokenSymbols={[]}
            eip1559={false}
            highGasPrice={{ max: 0, priority: 0 }}
            lowGasPrice={{ max: 0, priority: 0 }}
            stdGasPrice={{ max: 0, priority: 0 }}
            onChangeTo={() => undefined}
            getBalance={() => new Wei(0)}
            getTokenBalance={() => tokenAmount(0, 'dai')}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(wrapper).toBeDefined();

    const mounted = mount(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <CreateTx
            chain={BlockchainCode.ETH}
            token="ETH"
            tx={tx}
            txFeeToken="ETH"
            tokenSymbols={[]}
            eip1559={false}
            highGasPrice={{ max: 0, priority: 0 }}
            lowGasPrice={{ max: 0, priority: 0 }}
            stdGasPrice={{ max: 0, priority: 0 }}
            onChangeTo={() => undefined}
            getBalance={() => new Wei(0)}
            getTokenBalance={() => tokenAmount(0, 'dai')}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(mounted).toBeDefined();
  });
});

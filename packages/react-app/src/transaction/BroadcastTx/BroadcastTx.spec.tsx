import { BlockchainCode, EthereumTransactionType, amountFactory } from '@emeraldwallet/core';
import { BroadcastData, application } from '@emeraldwallet/store';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../testStore';
import BroadcastTx from './BroadcastTx';

describe('BroadcastTx', () => {
  const data: BroadcastData = {
    blockchain: BlockchainCode.Goerli,
    entryId: '1022fd13-3431-4f3b-bce8-109fdab15873-1',
    fee: amountFactory(BlockchainCode.Goerli)(1 ** 18),
    signed:
      '0x02f8720580845a288bce8502d16b842682520894e7f129f88b57e902cb18ba' +
      'eecd43f17449419ae287b1a2bc2ec5000080c001a056663c0965287c9e0e92d6' +
      'c6ecf157759ea79c21264c7026061a8732f8d2539da03b44d23d74d2e47af661' +
      '0fa2c4b1f0a352ee0be3fc0457ff81d5813dde597d4b',
    tx: {
      blockchain: BlockchainCode.Goerli,
      data: '',
      from: '0x65a60f440ed54910d91a0634a45a2294cc807095',
      gas: 21000,
      maxGasPrice: new BigNumber('10000000000'),
      nonce: '0x0',
      priorityGasPrice: new BigNumber('1000000000'),
      to: '0xe7f129f88b57e902cb18baeecd43f17449419ae2',
      type: EthereumTransactionType.EIP1559,
      value: new BigNumber('50000000000000000'),
    },
    txId: '0xc9c924dd7f4ffe61d653718b204d6aae514736db227fdb0297b76cd8f3f1f203',
  };

  const store = createTestStore({
    [application.moduleName]: {
      tokens: [],
    },
  });

  it('should work without crash', () => {
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <BroadcastTx data={data} />
        </ThemeProvider>
      </Provider>,
    );

    expect(wrapper).toBeDefined();
  });

  it('should display tx value for ordinary tx', async () => {
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <BroadcastTx data={data} />
        </ThemeProvider>
      </Provider>,
    );

    const amount = await wrapper.findByTestId('amount');

    expect(amount).toBeDefined();
    expect(amount).toHaveTextContent('0.05 ETG');

    const nonce = await wrapper.findByTestId('nonce');

    expect(nonce).toHaveTextContent('0');
  });
});

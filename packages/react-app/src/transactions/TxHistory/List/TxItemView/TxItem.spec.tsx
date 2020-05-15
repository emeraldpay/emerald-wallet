import { Theme } from '@emeraldplatform/ui';
import { ThemeProvider } from '@material-ui/styles';
import { render } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import TxItem from './TxItem';

const tx = {
  blockNumber: 1,
  from: '0x1',
  to: '0x2',
  value: new BigNumber(100000)
};
const from = {};
const to = {};

describe('TxItem', () => {
  it('should renders without crash', () => {
    const comp = render(
      <ThemeProvider theme={Theme}>
        <TxItem
          openAccount={jest.fn()}
          openTx={jest.fn()}
          currentBlockHeight={100}
          requiredConfirmations={12}
          tx={tx}
          fromAccount={from}
          toAccount={to}
        />
      </ThemeProvider>
    );
    expect(comp).toBeDefined();
    expect(comp.getByText('0.0000000000001')).toBeDefined();
  });

});

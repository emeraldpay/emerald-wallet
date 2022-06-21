import { BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { ChangeType, Direction, State, Status } from '@emeraldwallet/core/lib/persisistentState';
import { StoredTransaction } from '@emeraldwallet/store';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/styles';
import { render } from '@testing-library/react';
import * as React from 'react';
import TxItem from './TxItem';

const tx = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  changes: [
    {
      type: ChangeType.TRANSFER,
      amount: '-100001',
      direction: Direction.SPEND,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
      asset: 'ETH',
    },
  ],
  sinceTimestamp: new Date('2021-01-05T10:11:12'),
  state: State.PREPARED,
  status: Status.UNKNOWN,
  txId: '0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
});

describe('TxItem', () => {
  it('should renders without crash', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <table>
          <tbody>
            <TxItem tx={tx} openAccount={jest.fn()} openTransaction={jest.fn()} />
          </tbody>
        </table>
      </ThemeProvider>,
    );

    expect(component).toBeDefined();
  });
});

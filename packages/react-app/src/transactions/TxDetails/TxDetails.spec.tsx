import {render} from '@testing-library/react';
import BigNumber from 'bignumber.js';
import {mount} from 'enzyme';
import * as React from 'react';
import {default as TxDetails} from './TxDetails';
import {BlockchainCode, EthereumStoredTransaction} from "@emeraldwallet/core";

const reduceClasses = (prev: any, curr: any) => ({...prev, [curr]: curr});

describe('TxDetailsView', () => {
  it('should render nested components correctly', () => {
    const tx = {
      hash: '0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8',
      data: '0xDADA',
      from: '0x1234',
      to: '0x9876',
      gas: 21000,
      gasPrice: new BigNumber('30000000000'),
      value: new BigNumber('100999370000000000000')
    };
    const component = mount(<TxDetails tokenSymbol='ETC' fiatAmount='100' transaction={tx}/>);
    expect(component).toBeDefined();
  });

  it('should show tx input data', async () => {
    const tx: EthereumStoredTransaction = {
      blockchain: BlockchainCode.ETH,
      gas: 10, gasPrice: "100",
      nonce: 0, value: "100",
      hash: '0x01',
      data: '0xDADA',
      from: '0x1234'
    };
    const component = render(<TxDetails tokenSymbol='ETC' transaction={tx}/>);
    const inputComps = await component.findByText(tx.data);
    expect(inputComps).toBeDefined();
  });

  it('should not show To Account if tx does not have to attribute', async () => {
    const tx = {
      hash: '0x01',
      data: '0xDADA',
      from: '0x1234'
    };
    const component = render(<TxDetails tokenSymbol='ETC' transaction={tx}/>);
    const toAcc = await component.queryByTestId('to-account');
    expect(toAcc).toBeNull();
  });
});

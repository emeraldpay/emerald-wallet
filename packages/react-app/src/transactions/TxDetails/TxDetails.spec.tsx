import {render} from '@testing-library/react';
import BigNumber from 'bignumber.js';
import {mount} from 'enzyme';
import * as React from 'react';
import {default as TxDetails} from './TxDetails';
import {BlockchainCode, EthereumStoredTransaction} from "@emeraldwallet/core";
import Total from "../../app/layout/Header/Total";
import {Provider} from "react-redux";
import {Map, List} from "immutable"

const reduceClasses = (prev: any, curr: any) => ({...prev, [curr]: curr});

function createStore() {
  return {
    dispatch() {
    },
    subscribe() {
      return () => {
      };
    },
    replaceReducer() {
    },
    getState() {
      return {
        accounts: {
          wallets: [
            {
              id: "111",
              entries: [
                {
                  blockchain: 101,
                }
              ]
            }
          ],
        },
        history: Map({
          trackedTransactions: List([
            {
              blockchain: BlockchainCode.ETC,
              hash: '0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8',
              data: '0xDADA',
              from: '0x1234',
              to: '0x9876',
              gas: 21000,
              gasPrice: new BigNumber('30000000000'),
              value: new BigNumber('100999370000000000000')
            },
            {
              blockchain: BlockchainCode.BTC,
              hash: '01679d947bd7f082fdf4e772c534ae1895c1767c33c37ef93de48897c100b9c8',
              fee: 21000,
              inputs: [],
              outputs: []
            }
          ])
        })
      }
    }
  }
}

describe('TxDetailsView', () => {
  it('should render nested components correctly', () => {
    const component = mount(<Provider store={createStore() as any}><TxDetails
      hash={"0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8"}/></Provider>);
    expect(component).toBeDefined();
  });

  it('should show tx input data', async () => {
    const component = mount(<Provider store={createStore() as any}><TxDetails
      hash={"0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8"}/></Provider>);
    const inputComps = await component.html().indexOf("0xDADA");
    expect(inputComps > 0).toBeTruthy();
  });

  it('should render bitcoin tx', () => {
    const component = mount(<Provider store={createStore() as any}><TxDetails
      hash={"01679d947bd7f082fdf4e772c534ae1895c1767c33c37ef93de48897c100b9c8"}/></Provider>);
    expect(component).toBeDefined();
  });
});

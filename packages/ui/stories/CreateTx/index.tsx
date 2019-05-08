import * as React from 'react';
import {storiesOf} from '@storybook/react';
import { Wei } from '@emeraldplatform/eth';
import AmountField from '../../src/components/tx/send/CreateTx/AmountField';
import FromField from '../../src/components/tx/send/CreateTx/FromField';
import ToField from '../../src/components/tx/send/CreateTx/ToField';
import CreateTx from '../../src/components/tx/send/CreateTx';

storiesOf('CreateTx', module)
  .add('default', () => (
    <CreateTx
      token="ETC"
      txFeeToken="ETH"
      amount={new Wei("10000000")}
      gasLimit="200"
      balance={new Wei("10000000")}
      txFee={new Wei("1000000")}
    />))
  .add('AmountField', () => (<AmountField amount={new Wei("10000000")} />))
  .add('FromField', () => (<FromField accounts={['0x1', '02']}/>))
  .add('ToField', () => (<ToField />));


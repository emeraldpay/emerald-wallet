import * as React from 'react';
import {storiesOf} from '@storybook/react';
import AmountField from '../../src/components/tx/send/CreateTx/AmountField';
import FromField from '../../src/components/tx/send/CreateTx/FromField';
import CreateTx from '../../src/components/tx/send/CreateTx';

storiesOf('CreateTx', module)
  .add('default', () => (
    <CreateTx
      token="ETC"
      txFeeToken="ETH"
      balance="5"
      amount="1"
      gasLimit="200"
      txFee="1"
    />))
  .add('AmountField', () => (<AmountField amount={"0"} balance={"100"}/>))
  .add('FromField', () => (<FromField accounts={['0x1', '02']}/>));


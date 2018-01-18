import React from 'react';
import { fromJS } from 'immutable';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import { Transaction } from '../../src/components/tx/TxHistory/List/transaction';

const muiTheme = getMuiTheme({
  fontFamily: 'Rubik',
});

storiesOf('TxHistory', module)
  .addDecorator((story) => (
    <MuiThemeProvider muiTheme={muiTheme}>
      {story()}
    </MuiThemeProvider>
  ))
  .add('Transaction', () => {
    const tx = fromJS({
      from: '0x123',
      to: '0x123',
    });
    const fromAccount = fromJS({});
    const toAccount = fromJS({});
    return (<Transaction tx={tx} fromAccount={fromAccount} toAccount={toAccount}/>);
  });

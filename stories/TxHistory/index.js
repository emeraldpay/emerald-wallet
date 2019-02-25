import React from 'react';
import { fromJS } from 'immutable';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import TxView from '../../src/components/tx/TxHistory/List/TxView';
import theme from 'emerald-js-ui/src/theme.json';

const muiTheme = getMuiTheme(theme);

storiesOf('TxHistory', module)
  .addDecorator((story) => (
    <MuiThemeProvider muiTheme={muiTheme}>
      {story()}
    </MuiThemeProvider>
  ))
  .add('TxView (in queue)', () => {
    const tx = fromJS({
      from: '0x2b3807Bb1C4cF289FB572B5f9387d0e0280CB793',
      to: '0x7aa9ABED67130Bb657A02b14d39CEF532c2a78a5',
      timestamp: 123456
    });
    const fromAccount = fromJS({});
    const toAccount = fromJS({});
    return (<TxView tx={tx} fromAccount={fromAccount} toAccount={toAccount}/>);
  })
  .add('TxView (confirmed)', () => {
    const tx = fromJS({
      from: '0x2b3807Bb1C4cF289FB572B5f9387d0e0280CB793',
      to: '0x7aa9ABED67130Bb657A02b14d39CEF532c2a78a5',
      timestamp: 123456,
      blockNumber: 90,
    });
    const fromAccount = fromJS({});
    const toAccount = fromJS({});
    return (
      <TxView
        tx={tx} fromAccount={fromAccount}
        currentBlockHeight={120}
        numConfirmations={5}
        toAccount={toAccount}
      />);
  });

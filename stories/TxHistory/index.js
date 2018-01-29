import React from 'react';
import { fromJS } from 'immutable';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import { TxView } from '../../src/components/tx/TxHistory/List/TxView';

const muiTheme = getMuiTheme({
  fontFamily: 'Rubik',
});

storiesOf('TxHistory', module)
  .addDecorator((story) => (
    <MuiThemeProvider muiTheme={muiTheme}>
      {story()}
    </MuiThemeProvider>
  ))
  .add('TxView', () => {
    const tx = fromJS({
      from: '0x123',
      to: '0x123',
    });
    const fromAccount = fromJS({});
    const toAccount = fromJS({});
    return (<TxView tx={tx} fromAccount={fromAccount} toAccount={toAccount}/>);
  });

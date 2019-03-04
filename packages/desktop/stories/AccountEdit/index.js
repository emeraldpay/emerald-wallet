import React from 'react';
import { fromJS } from 'immutable';
import { storiesOf } from '@storybook/react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import AccountEdit from '../../src/components/accounts/AccountEdit';

const muiTheme = getMuiTheme({
  fontFamily: 'Rubik',
});
const store = createStore((state = {}, action) => state);

storiesOf('AccountEdit', module)
  .addDecorator((story) => (
    <Provider store={store}>
      {story()}
    </Provider>
  ))
  .add('default', () => (
    <AccountEdit account={fromJS({
      id: '0x12345',
      name: 'Name1',
    })}/>));

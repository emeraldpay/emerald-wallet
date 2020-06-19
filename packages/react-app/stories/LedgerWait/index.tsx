import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import * as React from 'react';
import LedgerWait from "../../src/ledger/LedgerWait";
import withTheme from "../themeProvider";
import withProvider from "../storeProvider";

storiesOf('LedgerWait', module)
  .addDecorator(withProvider)
  .addDecorator(withTheme)
  .add('default', () => (
    <LedgerWait onConnected={action("Connected")}/>
  ))
  .add('full size', () => (
    <LedgerWait fullSize={true} onConnected={action("Connected")}/>
  ));

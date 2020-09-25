import {storiesOf} from '@storybook/react';
import * as React from 'react';
import Address from '../../src/components/accounts/Address';

storiesOf('Address', module)
  .add('ethereum', () => (
    <div>
      <Address address={"0x9d8e3fed246384e726b5962577503b916fb246d7"} onCopy={console.log}/>
      <Address address={"0x9d8e3fed246384e726b5962577503b916fb246d7"} disableCopy={true}/>
    </div>))
  .add("bitcoin", () => (
    <div>
      <Address address={"bc1qa2s34p38jyuen859slf28nnvccauk6xuwqzug4"} onCopy={console.log}/>
      <Address address={"bc1qa2s34p38jyuen859slf28nnvccauk6xuwqzug4"} disableCopy={true}/>
    </div>
  ))
;

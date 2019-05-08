import * as React from 'react';
import { storiesOf } from '@storybook/react';
import InitialSetup from '../../src/components/welcome/InitialSetup';

storiesOf('InitialSetup', module)
  .add('default', () => (<InitialSetup currentTermsVersion="1" connectETC={() => ({})} connectETH={() => ({})}/>))
  .add('open wallet', () => (<InitialSetup currentTermsVersion="1" terms="1" connectETC={() => ({})} connectETH={() => ({})}/>));

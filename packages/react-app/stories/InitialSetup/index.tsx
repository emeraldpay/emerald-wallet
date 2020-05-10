import { storiesOf } from '@storybook/react';
import * as React from 'react';
import InitialSetup from '../../src/app/onboarding/InitialSetup/InitialSetupView';

storiesOf('InitialSetup', module)
  .add('default', () => (<InitialSetup currentTermsVersion='1' />))
  .add('open wallet', () => (<InitialSetup currentTermsVersion='1' terms='1' />));

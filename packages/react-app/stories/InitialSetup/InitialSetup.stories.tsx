import * as React from 'react';
import { Meta } from '@storybook/react';
import InitialSetup from '../../src/app/onboarding/InitialSetup/InitialSetupView';

export default {
  title: 'Initial Setup',
} as Meta;

export const Default = () => <InitialSetup currentTermsVersion='1' />;
export const OpenWallet = () => <InitialSetup currentTermsVersion='1' terms='1' />;

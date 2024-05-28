import {Meta} from '@storybook/react';
import i18n from 'i18next';
import * as React from 'react';
import { ExportResult } from '../../src/settings/Settings/types';
import Settings from '../../src/settings/SettingsForm';

export default {
  title: 'Settings',
} as Meta;

export const Default = () =>
  <Settings
    tReady={true}
    currency="GBP"
    hasWallets={true}
    i18n={{} as typeof i18n}
    language="en-US"
    seeds={[]}
    t={(str: string): string => str}
    exportVaultFile={() => Promise.resolve(ExportResult.COMPLETE)}
    goBack={() => null}
    isGlobalKeySet={() => Promise.resolve(true)}
    onChangeGlobalKey={() => Promise.resolve(true)}
    onSubmit={() => Promise.resolve()}
    showNotification={() => null}
    updateSeed={() => Promise.resolve(true)}
  />;

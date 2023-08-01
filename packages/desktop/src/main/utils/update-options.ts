import { Logger, SettingsOptions } from '@emeraldwallet/core';
import fetch from 'node-fetch';
import { options as defaults } from '../../../defaults.json';

const log = Logger.forCategory('Store::UpdateOptions');

export default async function (appVersion: string, stored: SettingsOptions): Promise<typeof defaults> {
  const response = await fetch(
    `https://updates.emerald.cash/options.json?ref_app=desktop-wallet&ref_version=${appVersion}`,
  );

  const exists = { ...defaults, ...stored };

  if (response.status === 200) {
    try {
      const options = await response.json();

      return {
        ...exists,
        ...(options as SettingsOptions),
      };
    } catch (exception) {
      log.error('Error while parsing options update from server:', exception);
    }
  }

  return exists;
}

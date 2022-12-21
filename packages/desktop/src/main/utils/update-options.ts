import { SettingsOptions } from '@emeraldwallet/core';
import fetch from 'node-fetch';
import { options as defaults } from '../../../defaults.json';
import { SemVer as currentVersion } from '../../../gitversion.json';

export default async function (stored: SettingsOptions): Promise<typeof defaults> {
  const response = await fetch(
    `https://updates.emerald.cash/options.json?ref_app=desktop-wallet&ref_version=${currentVersion}`,
  );

  const exists = { ...defaults, ...stored };

  if (response.status === 200) {
    const options = await response.json();

    return {
      ...exists,
      ...(options as SettingsOptions),
    };
  }

  return exists;
}

import fetch from 'node-fetch';
import defaults from '../../../defaults.json';
import { SemVer as currentVersion } from '../../../gitversion.json';

export default async function (): Promise<typeof defaults> {
  const response = await fetch(
    `https://updates.emerald.cash/options.json?ref_app=desktop-wallet&ref_version=${currentVersion}`,
  );

  if (response.status === 200) {
    const options = await response.json();

    return Object.assign({}, defaults, options);
  }

  return defaults;
}

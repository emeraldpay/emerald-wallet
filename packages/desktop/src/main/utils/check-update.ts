import fetch from 'node-fetch';
import * as semver from 'semver';

type Release = {
  releases: {
    'emerald-wallet': {
      version: string;
    };
  };
};

type Update = {
  latest: boolean;
  link: string;
  version: string;
};

const { NODE_ENV } = process.env;

const HOST: Readonly<string> =
  NODE_ENV === 'development' || NODE_ENV === 'verifying' ? 'cdn.emeraldpay.dev' : 'updates.emerald.cash';

export default async function (appVersion: string): Promise<Update> {
  let latest = true;
  let version = appVersion;

  if (semver.prerelease(appVersion)?.includes('dev') !== true) {
    const response = await fetch(`https://${HOST}/latest.json?ref_app=desktop-wallet&ref_version=${appVersion}`);

    if (response.status === 200) {
      const release = await response.json();

      ({
        releases: {
          'emerald-wallet': { version },
        },
      } = release as Release);

      latest = semver.lte(version, appVersion);
    }
  }

  return {
    latest,
    version,
    link: 'https://go.emrld.io/download',
  };
}

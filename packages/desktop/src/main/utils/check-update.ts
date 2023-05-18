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
  downloadLink: string;
  isLatest: boolean;
  tag: string;
};

export default async function (appVersion: string): Promise<Update> {
  const response = await fetch(
    `https://updates.emerald.cash/latest.json?ref_app=desktop-wallet&ref_version=${appVersion}`,
  );

  const latest = await response.json();

  const {
    releases: { 'emerald-wallet': release },
  } = latest as Release;

  return {
    downloadLink: 'https://go.emrld.io/download',
    isLatest: semver.prerelease(appVersion).includes('dev') || semver.lte(release.version, appVersion),
    tag: `v${release.version}`,
  };
}

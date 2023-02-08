import fetch from 'node-fetch';
import * as semver from 'semver';
import { SemVer as currentVersion } from '../../../gitversion.json';

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

export default async function (): Promise<Update> {
  const response = await fetch(
    `https://updates.emerald.cash/latest.json?ref_app=desktop-wallet&ref_version=${currentVersion}`,
  );

  const latest = await response.json();

  const {
    releases: { 'emerald-wallet': release },
  } = latest as Release;

  return {
    downloadLink: 'https://go.emrld.io/download',
    isLatest: semver.prerelease(currentVersion).includes('dev') || semver.lte(release.version, currentVersion),
    tag: `v${release.version}`,
  };
}

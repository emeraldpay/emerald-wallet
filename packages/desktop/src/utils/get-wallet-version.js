import fetch from 'node-fetch';
import semver from 'semver';
import {version as currentVersion} from '../../package.json';

export default () => {
  return fetch(`https://updates.emerald.cash/latest.json?ref_app=desktop-wallet&ref_version=${currentVersion}`)
    .then((res) => res.json())
    .then((latest) => latest.releases['emerald-wallet'])
    .then((release) => ({
      isLatest: semver.lte(release.version, currentVersion),
      tag: `v${release.version}`,
      downloadLink: 'https://go.emrld.io/download',
    }))
    .catch((e) => {
      console.info("Failed to check for updates", e)
    });
};

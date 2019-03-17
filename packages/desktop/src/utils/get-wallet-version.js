import fetch from 'node-fetch';
import semver from 'semver';
import {version as currentVersion} from '../../package.json';

export default () => {
  return fetch(`https://dl.emeraldwallet.io/latest.json?ref_app=emerald-wallet&ref_version=${currentVersion}`)
    .then((res) => res.json())
    .then((latest) => latest.releases['emerald-wallet'])
    .then((release) => ({
      isLatest: semver.lte(release.version, currentVersion),
      tag: `v${release.version}`,
      downloadLink: 'https://emeraldwallet.io/download',
    }));
};

import fetch from 'node-fetch';
import {version as currentVersion} from '../../package.json';

export default (current) => {
  return fetch(`https://dl.emeraldwallet.io/latest.json?ref_app=emerald-wallet&ref_version=${currentVersion}`)
    .then((res) => res.json())
    .then((latest) => latest.releases['emerald-wallet'])
    .then((release) => ({
      isLatest: release.version === `${currentVersion}`,
      tag: release.version,
      downloadLink: 'http://emeraldwallet.io/download',
    }));
};

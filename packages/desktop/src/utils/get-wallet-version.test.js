import fetch from 'node-fetch';
import getWalletVersion from './get-wallet-version';

jest.mock('../../package.json', () => ({version: '123.123.123'}));

describe('isLatest', () => {
  it('is a function', () => {
    expect(getWalletVersion).toEqual(expect.any(Function));
  });

  it('returns true for isLatest if on the latest version', (done) => {
    fetch.mockResponse(JSON.stringify({ releases: {'emerald-wallet': {version: '123.123.123'}}}));
    getWalletVersion().then(({isLatest}) => {
      expect(isLatest).toBe(true);
      done();
    });
  });

  it('returns a download link', (done) => {
    const stubDownloadLink = 'https://emeraldwallet.io/download';
    fetch.mockResponse(JSON.stringify({releases: {'emerald-wallet': {version: '123.123.123'}}}));
    getWalletVersion().then(({downloadLink}) => {
      expect(downloadLink).toBe(stubDownloadLink);
      done();
    });
  });

  it('returns a tag', (done) => {
    const stubTag = 'v1.2.3';
    fetch.mockResponse(JSON.stringify({releases: {'emerald-wallet': {version: '1.2.3'}}}));
    getWalletVersion().then(({tag}) => {
      expect(tag).toBe(stubTag);
      done();
    });
  });
});

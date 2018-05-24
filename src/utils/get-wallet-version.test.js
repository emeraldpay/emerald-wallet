jest.mock('../package.json', () => ({version: '123.123.123'}));

import getWalletVersion from './get-wallet-version';
import fetch from 'node-fetch';

describe('isLatest', () => {
  it('is a function', () => {
    expect(getWalletVersion).toEqual(expect.any(Function));
  });

  it('returns true for isLatest if on the latest version', async () => {
    fetch.mockResponse(JSON.stringify({ tag_name: 'v123.123.123'}));
    const { isLatest } = await getWalletVersion();
    expect(isLatest).toBe(true);
  });

  it('returns a download link', async () => {
    const stubDownloadLink = 'example.com';
    fetch.mockResponse(JSON.stringify({ html_url: stubDownloadLink }));
    const { downloadLink } = await getWalletVersion();
    expect(downloadLink).toBe(stubDownloadLink);
  });

  it('returns a tag', async () => {
    const stubTag = 'v1.2.3';
    fetch.mockResponse(JSON.stringify({ tag_name: stubTag }));
    const { tag } = await getWalletVersion();
    expect(tag).toBe(stubTag);
  });
});

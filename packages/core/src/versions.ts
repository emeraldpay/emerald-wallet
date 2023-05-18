export interface Versions {
  appLocale: string;
  appVersion: string;
  chromeVersion: string;
  commitData: {
    commitDate: string;
    shortSha: string;
  };
  electronVersion: string;
  osVersion: {
    arch: string;
    platform: string;
    release: string;
  };
}

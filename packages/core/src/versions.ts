import os from 'os';

export interface Versions {
  appVersion?: string;
  gitVersion?: { [key: string]: string };
  osVersion?: {
    arch?: string;
    platform?: string;
    release?: string;
  };
}

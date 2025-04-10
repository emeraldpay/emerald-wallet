import { Versions } from '@emeraldwallet/core';
import { EmeraldTheme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material';
import { shallow } from 'enzyme';
import * as React from 'react';
import About from './About';

describe('About', () => {
  it('renders about page without crash', () => {
    const versions: Versions = {
      appLocale: 'en-US',
      appVersion: '0.0.0',
      commitData: {
        commitDate: '2023-05-18',
        shortSha: 'cafe64',
      },
      chromeVersion: '0.0.0',
      electronVersion: '0.0.0',
      osVersion: {
        arch: 'x64',
        platform: 'win32',
        release: '10.0.22621',
      },
    };

    const component = shallow(
      <ThemeProvider theme={EmeraldTheme}>
        <About
          versions={versions}
          onHelpClick={() => undefined}
          onLicenseClick={() => undefined}
          onWebsiteClick={() => undefined}
        />
      </ThemeProvider>,
    );

    expect(component).toBeDefined();
  });
});

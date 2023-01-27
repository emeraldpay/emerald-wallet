import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { shallow } from 'enzyme';
import * as React from 'react';
import About from './About';

describe('About', () => {
  it('renders about page without crash', () => {
    const component = shallow(
      <ThemeProvider theme={Theme}>
        <About
          appVersion="0.0.0"
          gitVersion={{}}
          osVersion={{}}
          onHelpClick={() => undefined}
          onLicenseClick={() => undefined}
          onWebsiteClick={() => undefined}
        />
      </ThemeProvider>,
    );

    expect(component).toBeDefined();
  });
});

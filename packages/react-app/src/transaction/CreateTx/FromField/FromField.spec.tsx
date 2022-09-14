import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import FromField from '.';

describe('FromField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(
      <ThemeProvider theme={Theme}>
        <FromField />
      </ThemeProvider>,
    );
    expect(wrapper).toBeDefined();

    const mounted = mount(
      <ThemeProvider theme={Theme}>
        <FromField />
      </ThemeProvider>,
    );
    expect(mounted).toBeDefined();
  });
});

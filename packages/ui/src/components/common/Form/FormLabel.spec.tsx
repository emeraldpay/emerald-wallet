import { EmeraldTheme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material';
import { shallow } from 'enzyme';
import * as React from 'react';
import Label from './FormLabel';

describe('FormLabel', () => {
  it('should render', () => {
    const wrapper = shallow(
      <ThemeProvider theme={EmeraldTheme}>
        <Label />
      </ThemeProvider>,
    );

    expect(wrapper).toBeDefined();
  });
});

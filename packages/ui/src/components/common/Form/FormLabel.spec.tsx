import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material/styles';
import { shallow } from 'enzyme';
import * as React from 'react';
import Label from './FormLabel';

describe('FormLabel', () => {
  it('should render', () => {
    const wrapper = shallow(
      <ThemeProvider theme={Theme}>
        <Label />
      </ThemeProvider>,
    );

    expect(wrapper).toBeDefined();
  });
});

/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Pen3 as EditIcon } from '../../../icons';
import Theme from '../../../theme';
import Address from '../Address';
import IdentityIcon from '../IdentityIcon';
import Account from './Account';

describe('Account', () => {
  it('should render nested components', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <Account identity={true} address="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" />
      </ThemeProvider>,
    );

    expect(component).toBeDefined();
  });

  it('shows Address when address provided', () => {
    const component = mount(
      <ThemeProvider theme={Theme}>
        <Account address="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" />
      </ThemeProvider>,
    );

    expect(component.find(Address).props().address).toEqual('0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98');
  });

  it('not editable by default', () => {
    const component = shallow(
      <ThemeProvider theme={Theme}>
        <Account address="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" />
      </ThemeProvider>,
    );

    expect(component.find(EditIcon)).toHaveLength(0);
  });

  it('not identityIcon by default', () => {
    const component = shallow(
      <ThemeProvider theme={Theme}>
        <Account address="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" />
      </ThemeProvider>,
    );

    expect(component.find(IdentityIcon)).toHaveLength(0);
  });

  it('shows identity when true', () => {
    const component = mount(
      <ThemeProvider theme={Theme}>
        <Account identity={true} address="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" />
      </ThemeProvider>,
    );

    expect(component.find(IdentityIcon)).toHaveLength(1);
  });
});

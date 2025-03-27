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

import { Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { mount } from 'enzyme';
import * as React from 'react';
import { Theme } from '../../../index';
import Address from './Address';

describe('Address', () => {
  it('shows address', () => {
    const component = mount(
      <ThemeProvider theme={Theme}>
        <Address address="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" />
      </ThemeProvider>,
    );

    expect(component.find(Typography).props().children).toEqual('0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98');
  });

  it('shows sanitized hex', () => {
    const component = mount(
      <ThemeProvider theme={Theme}>
        <Address address="FBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" shortened={true} />
      </ThemeProvider>,
    );

    expect(component.find(Typography).props().className).toContain('shortenedAddress');
  });
});

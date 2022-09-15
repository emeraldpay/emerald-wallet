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

import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import Address from './Address';
import { Theme } from '../../../index';

describe('Address', () => {
  it('shows address', () => {
    const accountAddr = mount(
      <ThemeProvider theme={Theme}>
        <Address id="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" />
      </ThemeProvider>,
    );

    expect(accountAddr.find(Typography).props().children).toEqual('0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98');
  });

  it('has showCheck == false by default', () => {
    const accountAddr = shallow(
      <ThemeProvider theme={Theme}>
        <Address id="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" />
      </ThemeProvider>,
    );

    expect(accountAddr.props().showCheck).toBeFalsy();
  });

  it('shows sanitized hex', () => {
    const accountAddr = mount(
      <ThemeProvider theme={Theme}>
        <Address id="FBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" shortened={true} />
      </ThemeProvider>,
    );

    expect(accountAddr.find(Typography).props().className).toContain('shortenedAddress');
  });
});

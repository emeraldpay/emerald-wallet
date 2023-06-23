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
import * as React from 'react';
import Page from './Page';
import Theme from '../../../theme';

describe('Page', () => {
  it('it renders without crash with string title', () => {
    const wrapper = render(
      <ThemeProvider theme={Theme}>
        <Page title="Title" />
      </ThemeProvider>,
    );
    expect(wrapper).toBeDefined();
  });
  it('it renders without crash with component title', () => {
    const wrapper = render(
      <ThemeProvider theme={Theme}>
        <Page title={<div>title</div>} />
      </ThemeProvider>,
    );
    expect(wrapper).toBeDefined();
  });
});

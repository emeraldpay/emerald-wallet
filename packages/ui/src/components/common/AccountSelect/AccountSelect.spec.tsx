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

import { ThemeProvider } from '@material-ui/core/styles';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import Theme from '../../../theme';
import { AccountSelect } from './AccountSelect';

describe('AccountSelect', () => {
  it('should handle empty address list and selected address', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <AccountSelect />
      </ThemeProvider>,
    );

    expect(component).toBeDefined();
  });

  it('should work without onChange prop', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <AccountSelect accounts={{ 0: '0x1987' }} />
      </ThemeProvider>,
    );

    const node = component.getByText('0x1987');

    // Click to a popup menu
    fireEvent.click(node.parentNode.parentNode);

    const nodes = component.getAllByText('0x1987');

    // Click on popup menu item
    fireEvent.click(nodes[1].parentNode.parentNode.parentNode);
  });
});

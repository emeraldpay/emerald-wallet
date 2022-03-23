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
import {fireEvent, render} from '@testing-library/react';
import * as React from 'react';
import {AccountSelect} from './AccountSelect';

const reduceClasses = (prev, curr) => ({...prev, [curr]: curr});
const classes = Object.keys({root: {}}).reduce(reduceClasses, {});

describe('AccountSelect', () => {
  it('should renders without crash', () => {
    const component = render(<AccountSelect classes={classes} accounts={[]}/>);
    expect(component).toBeDefined();
  });

  it('should work without onChange prop', () => {
    const component = render(<AccountSelect classes={classes} accounts={['0x1987']}/>);
    const node = component.getByText('0x1987');
    // click to pop up menu
    fireEvent.click(node.parentNode.parentNode);
    const nodes = component.getAllByText('0x1987');
    // click on popup menu item
    fireEvent.click(nodes[1].parentNode.parentNode.parentNode);
  });

  it('should handle empty address list and selected address', () => {
    const component = render(<AccountSelect classes={classes}/>);
    expect(component).toBeDefined();
  });
});

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
import {shallow} from 'enzyme';
import * as React from 'react';

import {IdentityIcon} from './IdentityIcon';

beforeEach(() => {
  const createElement: any = document.createElement.bind(document);
  document.createElement = (tagName) => {
    if (tagName === 'canvas') {
      return {
        toDataURL: jest.fn(() => ({})),
        getContext: jest.fn(() => ({
          fillStyle: null,
          fillRect: jest.fn(),
          drawImage: jest.fn(),
          getImageData: jest.fn()
        }))
      };
    }
    return createElement(tagName);
  };
});

describe('IdentityIcon', () => {
  it('has default size 40', () => {
    const component = shallow(<IdentityIcon id='0x1234567890'/>);
    expect(component.props().style.height).toEqual('40px');
  });
});

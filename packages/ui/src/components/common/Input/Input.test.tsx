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
import {Input} from './Input';

const reduceClasses = (prev, curr) => ({...prev, [curr]: curr});
const classes = Object.keys({}).reduce(reduceClasses, {});
const build = () => shallow(<Input classes={classes}/>);

describe('Input', () => {
  it('Renders', () => {
    const component = build();
    expect(component).toBeDefined();
  });

  it('should wrap TextField', () => {
    const wrapper = shallow(<Input classes={classes}/>);
    expect(wrapper.first().name()).toContain('TextField');
  });

  it('should has type prop', () => {
    const component = shallow(<Input type='number' classes={classes}/>);
    expect(component).toBeDefined();
  });
});

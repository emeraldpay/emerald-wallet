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
import Checkbox from '../Checkbox';
import {ButtonGroup} from './ButtonGroup';

import styles from './styles';

const reduceClasses = (prev, curr) => ({...prev, [curr]: curr});
const classes = Object.keys(styles).reduce(reduceClasses, {});

test('Empty children list', () => {
  const component = shallow(<ButtonGroup classes={classes}/>);
  expect(component).toBeDefined();
});

test('Renders children list', () => {
  const wrapper = shallow(<ButtonGroup classes={classes}>
    <Checkbox/>
    <Checkbox/>
  </ButtonGroup>);
  expect(wrapper.children()).toHaveLength(2);
});

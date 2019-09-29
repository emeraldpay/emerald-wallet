import { shallow } from 'enzyme';
import * as React from 'react';
import { NotificationBar } from './NotificationBar';

const reduceClasses = (prev: any, curr: any) => ({ ...prev,  [curr]: curr });
const classes = Object.keys({ success: {}, info: {}, error: {}, common: {} }).reduce(reduceClasses, {});

describe('NotificationBar', () => {
  it('should be created without crash', () => {
    const component = shallow(<NotificationBar classes={classes}/>);
    expect(component).toBeDefined();
  });
});

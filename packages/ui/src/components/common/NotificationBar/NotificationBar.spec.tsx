import * as React from 'react';
import { shallow } from 'enzyme';
import { NotificationBar } from './NotificationBar';


const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys({ success: {}, info: {}, error: {}, common: {} }).reduce(reduceClasses, {});

describe('NotificationBar', () => {
  it('should be created without crash', () => {
    const component = shallow(<NotificationBar classes={classes}/>);
    expect(component).toBeDefined();
  });
});



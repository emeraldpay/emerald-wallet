import { render } from '@testing-library/react';
import * as React from 'react';
import { NotificationBar } from './NotificationBar';

const reduceClasses = (prev: any, curr: any) => ({ ...prev, [curr]: curr });
const classes = Object.keys({ success: {}, info: {}, error: {}, common: {} }).reduce(reduceClasses, {});

describe('NotificationBar', () => {
  it('should be created without crash', () => {
    const component = render(
      <NotificationBar
        notificationMessage='message55'
        classes={classes}
      />
      );
    expect(component).toBeDefined();
  });
});

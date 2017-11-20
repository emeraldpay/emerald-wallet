import React from 'react';
import { shallow } from 'enzyme';

import { WaitConnectionDialog } from './waitDialog';

test('Creation works', () => {
  const component = shallow(<WaitConnectionDialog />);
});

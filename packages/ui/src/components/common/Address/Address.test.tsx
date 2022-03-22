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
import Typography from '@material-ui/core/Typography';
import {mount, render, shallow} from 'enzyme';
import * as React from 'react';
import {Address, getStyles} from './Address';

const reduceClasses = (prev, curr) => ({...prev, [curr]: curr});
const classes = Object.keys(getStyles()).reduce(reduceClasses, {});

const mockMuiTheme = {
  palette: {}
};

describe('Address', () => {
  // TODO: Solve it! Should we require id or not?
  // it('works without provided id', () => {
  //   const component = shallow(<Address classes={classes} muiTheme={mockMuiTheme} />);
  //   expect(component.find('div')).toHaveLength(0);
  // });

  it('shows address', () => {
    const accountAddr = shallow(<Address classes={classes} id='0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98'
                                         muiTheme={mockMuiTheme}/>);

    expect(accountAddr.find(Typography).props().children)
      .toEqual('0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98');
  });

  // it('shows shortened address', () => {
  //   const accountAddr = render(
  //       <Address classes={classes} shortened id="0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98" muiTheme={mockMuiTheme} />
  //   );
  //   //expect(accountAddr.find(Typography).props().children).toEqual('0xFBb1b...0fBB98');
  //   console.log(accountAddr.text());
  // });

  it('has showCheck == false by default', () => {
    const accountAddr = shallow(<Address classes={classes} id='0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98'
                                         muiTheme={mockMuiTheme}/>);
    expect(accountAddr.props().showCheck).toBeFalsy();
  });

  it('shows sanitized hex', () => {
    const accountAddr = shallow(<Address classes={classes} shortened={true}
                                         id='FBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98' muiTheme={mockMuiTheme}/>);
    expect(accountAddr.find(Typography).props().className).toEqual('shortenedAddress');
  });
});

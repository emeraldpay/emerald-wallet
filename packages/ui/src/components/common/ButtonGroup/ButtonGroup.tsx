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
import withStyles from '@material-ui/core/styles/withStyles';
import * as React from 'react';
import styles from './styles';

interface Props {
  children?: any[];
  classes?: any;
  style?: any;
}

export const ButtonGroup = ({classes, children, style}: Props) => {
  if (!children) {
    return null;
  }
  let key = 0;
  return (
    <div className={classes?.container} style={style}>
      {children.map((btn) => {
        const item = (
          <div key={key} className={(key === 0) ? classes?.firstItem : classes?.item}>
            {btn}
          </div>);
        key += 1;
        return item;
      })}
    </div>
  );
};

export default withStyles(styles)(ButtonGroup);

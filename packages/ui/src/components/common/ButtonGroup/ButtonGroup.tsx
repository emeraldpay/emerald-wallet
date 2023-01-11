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

interface Classes {
  container: string;
  firstItem: string;
  item: string;
}

interface OwnProps {
  children?: React.ReactNode | React.ReactNode[];
  classes?: Classes;
  style?: React.CSSProperties;
}

export const ButtonGroup: React.FC<OwnProps> = ({ classes, children, style }) => {
  if (children == null) {
    return null;
  }

  return (
    <div className={classes?.container} style={style}>
      {Array.isArray(children) ? (
        children.map((button, index) => (
          <div key={`group-button[${index}]`} className={index === 0 ? classes?.firstItem : classes?.item}>
            {button}
          </div>
        ))
      ) : (
        <div className={classes?.firstItem ?? classes?.item}>{children}</div>
      )}
    </div>
  );
};

export default withStyles(styles)(ButtonGroup);

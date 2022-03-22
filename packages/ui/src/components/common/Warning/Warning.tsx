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
  classes?: any;
  children?: any;
}

export const WarningHeader = withStyles(styles)((props: Props) => (
  <div className={props.classes.header}>
    {props.children}
  </div>));

export const WarningText = withStyles(styles)((props: Props) => (
  <div className={props.classes.text}>
    {props.children}
  </div>
));

interface WarningProps extends Props {
  fullWidth?: any;
}

export const Warning = withStyles(styles)((props: WarningProps) => {
  const {fullWidth, classes} = props;
  const style: { width?: string, maxWidth?: string } = {};
  if (fullWidth) {
    style.width = '100%';
    style.maxWidth = 'inherit';
  }

  return (
    <div className={classes.container} style={style}>
      {props.children}
    </div>);
});

export default Warning;

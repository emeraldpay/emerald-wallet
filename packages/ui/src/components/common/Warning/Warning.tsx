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
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()({
  container: {
    maxWidth: '580px',
    borderRadius: '1px',
    backgroundColor: '#F9F2F2',
    color: '#CF3B3B',
    fontSize: '14px',
    lineHeight: '22px',
    paddingTop: '14px',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '10px'
  },
  header: {
    fontWeight: 'bold'
  },
  text: {
    paddingBottom: '10px'
  }
});

interface Props {
  children?: React.ReactNode;
}

export const WarningHeader: React.FC<Props> = (props) => {
  const { classes } = useStyles();
  return (
    <div className={classes.header}>
      {props.children}
    </div>
  );
};

export const WarningText: React.FC<Props> = (props) => {
  const { classes } = useStyles();
  return (
    <div className={classes.text}>
      {props.children}
    </div>
  );
};

interface WarningProps extends Props {
  fullWidth?: boolean;
}

export const Warning: React.FC<WarningProps> = (props) => {
  const { classes } = useStyles();
  const { fullWidth, children } = props;
  const style: { width?: string, maxWidth?: string } = {};
  if (fullWidth) {
    style.width = '100%';
    style.maxWidth = 'inherit';
  }

  return (
    <div className={classes.container} style={style}>
      {children}
    </div>
  );
};

export default Warning;

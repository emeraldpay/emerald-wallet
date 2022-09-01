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

import { Theme, createStyles } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    children: {
      overflowY: 'auto',
      padding: theme.spacing(4),
    },
    footer: {
      padding: theme.spacing(2),
    },
    root: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      overflow: 'hidden',
    },
    toolbar: {
      background: 'transparent',
      flex: 0,
      justifyContent: 'space-between',
    },
  }),
);

interface OwnProps {
  className?: string;
  footer?: React.ReactElement;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  title: React.ReactElement | string;
}

const getIconWithButton = (icon?: React.ReactElement): React.ReactElement => {
  if (icon == null) {
    return <div />;
  }

  return (
    <IconButton onClick={icon.props.onClick}>
      {React.cloneElement(icon, { ...icon.props, onClick: undefined })}
    </IconButton>
  );
};

export const PageTitle: React.FC = ({ children }) => (
  <Typography variant="h6" color="inherit">
    {children}
  </Typography>
);

export const Page: React.FC<OwnProps> = ({ children, footer, leftIcon, rightIcon, title }) => {
  const styles = useStyles();

  return (
    <Paper classes={{ root: styles.root }}>
      <Toolbar className={styles.toolbar}>
        {getIconWithButton(leftIcon)}
        {typeof title === 'string' ? <PageTitle>{title}</PageTitle> : title}
        {getIconWithButton(rightIcon)}
      </Toolbar>
      <Divider />
      <div className={styles.children}>{children}</div>
      {footer != null && (
        <>
          <Divider />
          <div className={styles.footer}>{footer}</div>
        </>
      )}
    </Paper>
  );
};

export default Page;

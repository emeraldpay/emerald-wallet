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
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import {withStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';

const styles = (theme) => ({
  root: {},
  typography: {},
  toolbar: {
    background: 'transparent',
    height: theme && theme.spacing(10),
    flex: 1,
    justifyContent: 'space-between'
  },
  childWrapper: {
    padding: theme && theme.spacing(4)
  }
});

const getIconWithButton = (icon: React.ReactElement) => {
  if (!icon) {
    return <div/>;
  }
  // move onClick handler from icon to IconButton
  const onClickHandler = icon.props.onClick || undefined;
  return (
    <IconButton onClick={onClickHandler}>
      {React.cloneElement(icon, {...icon.props, onClick: undefined})}
    </IconButton>
  );
};

interface IPageProps {
  title: React.ReactElement | string;
  className?: string;
  classes?: any;
  rightIcon?: any;
  leftIcon?: any;
  children?: any;
}

export interface IPageTile {
  children: React.ReactElement | string;
}

export function PageTitle(props: IPageTile) {
  return (
    <Typography variant='h6' color='inherit'>
      {props.children}
    </Typography>
  );
}

export function Page(props: IPageProps) {
  const {
    title, leftIcon, rightIcon, classes
  } = props;
  const isTitleString = (typeof title === 'string');
  return (
    <Paper className={classes?.root}>
      <Toolbar className={classes?.toolbar}>
        {getIconWithButton(leftIcon)}
        {isTitleString && (<PageTitle>{title}</PageTitle>)}
        {!isTitleString && title}
        {getIconWithButton(rightIcon)}
      </Toolbar>

      <Divider/>

      <div className={classes?.childWrapper}>
        {props.children}
      </div>
    </Paper>
  );
}

export default withStyles(styles, {name: 'EmeraldPage'})(Page);

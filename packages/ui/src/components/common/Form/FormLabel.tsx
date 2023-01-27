import { StyleRules, Theme } from '@material-ui/core';
import { WithStyles, createStyles, withStyles } from '@material-ui/styles';
import classNames from 'classnames';
import * as React from 'react';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      color: theme.palette.text.secondary,
      flexShrink: 0,
      fontSize: 16,
      fontWeight: 400,
      paddingRight: 30,
      textAlign: 'right',
      width: 160,
    },
    top: {
      alignSelf: 'flex-start',
      paddingTop: 10,
    },
  });

interface OwnProps {
  top?: boolean;
}

class Label extends React.Component<OwnProps & WithStyles<typeof styles>> {
  public render(): React.ReactElement {
    const { classes, children, top = false } = this.props;

    return <label className={classNames(classes.root, top ? classes.top : null)}>{children}</label>;
  }
}

export default withStyles(styles)(Label);

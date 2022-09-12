import { StyleRules, Theme } from '@material-ui/core';
import { WithStyles, createStyles, withStyles } from '@material-ui/styles';
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
  });

export class Label extends React.Component<WithStyles<typeof styles>> {
  public render(): React.ReactElement {
    const { classes, children } = this.props;

    return <label className={classes.root}>{children}</label>;
  }
}

export default withStyles(styles)(Label);

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
      fontFamily: theme.typography.fontFamily
    },
    top: {
      alignSelf: 'flex-start',
      lineHeight: '28px',
      paddingTop: 10,
    },
  });

interface OwnProps {
  top?: boolean | number;
}

class Label extends React.Component<OwnProps & WithStyles<typeof styles>> {
  public render(): React.ReactNode {
    const { classes, children, top } = this.props;

    return (
      <label
        className={classNames(classes.root, top == null ? undefined : classes.top)}
        style={{ paddingTop: typeof top === 'number' ? top : undefined }}
      >
        {children}
      </label>
    );
  }
}

export default withStyles(styles)(Label);

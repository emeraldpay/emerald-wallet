import { CSSProperties, withStyles } from '@material-ui/styles';
import * as React from 'react';

const styles = (theme?: any) => ({
  root: {
    color: theme.palette && theme.palette.text.secondary,
    flexShrink: 1,
    width: '120px',
    textAlign: 'right',
    paddingRight: '30px',
    fontSize: '16px',
    fontWeight: 400
  } as CSSProperties
});

interface Props {
  classes?: any;
}

export class Label extends React.Component<Props> {
  public render () {
    const { classes, children } = this.props;
    return (<label className={classes.root}>{children}</label>);
  }
}

export default withStyles(styles)(Label);

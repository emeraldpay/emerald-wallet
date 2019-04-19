import * as React from 'react';
import { withStyles, CSSProperties } from '@material-ui/styles';

const styles = (theme?: any) => ({
  root: {
    color: theme.palette && theme.palette.text.secondary,
    flexShrink: 1,
    width: '120px',
    textAlign: 'right',
    paddingRight: '30px',
    fontSize: '16px',
    fontWeight: 400,
  } as CSSProperties
});

interface Props {
  classes?: any;
}

export class Label extends React.Component<Props> {
  render() {
    const { classes, children } = this.props;
    return (<label className={classes.root}>{children}</label>);
  }
}

export default withStyles(styles)(Label);

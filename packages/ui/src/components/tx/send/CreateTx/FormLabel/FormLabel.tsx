import * as React from 'react';
import withStyles, {CSSProperties} from '@material-ui/core/styles/withStyles';

const styles = (theme?: any) => ({
  root: {
    color: theme.palette.text.secondary,
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

class Label extends React.Component<Props> {
  render() {
    return (<label className={this.props.classes.root}>{this.props.children}</label>);
  }
}

export default withStyles(styles)(Label);

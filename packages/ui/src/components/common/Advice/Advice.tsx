import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import AdviceIcon from './AdviceIcon';

const styles = {
  title: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px'
  },
  text: {
    fontSize: '14px',
    lineHeight: '22px'
  },
  container: {
    display: 'flex'
  },
  adviceIcon: {
    marginRight: '20px'
  }
};

interface IAdviceProps {
  title?: any;
  text?: any;
  classes?: any;
}

const Advice = (props: IAdviceProps) => {
  const { title, text, classes } = props;
  return (
    <div className={classes.container} >
      <div className={classes.adviceIcon}>
        <AdviceIcon/>
      </div>
      <div>
        <div className={classes.title}>{title}</div>
        <div className={classes.text}>{text}</div>
      </div>
    </div>
  );
};

export default withStyles(styles)(Advice);

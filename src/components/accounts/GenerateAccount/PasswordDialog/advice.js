import React from 'react';
import withStyles from 'react-jss';
import { AdviceIcon } from 'elements/Icons';

const styles2 = {
  title: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  text: {
    fontSize: '14px',
    lineHeight: '22px',
  },
  container: {
    display: 'flex',
  },
  adviceIcon: {
    marginRight: '20px',
  },
};

const Advice = (props) => {
  const { title, text, classes } = props;
  return (
    <div className={ classes.container } >
      <div className={ classes.adviceIcon }>
        <AdviceIcon/>
      </div>
      <div>
        <div className={ classes.title }>{ title }</div>
        <div className={ classes.text }>{ text }</div>
      </div>
    </div>
  );
};

export default withStyles(styles2)(Advice);

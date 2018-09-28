import React from 'react';

import { AdviceIcon } from 'elements/Icons';

const styles = {
  title: {
    fontSize: '16px',
    fontWeight: '500',
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
  const { title, text } = props;

  return (
    <div style={ styles.container } >
      <div style={ styles.adviceIcon }>
        <AdviceIcon/>
      </div>
      <div>
        <div style={ styles.title }>{ title }</div>
        <div style={ styles.text }>{ text }</div>
      </div>
    </div>
  );
};

export default Advice;

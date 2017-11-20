import React from 'react';
import PropTypes from 'prop-types';

import styles from './warning.scss';

export const WarningHeader = (props) => {
  return (<div className={ styles.header }>
    { props.children }
  </div>);
};

WarningHeader.propTypes = {
  children: PropTypes.node,
};

export const WarningText = (props) => {
  return (
    <div className={ styles.text }>
      { props.children }
    </div>
  );
};

WarningText.propTypes = {
  children: PropTypes.node,
};

export const Warning = (props) => {
  const { fullWidth } = props;
  const style = {};
  if (fullWidth) {
    style.width = '100%';
  }

  return (<div className={ styles.container } style={ style }>
    { props.children }
  </div>);
};

Warning.propTypes = {
  children: PropTypes.node,
  fullWidth: PropTypes.bool,
};

export default Warning;

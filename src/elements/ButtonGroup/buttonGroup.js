// @flow
import React from 'react';
import PropTypes from 'prop-types';

import styles from './buttonGroup.scss';

export const ButtonGroup = ({ children }: { children: Array<any>}) => {
  if (!children) {
    return null;
  }
  let key = 0;
  return (
    <div className={ styles.container }>
      { children.map((btn) => (
        <div key={ key++ } className={ styles.item }>
          { btn }
        </div>
      ))}
    </div>
  );
};

ButtonGroup.propTypes = {
  children: PropTypes.array,
};

export default ButtonGroup;

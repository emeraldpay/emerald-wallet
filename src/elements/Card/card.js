import React from 'react';
import PropTypes from 'prop-types';

import styles from './card.scss';

const Card = (props) => {
  return (
    <div style={ props.style } className={ styles.card }>
      { props.children }
    </div>);
};

Card.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export default Card;


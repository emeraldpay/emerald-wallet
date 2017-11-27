import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './identityIcon.scss';

const blockies = require('lib/blockies');

const IdentityIcon = ({ id, expanded, size, onClick }) => {
  const iconSize = Number.isInteger(size) ? size : 40;
  const icon = blockies.create({ seed: id, size: 8, scale: 4 }).toDataURL();
  const mainStyle = {
    height: `${iconSize}px`,
    width: `${iconSize}px`,
    minWidth: `${iconSize}px`,
    background: `url(${icon})`,
    borderRadius: '50%',
    position: 'relative',
  };

  const expandButton = expanded ? '' : (<div className={ styles.expandedButton }/>);
  const cx = classNames.bind(styles);
  const className = cx({
    clickAble: (onClick !== null) && (typeof onClick === 'function'),
  });

  return (
    <div style={ mainStyle } onClick={ onClick } className={ className }>
      { expandButton }
    </div>
  );
};

IdentityIcon.propTypes = {
  id: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  size: PropTypes.number,
  onClick: PropTypes.func,
};

export default IdentityIcon;

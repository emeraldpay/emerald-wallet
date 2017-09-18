import React from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';

import { copyIcon, link } from 'lib/styles';
import { CloneIcon } from '../Icons';


import styles from './accountAddress.scss';

const AccountAddress = (props) => {
    const { id, shortened, onClick, style } = props;
    function copyAddressToClipBoard() {
        copy(id);
    }

    let icons = null;
    if (!shortened) {
        icons = <CloneIcon
            onClick={ copyAddressToClipBoard }
            color={ styles.container.color }
            style={ copyIcon }
            className={ styles.copyIcon }
        />;
    }
    return (
        <div className={ styles.container } style={ style }>
            <div onClick={onClick} style={{...link}}>
                {shortened ? `${id.substring(2, 7)}...${id.substring(id.length - 6, id.length - 1)}` : id}
            </div>
            {icons}
        </div>
    );
};

AccountAddress.propTypes = {
    onClick: PropTypes.func,
    id: PropTypes.string.isRequired,
    shortened: PropTypes.bool,
};

export default AccountAddress;

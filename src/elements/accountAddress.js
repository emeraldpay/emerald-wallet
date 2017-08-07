import React from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';

import { CloneIcon } from './icons';
import { copyIcon, link } from 'lib/styles';

const AccountAddress = (props) => {
    const { id, shortened, onClick } = props;
    function copyAddressToClipBoard() {
        copy(id);
    }
    const styles = {
        light: {
            color: '#747474',
            fontWeight: '300',
            fontSize: '14px',
        },
    };
    let icons = null;
    if (!shortened) {
        icons = <CloneIcon onClick={copyAddressToClipBoard} color={styles.light.color} style={copyIcon} />;
    }
    return (
        <div style={{...styles.light, display: 'flex', alignItems: 'center'}}>
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

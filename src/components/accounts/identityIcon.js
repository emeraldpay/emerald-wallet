import React from 'react';
import PropTypes from 'prop-types';

const blockies = require('lib/blockies');


class IdentityIcon extends React.Component {

    render() {
        const { id, expanded, size } = this.props;
        const iconSize = Number.isInteger(size) ? size : 40;
        const iconBg = blockies.create({seed: id, size: 8, scale: 4}).toDataURL();
        const styles = {
            marginRight: '16px',
            height: `${iconSize}px`,
            width: `${iconSize}px`,
            background: `url(${iconBg})`,
            borderRadius: '50%',
            position: 'relative',
        };

        const expandBtnStyles = {
            position: 'absolute',
            fontFamily: 'FontAwesome',
            top: 0,
            fontStyle: 'normal',
            fontWeight: 'normal',
            left: '24px',
            fontSize: '20px',
            height: '20px',
            width: '20px',
            margin: 0,
            color: '#47B04B',
            backgroundColor: 'white',
            borderRadius: '50%',
            textAlign: 'center',
            border: '1px solid #FFFFFF',
        };

        const expandBtn = expanded ? '' : (<div style={expandBtnStyles} className="fa-plus-circle" />);
        return (
            <div style={styles} >
                {expandBtn}
            </div>
        );
    }
}

IdentityIcon.propTypes = {
    id: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    size: PropTypes.number
};

export default IdentityIcon;

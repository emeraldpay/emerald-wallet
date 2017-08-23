import React from 'react';

import styles from './warning.scss';

export const WarningHeader = (props) => {
    return (<div className={ styles.header }>
        { props.children }
    </div>);
};

export const WarningText = (props) => {
    return (
        <div className={ styles.text }>
            { props.children }
        </div>
    );
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

export default Warning;
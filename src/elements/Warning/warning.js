import React from 'react';

import styles from './warning.scss';

export const WarningHeader = (props) => {
    return (<div className={ styles.header }>
        { props.children }
    </div>);
};

export const WarningText = (props) => {
    return (<div>
        { props.children }
    </div>);
};

export const Warning = (props) => {
    return (<div className={ styles.container }>
        { props.children }
    </div>);
};

export default Warning;
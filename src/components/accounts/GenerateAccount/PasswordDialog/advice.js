import React from 'react';

import styles from './advice.scss';

const Advice = (props) => {

    const { title, text } = props;

    return (
        <div>
            <div className={ styles.title }>{ title }</div>
            <div className={ styles.text }>{ text }</div>
        </div>
    );
};

export default Advice;
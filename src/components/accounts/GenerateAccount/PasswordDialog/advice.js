import React from 'react';

import { AdviceIcon } from 'elements/Icons';

import styles from './advice.scss';

const Advice = (props) => {
    const { title, text } = props;

    return (
        <div className={ styles.container } >
            <div className={ styles.adviceIcon }>
                <AdviceIcon/>
            </div>
            <div>
                <div className={ styles.title }>{ title }</div>
                <div className={ styles.text }>{ text }</div>
            </div>
        </div>
    );
};

export default Advice;

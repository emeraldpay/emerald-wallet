import React from 'react';
import { FontIcon } from 'material-ui';

import styles from './status.scss';

const Status = (props) => {

    const { status } = props;
    if (status === 'success') {
        return (<div className={ styles.success }>Success</div>);
    } else if (status === 'queue') {
        return (<div className={ styles.queue }>
            <FontIcon className="fa fa-spin fa-spinner"/>&nbsp;In queue
        </div>);
    }
    return (<div>
        Unknown status
    </div>);
};

export default Status;
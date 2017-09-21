import React from 'react';
import { Dialog, IconButton } from 'material-ui';
import { CloseIcon } from 'elements/Icons';

import AddToken from '../AddToken/add';
import TokensList from '../TokensList/list';

import styles from './tokensDialog.scss';

export default class TokensDialog extends React.Component {
    render() {
        const { onClose } = this.props;

        return (
            <Dialog modal={true} open={true} onRequestClose={ onClose } contentStyle={{maxWidth: '600px'}}>
                <div style={{width: '100%'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div className={styles.title}>Add token by address</div>
                        <div>
                            <IconButton
                                className={ styles.closeButton }
                                onTouchTap={ onClose }
                                tooltip="Close">
                                <CloseIcon/>
                            </IconButton>
                        </div>
                    </div>
                    <div>
                        <div className={styles.tokens}>
                            <TokensList/>
                        </div>
                        <div className={styles.addToken}>
                            <AddToken/>
                        </div>
                    </div>
                </div>
            </Dialog>);
    }
}

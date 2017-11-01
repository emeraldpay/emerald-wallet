import React from 'react';
import { Dialog, IconButton } from 'material-ui';
import CloseButton from 'elements/CloseButton';
import AddToken from '../AddToken';
import TokensList from '../TokensList/list';

import styles from './tokensDialog.scss';


export default class TokensDialog extends React.Component {
    render() {
        const { onClose } = this.props;

        return (
            <Dialog modal={true} open={true} onRequestClose={ onClose } contentStyle={{maxWidth: '600px'}}>
                <div style={{width: '100%'}}>
                    <div className={ styles.header }>
                        <div className={styles.title}>Add token by address</div>
                        <div>
                            <CloseButton className={ styles.closeButton } onClick={ onClose }/>
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

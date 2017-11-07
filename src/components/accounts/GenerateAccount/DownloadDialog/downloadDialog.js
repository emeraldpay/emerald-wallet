import React from 'react';

import Button from 'elements/Button';
import { Form, Row, styles as formStyles } from 'elements/Form';
import { Warning, WarningHeader, WarningText } from 'elements/Warning';

import styles from './downloadDialog.scss';

const DownloadDialog = (props) => {
    const { accountId, onDownload, onBack, t } = props;
    return (

        <Form caption={ t('generate.title') } onCancel={ onBack }>
            <Row>
                <div style={formStyles.left}/>
                <div style={formStyles.right}>
                    <div>
                        <div className={ styles.title }>
                            Download the Account Key File
                        </div>
                        <div className={ styles.subTitle }>
                            And save the copy in a safe place (not on this computer).
                        </div>
                        <div className={ styles.description }>
                            You need an Account Key File to make all operations with account. In order to manage or create transactions from this Ethereum Classic Account, you will need this file.  You will also need the strong password you created earlier.
                        </div>
                    </div>
                </div>
            </Row>

            <Row>
                <div style={formStyles.left}/>
                <div style={formStyles.right}>
                    <Warning>
                        <WarningHeader>Don't lose it!</WarningHeader>
                        <WarningText>If you lose the file – you will lose all funds. We can't restore it.<br />The safest way to store a file is a Hardware Secure Storage</WarningText>
                        <WarningHeader>If someone had it</WarningHeader>
                        <WarningText>If someone gets access to your account file, they will have full access to your account and funds.</WarningText>
                        <WarningHeader>Don't place a copy on this computer</WarningHeader>
                        <WarningText>You can lose the file if the computer breaks. Some choose to store the Keystore File on a flash drive, which is great because then you can keep it on a keychain or locked in a drawer.  Again, just don't lose it!
                        </WarningText>
                    </Warning>
                </div>
            </Row>

            <Row>
                <div style={formStyles.left}/>
                <div style={formStyles.right}>
                    <Button primary onClick={ onDownload } label="Download account" />
                </div>
            </Row>
        </Form>
    );
};


export default DownloadDialog;

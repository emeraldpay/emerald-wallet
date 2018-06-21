import React from 'react';
import { Button, Warning, WarningHeader, WarningText, Page } from 'emerald-js-ui';
import { Row, styles as formStyles } from 'elements/Form';
import { Back } from 'emerald-js-ui/lib/icons3';
import getLoadingIcon from '../getLoadingIcon';
import styles from './downloadDialog.scss';

export const DownloadDialog = (props) => {
  const { onDownload, onBack, t } = props;
  return (
    <Page title={ t('generate.title') } leftIcon={ <Back onClick={onBack} /> }>
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
              You need an Account Key File to make all operations with an account. In order to manage or create transactions from this Ethereum Classic Account, you will need this file.  You will also need the strong password you created earlier.

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
            <WarningText>If someone gets access to your Account Key File, they will have full access to your account and funds.</WarningText>
            <WarningHeader>Don't place a copy on this computer</WarningHeader>
            <WarningText>You can lose this file if the computer breaks. Some choose to store the Account Key File on a flash drive, which is great because then you can keep it on a keychain or locked in a drawer.  Again, just don't lose it!
            </WarningText>
          </Warning>
        </div>
      </Row>

      <Row>
        <div style={formStyles.left}/>
        <div style={formStyles.right}>
          <Button primary onClick={ onDownload } label="Download account key file" icon={getLoadingIcon(props)} disabled={props.loading}/>
        </div>
      </Row>
    </Page>
  );
};


export default DownloadDialog;

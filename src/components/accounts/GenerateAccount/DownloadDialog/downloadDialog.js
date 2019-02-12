import React from 'react';
import withStyles from 'react-jss';
import {
  Warning, WarningHeader, WarningText
} from 'emerald-js-ui';
import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import Button from 'elements/Button';
import { Row, styles as formStyles } from 'elements/Form';
import LoadingIcon from '../LoadingIcon';

export const styles2 = {
  description: {
    color: '#747474',
    fontSize: '14px',
    lineHeight: '22px',
    marginBottom: '20px',
    marginTop: '7px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '24px',
  },
  subTitle: {
    fontSize: '14px',
    lineHeight: '22px',
  },
};

export const DownloadDialog = (props) => {
  const {
    onDownload, onBack, t, classes,
  } = props;
  return (
    <Page title={ t('generate.title') } leftIcon={ <Back onClick={onBack} /> }>
      <div>
        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <div>
              <div className={ classes.title }>
                Download the Account Key File
              </div>
              <div className={ classes.subTitle }>
                And save the copy in a safe place (not on this computer).
              </div>
              <div className={ classes.description }>
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
            <Button
              primary
              onClick={ onDownload }
              label="Download account key file"
              icon={<LoadingIcon {...props} />}
              disabled={props.loading}
            />
          </div>
        </Row>
      </div>
    </Page>
  );
};


export default withStyles(styles2)(DownloadDialog);

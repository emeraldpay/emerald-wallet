import {
  Page, Warning, WarningHeader, WarningText
} from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button, FormRow } from '@emeraldwallet/ui';
import {CSSProperties, withStyles} from '@material-ui/styles';
const QRCode = require('qrcode.react');
import * as React from 'react';

const styles = {
  title: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px'
  },
  subTitle: {
    fontSize: '14px',
    lineHeight: '22px'
  },
  keyTitle: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '24px'
  },
  key: {
    fontSize: '14px',
    lineHeight: '22px',
    overflowWrap: 'break-word'
  } as CSSProperties,
  privKeyContainer: {
    marginLeft: '30px',
    overflow: 'hidden'
  },
  privKeyColumn: {
    display: 'flex',
    alignItems: 'flex-start !important'
  }
};

export interface IShowPrivateKeyProps {
  onBack?: any;
  onNext?: any;
  privateKey: string;
  classes: any;
  t: any;
}

const ShowPrivateDialog = (props: IShowPrivateKeyProps) => {
  const {
    onBack, onNext, privateKey, t, classes
  } = props;
  return (
    <Page title={t('accounts.generate.title')} leftIcon={<Back onClick={onBack} />}>
      <div>
        <FormRow
          rightColumn={(
            <div>
              <div className={classes.title}>Print this</div>
              <div className={classes.subTitle}>
                This is the unencrypted text version of your private key, meaning no password is necessary.
                It helps if you forget your password.
              </div>
            </div>
          )}
        />

        <FormRow
          rightColumn={(
            <Warning>
              <WarningHeader>Keep it in safety</WarningHeader>
              <WarningText>
                If someone gains access to your unencrypted private key, they will be able to access your account and funds without a password.
              </WarningText>
            </Warning>
          )}
        />

        <FormRow
          rightColumn={(
            <div className={classes.privKeyColumn}>
              <div>
                <QRCode
                  size={100}
                  value={privateKey!}
                />
              </div>
              <div className={classes.privKeyContainer}>
                <div className={classes.keyTitle}>Unencrypted Private Key</div>
                <div className={classes.key}>
                  {privateKey}
                </div>
              </div>
            </div>
          )}
        />
        <FormRow
          rightColumn={(
            <Button primary={true} onClick={onNext} label='Next' />
          )}
        />
      </div>
    </Page>
  );
};

export default withStyles(styles)(ShowPrivateDialog);

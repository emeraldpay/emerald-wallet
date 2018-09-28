import React from 'react';
import QRCode from 'qrcode.react';
import { Button, Warning, WarningHeader, WarningText, Page } from 'emerald-js-ui';
import { Row, styles as formStyles } from 'elements/Form';
import { Back } from 'emerald-js-ui/lib/icons3';

const styles = {
  title: {
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '24px',
  },

  subTitle: {
    fontSize: '14px',
    lineHeight: '22px',
  },

  keyTitle: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '24px',
  },

  key: {
    fontSize: '14px',
    lineHeight: '22px',
    overflowWrap: 'break-word',
  },

  privKeyContainer: {
    marginLeft: '30px',
    overflow: 'hidden',
  },

  privKeyColumn: {
    alignItems: 'flex-start !important',
  },
};


const ShowPrivateDialog = (props) => {
  const { onBack, onNext, privateKey, t } = props;

  return (
    <Page title={ t('generate.title') } leftIcon={<Back onClick={onBack} />}>
      <Row>
        <div style={ formStyles.left }/>
        <div style={ formStyles.right }>
          <div>
            <div style={ styles.title }>Print this</div>
            <div style={ styles.subTitle }>
              This is the unencrypted text version of your private key, meaning no password is necessary.
              It helps if you forget your password.
            </div>
          </div>
        </div>
      </Row>

      <Row>
        <div style={ formStyles.left }/>
        <div style={ formStyles.right }>
          <Warning>
            <WarningHeader>Keep it in safety</WarningHeader>
            <WarningText>
              If someone gains access to your unencrypted private key, they will be able to access your account and funds without a password.
            </WarningText>
          </Warning>
        </div>
      </Row>

      <Row>
        <div style={ formStyles.left } />
        <div style={ formStyles.right } style={ styles.privKeyColumn }>
          <div>
            <QRCode
              size={ 100 }
              value={ privateKey }
            />
          </div>
          <div style={ styles.privKeyContainer }>
            <div style={ styles.keyTitle }>Unencrypted Private Key</div>
            <div style={ styles.key }>
              { privateKey }
            </div>
          </div>
        </div>
      </Row>

      <Row>
        <div style={ formStyles.left }/>
        <div style={ formStyles.right }>
          <Button primary onClick={ onNext } label="Next" />
        </div>
      </Row>
    </Page>
  );
};

export default ShowPrivateDialog;

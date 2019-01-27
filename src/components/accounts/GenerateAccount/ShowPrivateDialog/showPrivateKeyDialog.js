import React from 'react';
import withStyles from 'react-jss';
import QRCode from 'qrcode.react';
import { Button, Warning, WarningHeader, WarningText, Page } from 'emerald-js-ui';
import { Row, styles as formStyles } from 'elements/Form';
import { Back } from 'emerald-js-ui/lib/icons3';

const styles2 = {
  title: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  subTitle: {
    fontSize: '14px',
    lineHeight: '22px',
  },
  keyTitle: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: 500,
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
  const { onBack, onNext, privateKey, t, classes } = props;

  return (
    <Page title={ t('generate.title') } leftIcon={<Back onClick={onBack} />}>
      <Row>
        <div style={ formStyles.left }/>
        <div style={ formStyles.right }>
          <div>
            <div className={ classes.title }>Print this</div>
            <div className={ classes.subTitle }>
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
        <div style={ formStyles.right } className={ classes.privKeyColumn }>
          <div>
            <QRCode
              size={ 100 }
              value={ privateKey }
            />
          </div>
          <div className={ classes.privKeyContainer }>
            <div className={ classes.keyTitle }>Unencrypted Private Key</div>
            <div className={ classes.key }>
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

export default withStyles(styles2)(ShowPrivateDialog);

// @flow
import React from 'react';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import withStyles from 'react-jss';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  Page, Warning, WarningHeader, WarningText
} from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button } from '@emeraldwallet/ui';
import { Row, styles as formStyles } from 'elements/Form';
import TextField from 'elements/Form/TextField';
import accounts from 'store/vault/accounts';
import screen from 'store/wallet/screen';
import { required, passwordMatch, minLength } from 'lib/validators';

export const styles2 = {
  passwordLabel: {
    height: '24px',
    width: '190px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  passwordSubLabel: {
    height: '22px',
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px',
  },
};

function getLoadingIcon(submitting) {
  if (submitting) {
    return (
      <CircularProgress size={25}/>
    );
  }
  return null;
}

export class ImportPrivateKey extends React.Component {
  render() {
    const {
      onBack, error, handleSubmit, submitting, classes,
    } = this.props;
    return (
      <Page title="Import Private Key" leftIcon={ <Back onClick={ onBack }/> }>
        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <div style={{width: '100%'}}>
              <div className={classes.passwordLabel}>Enter a strong password</div>
              <div className={classes.passwordSubLabel}>This password will be required to confirm all account
                                    operations.
              </div>
              <div style={{marginTop: '30px'}}>
                <Field
                  name="password"
                  type="password"
                  hintText="At least 8 characters"
                  component={TextField}
                  fullWidth={true}
                  underlineShow={false}
                  validate={ [required, minLength(8)] }
                />
              </div>
            </div>
          </div>
        </Row>
        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <Warning fullWidth={ true }>
              <WarningHeader>Don&#39;t forget it.</WarningHeader>
              <WarningText>If you forget this password, you will lose access to the account and its funds.</WarningText>
            </Warning>
          </div>
        </Row>
        <Row>
          <div style={formStyles.left} />
          <div style={formStyles.right}>
            <Field
              hintText="Confirm Password"
              name="confirmPassword"
              type="password"
              component={TextField}
              fullWidth={true}
              underlineShow={false}
              validate={[required, passwordMatch]}
            />
          </div>
        </Row>

        <Row>
          <div style={formStyles.left}>
          </div>
          <div style={formStyles.right}>
            <div style={{width: '100%'}}>
              <div className={ classes.passwordLabel }>Enter a private key</div>
              <div>
                <Field
                  name="privateKey"
                  component={ TextField }
                  fullWidth={ true }
                  underlineShow={ false }
                />
              </div>
            </div>
          </div>
        </Row>

        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <Button
              primary
              label="Import"
              onClick={ handleSubmit }
              disabled={ submitting }
              icon={getLoadingIcon(submitting) }
            />
          </div>
        </Row>

        {error && (
          <Row>
            <div style={formStyles.left}/>
            <div style={formStyles.right}>
              <Warning>
                <WarningText>{error}</WarningText>
              </Warning>
            </div>
          </Row>
        )}
      </Page>
    );
  }
}

const importForm = reduxForm({
  form: 'importPrivateKey',
  fields: ['password', 'privateKey'],
})(withStyles(styles2)(ImportPrivateKey));

export default connect(
  (state, ownProps) => ({
    importAccounts: state.accounts.get('accounts', Immutable.List()),
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-private-key-to-keyfile', {privateKey: data.privateKey, password: data.password});
        ipcRenderer.once('recieve-private-key-to-keyfile', (event, keyFile) => {
          // import key file
          return dispatch(accounts.actions.importWallet(new Blob([keyFile]), '', ''))
            .then((result) => {
              if (result.error) {
                throw new SubmissionError({ _error: result.error.toString() });
              } else {
                // show page with account details
                resolve(dispatch(screen.actions.gotoScreen('account', Immutable.fromJS({id: result}))));
              }
            });
        });
      });
    },
    onBack: () => {
      if (ownProps.onBackScreen) {
        dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      } else {
        dispatch(screen.actions.gotoScreen('home'));
      }
    },
  })
)(importForm);

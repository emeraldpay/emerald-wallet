// @flow
import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { Form, Row, styles as formStyles } from 'elements/Form';
import TextField from 'elements/Form/TextField';
import DashboardButton from 'components/common/DashboardButton';
import accounts from 'store/vault/accounts';
import screen from 'store/wallet/screen';
import { required } from 'lib/validators';
import { Wallet } from 'emerald-js';
import { Button } from 'emerald-js-ui';
import { Warning, WarningHeader, WarningText } from 'elements/Warning';

import styles from './importPrivateKey.scss';

class ImportPrivateKey extends React.Component {
  render() {
    const { onBack, error, handleSubmit } = this.props;
    return (
      <Form caption="Import Private Key" backButton={ <DashboardButton onClick={ onBack }/> }>
        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <div style={{width: '100%'}}>
              <div className={styles.passwordLabel}>Enter a strong password</div>
              <div className={styles.passwordSubLabel}>This password will be required to confirm all account
                                    operations.
              </div>
              <div style={{marginTop: '30px'}}>
                <Field
                  name="password"
                  type="password"
                  component={TextField}
                  fullWidth={true}
                  underlineShow={false}
                  validate={ [required] }
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
          <div style={formStyles.left}>
          </div>
          <div style={formStyles.right}>
            <div style={{width: '100%'}}>
              <div className={ styles.passwordLabel }>Enter a private key</div>
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
            <Button primary label="Import" onClick={ handleSubmit }/>
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
      </Form>
    );
  }
}

const importForm = reduxForm({
  form: 'importPrivateKey',
  fields: ['password', 'privateKey'],
})(ImportPrivateKey);

/**
 * Build encrypted key file for private key
 */
function privateKeyToV3(privateKey: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // create V3 json key file
    try {
      const keyFile = Wallet.fromPrivateKey(privateKey).toV3String(password);
      resolve(keyFile);
    } catch (error) {
      reject(error);
    }
  });
}

export default connect(
  (state, ownProps) => ({
    importAccounts: state.accounts.get('accounts', Immutable.List()),
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return privateKeyToV3(data.privateKey, data.password)
        .catch((error) => {
          throw new SubmissionError({ _error: error.toString() });
        })
        .then((keyFile) => {
          // import key file
          return dispatch(accounts.actions.importWallet(new Blob([keyFile]), '', ''))
            .then((result) => {
              if (result.error) {
                throw new SubmissionError({ _error: result.error.toString() });
              } else {
                // show page with account details
                dispatch(screen.actions.gotoScreen('account', Immutable.fromJS({id: result})));
              }
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


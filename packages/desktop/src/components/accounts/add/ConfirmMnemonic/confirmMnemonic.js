import React from 'react';
import withStyles from 'react-jss';
import { required } from 'lib/validators';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import {
  Field, reduxForm, SubmissionError
} from 'redux-form';
import { Page, Warning, WarningText } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button } from '@emeraldwallet/ui';
import TextField from 'elements/Form/TextField';
import { Row, styles as formStyles } from 'elements/Form';
import accounts from 'store/vault/accounts';
import screen from 'store/wallet/screen';

export const styles2 = {
  confirmLabel: {
    height: '24px',
    width: '190px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  mnemonicLabel: {
    height: '24px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
};

const validateConfirm = (value, allValues, props, name) => {
  return value === props.formData.mnemonic ? undefined : 'Mnemonic phrase does not match';
};

export class ConfirmMnemonic extends React.Component {
  render() {
    const {
      onBack, invalid, handleSubmit, error, classes,
    } = this.props;
    return (
      <Page title="Confirm Mnemonic" leftIcon={ <Back onClick={ onBack } /> }>
        <Row>
          <div style={formStyles.left}>
          </div>
          <div style={formStyles.right}>
            <div style={{width: '100%'}}>
              <div className={ classes.mnemonicLabel }>Confirm your mnemonic phrase</div>
              <div>
                <Field
                  multiLine={ true }
                  rowsMax={ 4 }
                  rows={ 2 }
                  name="mnemonic"
                  component={ TextField }
                  fullWidth={ true }
                  underlineShow={ false }
                  validate={ [required, validateConfirm] }
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
              disabled={ invalid }
              onClick={ handleSubmit }
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

const confirmForm = reduxForm({
  form: 'confirmMnemonic',
  fields: ['mnemonic'],
})(withStyles(styles2)(ConfirmMnemonic));


export default connect(
  (state, ownProps) => ({
    mnemonic: ownProps.mnemonic,
    accounts: state.accounts.get('accounts', Immutable.List()),
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return dispatch(accounts.actions.importMnemonic(ownProps.formData.password, ownProps.formData.mnemonic, ownProps.formData.hdpath, '', ''))
        .then((result) => {
          if (result.error) {
            throw new SubmissionError({ _error: result.error.toString() });
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen('account', Immutable.fromJS({id: result})));
          }
        }).catch((error) => {
          console.error(error);
          throw new SubmissionError({ _error: error.toString() });
        });
    },

    onBack: () => {
      if (ownProps.onBack) {
        ownProps.onBack();
      } else {
        dispatch(screen.actions.gotoScreen('home'));
      }
    },
  })
)(confirmForm);

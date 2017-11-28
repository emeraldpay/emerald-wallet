import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { MenuItem } from 'material-ui';
import { Form, Row, styles as formStyles } from 'elements/Form';
import TextField from 'elements/Form/TextField';
import SelectField from 'elements/Form/SelectField';
import DashboardButton from 'components/common/DashboardButton';
import accounts from 'store/vault/accounts';
import screen from 'store/wallet/screen';
import Button from 'elements/Button';
import { Warning, WarningHeader, WarningText } from 'elements/Warning';

import styles from './importMnemonic.scss';

class ImportMnemonic extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = {
      error: null,
      accountId: null,
    };
  }

  submit() {
    const { handleSubmit, dispatch } = this.props;
    const accs = this.props.accounts;

    handleSubmit().then((result) => {
      if (result.error) {
        this.setState({error: result.error.toString()});
      } else {
        this.setState({accountId: result});
        const p = accs.findKey((acc) => acc.get('id') === this.state.accountId);
        const account = p && (p >= 0) && accs.get(p);
        dispatch(screen.actions.gotoScreen('account', account));
      }
    }).catch((error) => {
      console.error(error);
      this.setState({ error: error.toString() });
    });
  }

  render() {
    const { onBack } = this.props;
    return (
      <Form caption="Import Mnemonic" backButton={ <DashboardButton onClick={ onBack }/> }>
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
              <div className={ styles.mnemonicLabel }>Enter a mnemonic phrase</div>
              <div>
                <Field
                  multiLine={ true }
                  rowsMax={ 4 }
                  rows={ 2 }
                  name="mnemonic"
                  component={ TextField }
                  fullWidth={ true }
                  underlineShow={ false }
                />
              </div>
            </div>
          </div>
        </Row>

        <Row>
          <div style={formStyles.left}>
          </div>
          <div style={formStyles.right}>
            <div style={{width: '100%'}}>
              <div className={ styles.mnemonicLabel }>HD derivation path</div>
              <div>
                <Field
                  name="hdpath"
                  component={ SelectField }
                  fullWidth={ true }
                  underlineShow={ false }
                >
                  <MenuItem value="m/44'/60'/160720'/0'" primaryText="m/44'/60'/160720'/0'" />
                  <MenuItem value="m/44'/61'/1'/0" primaryText="m/44'/61'/1'/0" />
                  <MenuItem value="m/44'/61'/0'/0" primaryText="m/44'/61'/0'/0" />
                  <MenuItem value="m/44'/60'/0'" primaryText="m/44'/60'/0'" />
                </Field>
              </div>
            </div>
          </div>
        </Row>

        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <Button primary label="Import" onClick={ this.submit }/>
          </div>
        </Row>
        { this.state.error }
      </Form>
    );
  }
}

const importForm = reduxForm({
  form: 'importMnemonic',
  fields: ['password', 'mnemonic', 'hdpath'],
})(ImportMnemonic);

export default connect(
  (state, ownProps) => ({
    initialValues: {
      mnemonic: ownProps.mnemonic,
    },
    accounts: state.accounts.get('accounts', Immutable.List()),
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return dispatch(accounts.actions.importMnemonic(data.password, data.mnemonic, data.hdpath, '', ''));
    },
    onBack: () => {
      if (ownProps.onBack) {
        ownProps.onBack();
      } else {
        dispatch(screen.actions.gotoScreen('home'));
      }
    },
  })
)(importForm);


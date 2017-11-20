import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Form, Row, styles as formStyles } from 'elements/Form';
import TextField from 'elements/Form/TextField';
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
    const { handleSubmit, accounts, dispatch } = this.props;

    handleSubmit().then((result) => {
      if (result.error) {
        this.setState({error: result.error.toString()});
      } else {
        this.setState({accountId: result});
        const p = accounts.findKey((acc) => acc.get('id') === this.state.accountId);
        const account = p && (p >= 0) && accounts.get(p);
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
                <form>
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
                        <div style={formStyles.left}/>
                        <div style={formStyles.right}>
                            <Button primary label="Import" onClick={ this.submit }/>
                        </div>
                    </Row>
                    { this.state.error }
                </form>
            </Form>
    );
  }
}

const importForm = reduxForm({
  form: 'importMnemonic',
  fields: ['password', 'mnemonic'],
})(ImportMnemonic);

export default connect(
    (state, ownProps) => ({
      accounts: state.accounts.get('accounts', Immutable.List()),
    }),
    (dispatch, ownProps) => ({
      onSubmit: (data) => {
        return dispatch(accounts.actions.importMnemonic(data.password, data.mnemonic, '', ''));
      },
      onBack: () => {
        dispatch(screen.actions.gotoScreen('home'));
      },
    })
)(importForm);


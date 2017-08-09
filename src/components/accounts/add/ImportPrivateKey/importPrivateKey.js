import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { TextField } from 'redux-form-material-ui';

import { Form, Row, styles as formStyles } from '../../../../elements/Form';
import { importWallet } from 'store/accountActions';
import { gotoScreen } from 'store/screenActions';
import Wallet from 'lib/wallet';

import styles from './importPrivateKey.scss';
import {formStyle as globalStyles } from 'lib/styles';
import SubmitButton from '../../../../elements/SubmitButton';


class ImportPrivateKey extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.state = {
            error: null,
            accountId: null,
        };
    }

    submit() {
        this.props.handleSubmit().then((result) => {
            if (result.error) {
                this.setState({ error: result.error.toString() });
            } else {
                this.setState({ accountId: result });
                const p = this.props.accounts.findKey((acc) => acc.get('id') === this.state.accountId);
                const account = p && (p >= 0) && this.props.accounts.get(p);
                this.props.dispatch(gotoScreen('account', account));
            }
        });
    }

    render() {
        const { onBack } = this.props;

        return (
            <Form caption="Import Private Key" onCancel={ onBack }>
                <form>
                <Row>
                    <div style={formStyles.left}>
                    </div>
                    <div style={formStyles.right}>
                        <div style={{width: '100%'}}>
                            <div className={styles.passwordLabel}>Enter a strong password</div>
                            <div className={styles.passwordSubLabel}>Password needs for confirm all wallet operations.</div>
                            <div style={{marginTop: '30px'}}>
                                <Field name="password"
                                       style={ globalStyles.input }
                                       component={ TextField }
                                       fullWidth={ true }
                                       underlineShow={false}
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
                                <div className={styles.passwordLabel}>Enter a private key</div>
                                <div>
                                    <Field name="privateKey"
                                           style={ globalStyles.input }
                                           component={ TextField }
                                           fullWidth={ true }
                                           underlineShow={false}
                                    />
                                </div>
                            </div>

                        </div>
                    </Row>

                <Row>
                    <div style={formStyles.left}></div>
                    <div style={formStyles.right}>
                        <SubmitButton label="IMPORT" onClick={ this.submit } />
                    </div>
                </Row>
                    {this.state.error}
                </form>
            </Form>
        );
    }
}

const createForm = reduxForm({
    form: 'importPrivateKey',
    fields: ['password', 'privateKey'],
})(ImportPrivateKey);

export default connect(
    (state, ownProps) => ({
        accounts: state.accounts.get('accounts', Immutable.List()),
    }),
    (dispatch, ownProps) => ({
        onSubmit: (data) => {
            return new Promise((resolve, reject) => {
                // create V3 json key file
                try {
                    const keyFile = Wallet.toV3(data.privateKey, data.password);

                    // import key file
                    dispatch(importWallet(new Blob([keyFile]), '', ''))
                        .then((response) => resolve(response))
                        .catch((error) => resolve({error}));
                } catch (error) {
                    resolve({error});
                }
            });
        },
        onBack: () => {
            dispatch(gotoScreen('home'));
        },
    })
)(createForm);


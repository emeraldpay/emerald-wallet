import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { Form, Row, styles as formStyles } from '../../../elements/Form';
import Button from '../../../elements/Button/index';
import TextField from '../../../elements/Form/TextField';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';
import { exportPaperWallet } from '../../../store/vault/accounts/accountActions';

import styles from './exportPaperWallet.scss';

class ExportPaperWallet extends React.Component {

    static propTypes = {
        accountId: PropTypes.string,
        onBack: PropTypes.func,
        handleSubmit: PropTypes.func,
    };

    render() {
        const { accountId, onBack, handleSubmit } = this.props;

        return (
            <Form caption="Print Paper Wallet" onCancel={ onBack }>
                <Row>
                    <div style={formStyles.left}/>
                    <div style={formStyles.right}>
                        { accountId }
                    </div>
                </Row>
                <Row>
                    <div style={formStyles.left}>
                    </div>
                    <div style={formStyles.right}>
                        <div style={{ width: '100%' }}>
                            <div className={styles.passwordLabel}>Enter a password</div>
                            <div className={styles.passwordSubLabel}>
                                Password needs for confirm all wallet operations.</div>
                            <div style={{ marginTop: '30px' }}>
                                <Field name="password"
                                       type="password"
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
                        <Button primary label="EXPORT" onClick={ handleSubmit } />
                    </div>
                </Row>

            </Form>);
    }
}


const createForm = reduxForm({
    form: 'exportPaperWallet',
    fields: ['password'],
})(ExportPaperWallet);

export default connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
        onSubmit: (data) => {
            dispatch(exportPaperWallet(data.password, ownProps.accountId));
        },
        onBack: () => {
            dispatch(gotoScreen('home'));
        },

    }))(createForm);

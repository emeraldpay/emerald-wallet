import React from 'react';
import Button from 'elements/Button';
import { Form, Row, styles as formStyles } from 'elements/Form';
import { Warning, WarningHeader, WarningText } from 'elements/Warning/warning';
import PasswordInput from 'elements/PasswordInput';
import DashboardButton from 'components/common/DashboardButton';
import Advice from './advice';
import styles from './passwordDialog.scss';

const MIN_PASSWORD_LENGTH = 8;

class PasswordDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            passphrase: '',
            invalidPassphrase: false,
        };
    }

    handleGenerate = () => {
        const { onGenerate } = this.props;
        const passphrase = this.state.passphrase;

        // validate passphrase
        if (passphrase.length < MIN_PASSWORD_LENGTH) {
            this.setState({
                invalidPassphrase: true,
            });
        } else {
            onGenerate(passphrase);
        }
    }

    onPassphraseChange = (newValue) => {
        const invalidPassphrase = (newValue.length === 0 || newValue.length >= MIN_PASSWORD_LENGTH) ?
            false :
            this.state.invalidPassphrase;

        this.setState({
            passphrase: newValue,
            invalidPassphrase,
        });
    }


    render() {
        const { onDashboard, t } = this.props;
        const { invalidPassphrase } = this.state;

        return (
            <Form caption={ t('generate.title') } backButton={ <DashboardButton onClick={ onDashboard }/> }>

                <Row>
                    <div style={ formStyles.left }/>
                    <div style={ formStyles.right }>
                        <div style={{ width: '100%' }}>
                            <div className={ styles.passwordLabel }>Enter a strong password</div>
                            <div className={ styles.passwordSubLabel }>
                                Password needs for confirm all wallet operations.
                            </div>
                            <div style={{ marginTop: '30px' }}>
                                <PasswordInput
                                    onChange={ this.onPassphraseChange }
                                    invalid={ invalidPassphrase }
                                />
                            </div>
                        </div>
                    </div>
                </Row>

                <Row>
                    <div style={ formStyles.left }/>
                    <div style={ formStyles.right }>
                            <Warning fullWidth={ true }>
                                <WarningHeader>Don&#39;t forget it.</WarningHeader>
                                <WarningText>If you forget password, you will loose your wallet with all
                                    funds.</WarningText>
                            </Warning>
                    </div>
                </Row>

                <Row>
                    <div style={formStyles.left}/>
                    <div style={formStyles.right}>
                        <Advice
                            title="Advice"
                            text={ <div>
                                You can use a word or phrase as password. Write it in short text.<br/>
                                Only you know where password is. It is safer than write a password only.
                            </div>}
                        />
                    </div>
                </Row>

                <Row>
                    <div style={formStyles.left}/>
                    <div style={formStyles.right}>
                        <Button primary onClick={ this.handleGenerate } label="Generate Account" />
                    </div>
                </Row>
            </Form>
        );
    }
}


export default PasswordDialog;


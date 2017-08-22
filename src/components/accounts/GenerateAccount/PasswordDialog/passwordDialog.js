import React from 'react';
import Button from 'elements/Button';
import { Form, Row, styles as formStyles } from 'elements/Form';
import TextField from 'elements/Form/TextField';
import { Warning, WarningHeader, WarningText } from 'elements/Warning/warning';

import Advice from './advice';
import styles from './passwordDialog.scss';

class PasswordDialog extends React.Component {

    onInputChange = (event, newValue) => {
        this.setState({
            passphrase: newValue,
        });
    };

    handleGenerate = () => {
        const { onGenerate } = this.props;

        const passphrase = this.state.passphrase;
        onGenerate(passphrase);
    }

    render() {
        const { onBack } = this.props;

        return (
            <Form caption="Generate New Account" onCancel={ onBack }>

                <Row>
                    <div style={ formStyles.left }/>
                    <div style={ formStyles.right }>
                        <div style={{ width: '100%' }}>
                            <div className={ styles.passwordLabel }>Enter a strong password</div>
                            <div className={ styles.passwordSubLabel }>
                                Password needs for confirm all wallet operations.
                            </div>
                            <div style={{ marginTop: '30px' }}>
                                <TextField
                                    onChange={ this.onInputChange }
                                    hintText="At least 8 characters"
                                    type="password"
                                    name="password"
                                    fullWidth={ true }
                                    underlineShow={ false }
                                />
                                {/* <Field name="password"*/}
                                {/* type="password"*/}
                                {/* component={ TextField }*/}
                                {/* fullWidth={ true }*/}
                                {/* underlineShow={ false }*/}
                                {/* />*/}
                            </div>
                        </div>
                    </div>
                </Row>

                <Row>
                    <div style={ formStyles.left }/>
                    <div style={ formStyles.right }>
                        <Warning>
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


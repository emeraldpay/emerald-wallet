import React from 'react';
import Button from 'elements/Button';
import { Form, Row, styles as formStyles } from 'elements/Form';
import TextField from 'elements/Form/TextField';
import { Warning, WarningHeader, WarningText } from 'elements/Warning/warning';

import Advice from './advice';
import styles from './passwordDialog.scss';

const PasswordDialog = (props) => {

    const { onGenerate, onBack } = props;

    return (
        <Form caption="Generate New Wallet" onCancel={ onBack }>

            <Row>
                <div style={formStyles.left}/>
                <div style={formStyles.right}>
                    <div style={{ width: '100%' }}>
                        <div className={styles.passwordLabel}>Enter a strong password</div>
                        <div className={styles.passwordSubLabel}>Password needs for confirm all wallet operations.</div>
                        <div style={{ marginTop: '30px' }}>
                            <TextField
                                hintText="At least 8 characters"
                                name="password"
                                fullWidth={ true }
                                underlineShow={ false }
                            />
                            {/*<Field name="password"*/}
                                   {/*type="password"*/}
                                   {/*component={ TextField }*/}
                                   {/*fullWidth={ true }*/}
                                   {/*underlineShow={ false }*/}
                            {/*/>*/}
                        </div>
                    </div>

                </div>
            </Row>

            <Row>
                <div style={formStyles.left}/>
                <div style={formStyles.right}>
                    <Warning>
                        <WarningHeader>Don't forget it.</WarningHeader>
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
                    <Button primary onClick={ onGenerate } label="Generate Wallet" />
                </div>
            </Row>
        </Form>
    );
};

export default PasswordDialog;


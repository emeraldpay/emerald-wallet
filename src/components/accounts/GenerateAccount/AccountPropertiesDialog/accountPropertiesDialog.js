import React from 'react';

import TextField from 'elements/Form/TextField';
import Button from 'elements/Button';
import LinkButton from 'elements/LinkButton';
import { Form, Row, styles as formStyles } from 'elements/Form';

const AccountPropertiesDialog = (props) => {

    const { onSkip, onBack } = props;
    return (
        <Form caption="Set account properties" onCancel={ onBack }>
            <Row>
                <div style={formStyles.left}>
                    <div style={formStyles.fieldName}>Account name</div>
                </div>
                <div style={formStyles.right}>
                    <div style={{ width: '100%' }}>
                        <TextField
                            hintText="if needed"
                            name="name"
                            fullWidth={ true }
                            underlineShow={ false }
                        />
                    </div>
                </div>
            </Row>

            <Row>
                <div style={formStyles.left}/>
                <div style={formStyles.right}>
                    <div>
                        <Button
                            primary
                            onClick={ onSkip }
                            label="Save"
                        />
                        <LinkButton
                            onClick={ onSkip }
                            label="Skip"
                        />
                    </div>
                </div>
            </Row>
        </Form>

    );
};

export default AccountPropertiesDialog;
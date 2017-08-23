import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { MenuItem } from 'material-ui';
import { translate } from 'react-i18next';
import { gotoScreen } from '../store/screenActions';
import i18n from '../i18n/i18n';
import { Form, styles, Row } from '../elements/Form';
import Button from 'elements/Button';
import SelectField from '../elements/Form/SelectField';

class SettingsRender extends React.Component {

    render() {
        const { goDashboard, handleSubmit, t } = this.props;
        console.log(`i18n.language=${i18n.language}`);
        return (
            <Form caption="Settings" onCancel={ goDashboard }>
                <div id="body">
                    <Row>
                        <div style={styles.left}>
                            <div style={styles.fieldName}>
                                Network
                            </div>
                        </div>
                        <div style={styles.right}>
                            <Field name="network"
                                   component={SelectField}
                                   underlineShow={false}
                                   fullWidth={true}>
                                <MenuItem key="mainnet"
                                          value="mainnet"
                                          label="Mainnet"
                                          primaryText="Mainnet" />
                            </Field>
                        </div>
                    </Row>
                    <Row>
                        <div style={styles.left}>
                            <div style={styles.fieldName}>
                                Equivalent currency
                            </div>
                        </div>
                        <div style={styles.right}>
                            <Field name="currency"
                                   component={SelectField}
                                   underlineShow={false}
                                   fullWidth={true}>
                                <MenuItem key="eur"
                                          value="eur"
                                          label="EUR"
                                          primaryText="EUR" />
                                <MenuItem key="usd"
                                          value="usd"
                                          label="USD"
                                          primaryText="USD" />
                            </Field>
                        </div>
                    </Row>
                    <Row>
                        <div style={styles.left}>
                            <div style={styles.fieldName}>
                                { t('lang') }
                            </div>
                        </div>
                        <div style={styles.right}>
                            <Field name="language"
                                   component={ SelectField }
                                   underlineShow={false}
                                   fullWidth={true}>
                                <MenuItem
                                    key="en-US"
                                    value="en-US"
                                    label="English (US)"
                                    primaryText="English (US)"
                                />
                                <MenuItem
                                    key="zh-CN"
                                    value="zh-CN"
                                    label="中文"
                                    primaryText="中文"
                                />
                                <MenuItem
                                    key="pt-BR"
                                    value="pt-BR"
                                    label="Portugese"
                                    primaryText="Portugese"
                                />
                                <MenuItem
                                    key="ko-KR"
                                    value="ko-KR"
                                    label="Korean"
                                    primaryText="Korean"
                                />
                            </Field>
                        </div>
                    </Row>
                    <Row>
                        <div style={ styles.left }>
                        </div>
                        <div style={styles.right}>
                                <Button primary label="SAVE" onClick={ handleSubmit } />
                        </div>
                    </Row>
                </div>
            </Form>
        );
    }
}


const SettingsForm = translate('settings')(reduxForm({
    form: 'settings',
    fields: ['language'],
})(SettingsRender));

const Settings = connect(
    (state, ownProps) => {
        return {
            initialValues: {
                language: i18n.language,
            },
        };
    },
    (dispatch, ownProps) => ({
        goDashboard: () => {
            dispatch(gotoScreen('home'));
        },

        onSubmit: (data) => {
            i18n.changeLanguage(data.language);
        },
    })
)(SettingsForm);

export default Settings;

import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { MenuItem } from 'material-ui';
import { translate } from 'react-i18next';
import { gotoScreen } from '../store/screenActions';
import i18n from '../i18n/i18n';
import { Form, styles, Row } from '../elements/Form';
import Button from '../elements/Form/Button';
import SelectField from '../elements/Form/SelectField';

class SettingsRender extends React.Component {

    render() {
        const { goDashboard, changeLanguage, t } = this.props;

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
                                   // style={formStyle.input}
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
                                   // style={formStyle.input}
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
                                {t('lang')}
                            </div>
                        </div>
                        <div style={styles.right}>
                            <Field name="language"
                                   component={ SelectField }
                                   onChange={(event, val) => changeLanguage(val)}
                                   underlineShow={false}
                                   fullWidth={true}>
                                <MenuItem key="en"
                                          value="en"
                                          label="English"
                                          primaryText="English" />

                                <MenuItem key="zh_cn"
                                          value="zh_cn"
                                          label="中文"
                                          primaryText="中文" />
                            </Field>
                        </div>
                    </Row>
                    <Row>
                        <div style={ styles.left }>
                        </div>
                        <div style={styles.right}>
                                <Button primary label="SAVE" />
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

        changeLanguage: (lng) => {
            i18n.changeLanguage(lng);
        },
    })
)(SettingsForm);

export default Settings;

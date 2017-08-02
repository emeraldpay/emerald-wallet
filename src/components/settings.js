import React from 'react';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { SelectField } from 'redux-form-material-ui';
import { FlatButton, MenuItem } from 'material-ui';
import { translate } from 'react-i18next';
import { gotoScreen } from '../store/screenActions';
import { formStyle } from '../lib/styles';
import i18n from '../i18n';
import {InnerDialog, styles} from '../elements/innerDialog';

class SettingsRender extends React.Component {

    render() {
        const {goDashboard, changeLanguage, t} = this.props;

        return (
            <InnerDialog caption="Settings" onCancel={goDashboard}>
                <div id="body">
                    <div id="row" style={styles.formRow}>
                        <div style={styles.left}>
                            <div style={styles.fieldName}>
                                Network
                            </div>
                        </div>
                        <div style={styles.right}>
                            <Field name="network"
                                   component={SelectField}
                                   underlineShow={false}
                                   style={formStyle.input}
                                   fullWidth={true}>
                                <MenuItem key="mainnet"
                                          value="mainnet"
                                          label="Mainnet"
                                          primaryText="Mainnet" />
                            </Field>
                        </div>
                    </div>
                    <div id="row" style={styles.formRow}>
                        <div style={styles.left}>
                            <div style={styles.fieldName}>
                                Equivalent currency
                            </div>
                        </div>
                        <div style={styles.right}>
                            <Field name="currency"
                                   component={SelectField}
                                   underlineShow={false}
                                   style={formStyle.input}
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
                    </div>
                    <div id="row" style={styles.formRow}>
                        <div style={styles.left}>
                            <div style={styles.fieldName}>
                                {t('lang')}
                            </div>
                        </div>
                        <div style={styles.right}>
                            <Field name="language"
                                   component={SelectField}
                                   onChange={(event, val) => changeLanguage(val)}
                                   underlineShow={false}
                                   style={formStyle.input}
                                   fullWidth={true}>
                                <MenuItem key="en"
                                          value="en"
                                          label="English"
                                          primaryText="English" />

                                <MenuItem key="cn"
                                          value="cn"
                                          label="cn"
                                          primaryText="cn" />
                            </Field>
                        </div>
                    </div>
                    <div id="row" style={styles.formRow}>
                        <div style={styles.left}>
                        </div>
                        <div style={styles.right}>
                            <div>
                                <FlatButton
                                    label="SAVE"
                                    backgroundColor="#47B04B"
                                    style={formStyle.submitButton} />
                            </div>
                        </div>
                    </div>
                </div>
            </InnerDialog>
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

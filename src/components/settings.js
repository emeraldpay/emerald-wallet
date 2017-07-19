import React from 'react';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { SelectField } from 'redux-form-material-ui';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import { FlatButton, MenuItem } from 'material-ui';
import { gotoScreen } from '../store/screenActions';
import { formStyle } from '../lib/styles';

class SettingsRender extends React.Component {

    render() {
        const {goDashboard} = this.props;

        const styles = {
            fieldName: {
                color: '#747474',
                fontSize: '18px',
                textAlign: 'right',
            },
            left: {
                flexBasis: '20%',
                marginLeft: '14.75px',
                marginRight: '14.75px',
            },
            right: {
                flexGrow: 2,
                display: 'flex',
                marginLeft: '14.75px',
                marginRight: '14.75px',
                maxWidth: '581px',
            },
            formRow: {
                display: 'flex',
                marginTop: '19px',
                alignItems: 'center',
            },
        };

        const backLabel = 'DASHBOARD';
        const cancel = goDashboard;
        const flatButtonNav = {
            color: '#747474',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '24px',
        };

        return (
            <div style={{marginTop: '20px', backgroundColor: 'white', paddingTop: '41px'}}>
                <div id="header" style={{display: 'flex', alignItems: 'center'}}>
                    <div style={styles.left}>

                        <FlatButton label={backLabel}
                                    primary={true}
                                    onClick={cancel}
                                    style={flatButtonNav}
                                    icon={<KeyboardArrowLeft/>}
                        />

                    </div>
                    <div style={styles.right}>
                        <div id="caption" style={{fontSize: '22px'}}>
                            Settings
                        </div>
                    </div>
                </div>
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
                                          style={formStyle.input}
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
                                Language
                            </div>
                        </div>
                        <div style={styles.right}>
                            <Field name="language"
                                   component={SelectField}
                                   underlineShow={false}
                                   style={formStyle.input}
                                   fullWidth={true}>
                                <MenuItem key="en"
                                          value="en"
                                          label="English"
                                          primaryText="English" />
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
            </div>
        );
    }
}


const SettingsForm = reduxForm({
    form: 'settings',
    fields: ['language'],
})(SettingsRender);

const Settings = connect(
    (state, ownProps) => {

    },
    (dispatch, ownProps) => ({
        goDashboard: () => {
            dispatch(gotoScreen('home'));
        },

    })
)(SettingsForm);

export default Settings;
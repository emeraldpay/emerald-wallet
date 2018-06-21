import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { MenuItem } from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { translate } from 'react-i18next';

import { TextField } from 'redux-form-material-ui';
import { Button, Page } from 'emerald-js-ui';
// todo: make this 1 import
import { styles, Row } from 'elements/Form';
import SelectField from 'elements/Form/SelectField';
import Checkbox from 'elements/Form/Checkbox';

import { Back } from 'emerald-js-ui/lib/icons3';

import screen from '../../store/wallet/screen';
import settings from '../../store/wallet/settings';
import accounts from '../../store/vault/accounts';

import i18n from '../../i18n/i18n';

export class Settings extends React.Component {
  render() {
    const { goDashboard, handleSubmit, t } = this.props;
    return (
      <Page title="Settings" leftIcon={<Back onClick={goDashboard} />}>
        <div>
          <Row>
            <div style={styles.left}>
              <div style={ styles.fieldName }>{ t('currency') }</div>
            </div>
            <div style={ styles.right }>
              <Field
                name="currency"
                component={ SelectField }
                underlineShow={ false }
                fullWidth={ true } >
                <MenuItem key="eur" value="eur" label="EUR" primaryText="EUR" />
                <MenuItem key="usd" value="usd" label="USD" primaryText="USD" />
                <MenuItem key="cny" value="cny" label="CNY" primaryText="CNY" />
                <MenuItem key="rub" value="rub" label="RUB" primaryText="RUB" />
                <MenuItem key="krw" value="krw" label="KRW" primaryText="KRW" />
                <MenuItem key="aud" value="aud" label="AUD" primaryText="AUD" />
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
              <Field
                name="language"
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
            <div style={styles.left}>
              <div style={styles.fieldName}>
                { t('showHiddenAccounts') }
              </div>
            </div>
            <div style={styles.right}>
              <Field
                name="showHiddenAccounts"
                component={ Checkbox }
                label="Show accounts you have hidden"
              />
            </div>
          </Row>
          <Row>
            <div style={styles.left}>
              <div style={styles.fieldName}>
                { t('confirmations') }
              </div>
            </div>
            <div style={styles.right}>
              <Field
                name="numConfirmations"
                type="number"
                component={ TextField }
                label="Number of confirmations for a transaction to be considered successful"
              />

            </div>
          </Row>
          <Row>
            <div style={ styles.left } />
            <div style={ styles.right }>
              <Button primary label="SAVE" onClick={ handleSubmit } />
            </div>
          </Row>
        </div>
      </Page>
    );
  }
}

const SettingsForm = translate('settings')(reduxForm({
  form: 'settings',
  fields: ['language', 'currency', 'showHiddenAccounts'],
})(muiThemeable()(Settings)));

export default connect(
  (state, ownProps) => {
    return {
      initialValues: {
        language: i18n.language,
        currency: state.wallet.settings.get('localeCurrency', '').toLowerCase(),
        showHiddenAccounts: state.wallet.settings.get('showHiddenAccounts', false),
        numConfirmations: state.wallet.settings.get('numConfirmations'),
      },
    };
  },
  (dispatch, ownProps) => ({
    goDashboard: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },

    onSubmit: (data) => {
      const newSettings = {
        language: data.language,
        localeCurrency: data.currency,
        showHiddenAccounts: data.showHiddenAccounts,
        numConfirmations: data.numConfirmations,
      };
      i18n.changeLanguage(data.language);
      dispatch(settings.actions.update(newSettings));
      dispatch(accounts.actions.loadAccountsList());
    },
  })
)(SettingsForm);

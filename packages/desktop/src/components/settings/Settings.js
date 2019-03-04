import React from 'react';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import { Checkbox, Page } from '@emeraldplatform/ui';
import MenuItem from '@material-ui/core/MenuItem';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { translate } from 'react-i18next';
import theme from '@emeraldplatform/ui/lib/theme';
import { Back } from '@emeraldplatform/ui-icons';

import Button from 'components/common/Button';
import { styles, Row } from 'elements/Form';
import screen from '../../store/wallet/screen';
import settings from '../../store/wallet/settings';
import accounts from '../../store/vault/accounts';
import i18n from '../../i18n/i18n';

export class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showHiddenAccounts: this.props.showHiddenAccounts,
      currency: this.props.currency,
      language: this.props.language,
      numConfirmations: this.props.numConfirmations,
    };
  }

  handleShowHiddenChange = (event, isChecked) => {
    this.setState({
      showHiddenAccounts: isChecked,
    });
  }

  handleCurrencyChange = (event) => {
    this.setState({
      currency: event.target.value,
    });
  };

  handleLangChange = (event) => {
    this.setState({
      language: event.target.value,
    });
  };

  handleConfirmsChange = (event) => {
    this.setState({
      numConfirmations: event.target.value,
    });
  };

  handleSave = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state);
    }
  };

  render() {
    const { goBack, t } = this.props;
    const {
      showHiddenAccounts, currency, language, numConfirmations,
    } = this.state;
    return (
      <MuiThemeProvider theme={theme}>
        <Page title="Settings" leftIcon={<Back onClick={goBack} />}>
          <div>
            <Row>
              <div style={styles.left}>
                <div style={styles.fieldName}>{t('currency')}</div>
              </div>
              <div style={styles.right}>
                <TextField
                  select
                  fullWidth
                  value={currency}
                  onChange={this.handleCurrencyChange}
                >
                  <MenuItem key="eur" value="eur">EUR</MenuItem>
                  <MenuItem key="usd" value="usd">USD</MenuItem>
                  <MenuItem key="cny" value="cny">CNY</MenuItem>
                  <MenuItem key="rub" value="rub">RUB</MenuItem>
                  <MenuItem key="krw" value="krw">KRW</MenuItem>
                  <MenuItem key="aud" value="aud">AUD</MenuItem>
                </TextField>
              </div>
            </Row>
            <Row>
              <div style={styles.left}>
                <div style={styles.fieldName}>
                  {t('lang')}
                </div>
              </div>
              <div style={styles.right}>
                <TextField
                  select
                  value={language}
                  fullWidth
                  onChange={this.handleLangChange}
                >
                  <MenuItem key="en-US" value="en-US" label="English (US)">English (US)</MenuItem>
                  <MenuItem key="zh-CN" value="zh-CN" label="中文">中文</MenuItem>
                  <MenuItem key="pt-BR" value="pt-BR" label="Portugese">Portugese</MenuItem>
                  <MenuItem key="ko-KR" value="ko-KR" label="Korean">Korean</MenuItem>
                </TextField>
              </div>
            </Row>
            <Row>
              <div style={styles.left}>
                <div style={styles.fieldName}>
                  {t('showHiddenAccounts')}
                </div>
              </div>
              <div style={styles.right}>
                <Checkbox
                  checked={showHiddenAccounts}
                  label="Show accounts you have hidden"
                  onCheck={this.handleShowHiddenChange}
                />
              </div>
            </Row>
            <Row>
              <div style={styles.left}>
                <div style={styles.fieldName}>
                  {t('confirmations')}
                </div>
              </div>
              <div style={styles.right}>
                <TextField
                  fullWidth
                  value={numConfirmations}
                  margin="normal"
                  type="number"
                  required
                  onChange={this.handleConfirmsChange}
                  // helperText="Number of confirmations for a transaction to be considered successful"
                />
              </div>
            </Row>
            <Row>
              <div style={styles.left} />
              <div style={styles.right}>
                <Button
                  primary={true}
                  label="SAVE"
                  onClick={this.handleSave}
                />
              </div>
            </Row>
          </div>
        </Page>
      </MuiThemeProvider>
    );
  }
}

const TranslatedSettings = translate('settings')(Settings);

export default connect(
  (state, ownProps) => {
    return {
      showHiddenAccounts: state.wallet.settings.get('showHiddenAccounts', false),
      currency: state.wallet.settings.get('localeCurrency', '').toLowerCase(),
      language: i18n.language,
      numConfirmations: state.wallet.settings.get('numConfirmations'),
    };
  },
  (dispatch, ownProps) => ({
    goBack: () => {
      dispatch(screen.actions.goBack());
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
)(TranslatedSettings);

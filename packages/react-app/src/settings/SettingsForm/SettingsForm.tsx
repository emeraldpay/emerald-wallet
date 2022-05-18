import { Back, Button, Page, PasswordInput, Theme } from '@emeraldwallet/ui';
import { createStyles, MenuItem, Tab, Tabs, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { WithTranslation } from 'react-i18next';
import { DispatchProps, ExportResult, MutableState, StateProps } from '../Settings/Settings';

const styles = createStyles({
  tabsContainer: {
    display: 'flex',
  },
  tabsSwitcher: {
    borderRight: `1px solid ${Theme.palette.secondary.main}`,
    marginRight: 20,
  },
  formBody: {
    flex: 1,
    marginBottom: -20,
    marginTop: -20,
  },
  formRow: {
    alignItems: 'center',
    display: 'flex',
    paddingBottom: 20,
    paddingTop: 20,
  },
  fieldName: {
    fontSize: 16,
    textAlign: 'right',
  },
  fieldInput: {
    marginBottom: -8,
    marginTop: -16,
    width: '100%',
  },
  left: {
    flexBasis: '20%',
    flexShrink: 0,
    marginLeft: 14.75,
    marginRight: 14.75,
  },
  right: {
    alignItems: 'center',
    display: 'flex',
    flexGrow: 2,
    marginLeft: 14.75,
    marginRight: 14.75,
  },
});

enum SettingsTabs {
  COMMON = 0,
  GLOBAL_KEY = 1,
  EXPORT_VAULT = 2,
}

interface State extends MutableState {
  changePasswordError?: string;
  confirmPassword: string;
  globalKeySet: boolean;
  newPassword: string;
  oldPassword: string;
  tab: SettingsTabs;
}

export interface Props extends DispatchProps, MutableState, StateProps, WithTranslation {
  classes: Record<keyof typeof styles, string>;
}

export class SettingsForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      confirmPassword: '',
      currency: this.props.currency.toLowerCase(),
      globalKeySet: false,
      language: this.props.language,
      newPassword: '',
      oldPassword: '',
      tab: SettingsTabs.COMMON,
    };
  }

  async componentDidMount(): Promise<void> {
    const hasGlobalKey = await this.props.isGlobalKeySet();

    this.setState({ globalKeySet: hasGlobalKey });
  }

  public checkPasswords = (): boolean => {
    const { confirmPassword, newPassword, oldPassword } = this.state;

    return confirmPassword.length > 0 && newPassword.length > 0 && oldPassword.length > 0;
  };

  public handleCurrencyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ currency: event.target.value });
  };

  public handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ language: event.target.value });
  };

  public handleSave = async (): Promise<void> => {
    await this.props.onSubmit(this.state);
  };

  public handleChange = async (): Promise<void> => {
    const { t } = this.props;
    const { confirmPassword, newPassword, oldPassword } = this.state;

    this.setState({ changePasswordError: undefined });

    if (newPassword !== oldPassword && newPassword === confirmPassword) {
      const passwordChanged = await this.props.onChangeGlobalKey(oldPassword, newPassword);

      if (passwordChanged) {
        this.props.showNotification(t('settings.globalKeyChanged'));
      } else {
        this.setState({ changePasswordError: t('settings.globalKeyErrorOccurred') });
      }
    } else {
      this.setState({ changePasswordError: t('settings.globalKeyPasswordMismatch') });
    }
  };

  public handleExportSettings = async (): Promise<void> => {
    const { t, exportVaultFile, showNotification } = this.props;

    const result = await exportVaultFile();

    if (result !== ExportResult.CANCEL) {
      const exported = result === ExportResult.COMPLETE;

      showNotification(
        t(exported ? 'settings.exportVaultSuccessful' : 'settings.exportVaultFailed'),
        exported ? 'success' : 'warning',
      );
    }
  };

  public render(): React.ReactElement {
    const { classes, goBack, hasWallets, t } = this.props;
    const { currency, globalKeySet, language } = this.state;

    return (
      <Page title="Settings" leftIcon={<Back onClick={goBack} />}>
        <div className={classes.tabsContainer}>
          <Tabs
            className={classes.tabsSwitcher}
            value={this.state.tab}
            orientation="vertical"
            onChange={(event, tab) => this.setState({ tab })}
          >
            <Tab id="common" label={t('settings.common')} />
            <Tab disabled={!globalKeySet} id="global-key" label={t('settings.globalKey')} />
            <Tab disabled={!globalKeySet || !hasWallets} id="export-vault" label={t('settings.exportVault')} />
          </Tabs>
          <div className={classes.formBody} hidden={this.state.tab !== SettingsTabs.COMMON}>
            <div className={classes.formRow}>
              <div className={classes.left}>
                <div className={classes.fieldName}>{t('settings.currency')}</div>
              </div>
              <div className={classes.right}>
                <TextField select={true} fullWidth={true} value={currency} onChange={this.handleCurrencyChange}>
                  <MenuItem key="eur" value="eur">
                    EUR
                  </MenuItem>
                  <MenuItem key="usd" value="usd">
                    USD
                  </MenuItem>
                  <MenuItem key="cny" value="cny">
                    CNY
                  </MenuItem>
                  <MenuItem key="rub" value="rub">
                    RUB
                  </MenuItem>
                  <MenuItem key="krw" value="krw">
                    KRW
                  </MenuItem>
                  <MenuItem key="aud" value="aud">
                    AUD
                  </MenuItem>
                </TextField>
              </div>
            </div>
            <div className={classes.formRow}>
              <div className={classes.left}>
                <div className={classes.fieldName}>{t('settings.lang')}</div>
              </div>
              <div className={classes.right}>
                <TextField select={true} value={language} fullWidth={true} onChange={this.handleLanguageChange}>
                  <MenuItem key="en-US" value="en-US">
                    English (US)
                  </MenuItem>
                  <MenuItem key="zh-CN" value="zh-CN">
                    中文
                  </MenuItem>
                  <MenuItem key="pt-BR" value="pt-BR">
                    Portugese
                  </MenuItem>
                  <MenuItem key="ko-KR" value="ko-KR">
                    Korean
                  </MenuItem>
                </TextField>
              </div>
            </div>
            <div className={classes.formRow}>
              <div className={classes.left} />
              <div className={classes.right}>
                <Button primary={true} label="Save" onClick={this.handleSave} />
              </div>
            </div>
          </div>
          {globalKeySet && (
            <>
              <div className={classes.formBody} hidden={this.state.tab !== SettingsTabs.GLOBAL_KEY}>
                <div className={classes.formRow}>
                  <div className={classes.left}>
                    <div className={classes.fieldName}>{t('settings.globalKeyOld')}</div>
                  </div>
                  <div className={classes.right}>
                    <div className={classes.fieldInput}>
                      <PasswordInput onChange={(password) => this.setState({ oldPassword: password })} />
                    </div>
                  </div>
                </div>
                <div className={classes.formRow}>
                  <div className={classes.left}>
                    <div className={classes.fieldName}>{t('settings.globalKeyNew')}</div>
                  </div>
                  <div className={classes.right}>
                    <div className={classes.fieldInput}>
                      <PasswordInput
                        error={this.state.changePasswordError}
                        onChange={(password) => this.setState({ newPassword: password })}
                      />
                    </div>
                  </div>
                </div>
                <div className={classes.formRow}>
                  <div className={classes.left}>
                    <div className={classes.fieldName}>{t('settings.globalKeyConfirm')}</div>
                  </div>
                  <div className={classes.right}>
                    <div className={classes.fieldInput}>
                      <PasswordInput onChange={(password) => this.setState({ confirmPassword: password })} />
                    </div>
                  </div>
                </div>
                <div className={classes.formRow}>
                  <div className={classes.left} />
                  <div className={classes.right}>
                    <Button
                      disabled={!this.checkPasswords()}
                      primary={true}
                      label="Change"
                      onClick={this.handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className={classes.formBody} hidden={this.state.tab !== SettingsTabs.EXPORT_VAULT}>
                <div className={classes.formRow}>
                  <div className={classes.right}>
                    <Alert severity="info">
                      Export a backup copy of the Emerald Wallet Vault. The file contains all information required to
                      restore the wallet on a new machine. Please keep it in a safe place. Please note that the Private
                      Keys are encrypted by your password used in Emerald Wallet, and you&apos;ll need it to restore
                      from backup.
                    </Alert>
                  </div>
                </div>
                <div className={classes.formRow}>
                  <div className={classes.left}>
                    <div className={classes.fieldName}>{t('settings.exportBackup')}</div>
                  </div>
                  <div className={classes.right}>
                    <Button label={t('settings.export')} primary={true} onClick={this.handleExportSettings} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Page>
    );
  }
}

export default withStyles(styles)(SettingsForm);

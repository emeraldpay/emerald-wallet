import { Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput, Theme } from '@emeraldwallet/ui';
import { MenuItem, Tab, TextField, createStyles, withStyles } from '@material-ui/core';
import { Alert, TabContext, TabList, TabPanel } from '@material-ui/lab';
import * as React from 'react';
import { WithTranslation } from 'react-i18next';
import SeedItem from './SeedItem';
import { DispatchProps, MutableState, StateProps } from '../Settings/Settings';
import { ExportResult } from '../Settings/types';

const styles = createStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
  formBody: {
    flex: 1,
  },
  tabsContainer: {
    display: 'flex',
  },
  tabsSwitcher: {
    borderRight: `1px solid ${Theme.palette.secondary.main}`,
    marginRight: 20,
  },
});

enum SettingsTabs {
  COMMON = '0',
  SEEDS = '1',
  GLOBAL_KEY = '2',
  EXPORT_VAULT = '3',
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
        t(exported ? 'settings.exportSuccessful' : 'settings.exportFailed'),
        exported ? 'success' : 'warning',
      );
    }
  };

  public render(): React.ReactElement {
    const { classes, goBack, hasWallets, seeds, t, updateSeed } = this.props;
    const { currency, globalKeySet, language } = this.state;

    return (
      <Page title="Settings" leftIcon={<Back onClick={goBack} />}>
        <div className={classes.tabsContainer}>
          <TabContext value={this.state.tab}>
            <TabList
              className={classes.tabsSwitcher}
              orientation="vertical"
              variant="scrollable"
              onChange={(event, tab) => this.setState({ tab })}
            >
              <Tab label={t('settings.common')} value={SettingsTabs.COMMON} />
              <Tab label={t('settings.seeds')} value={SettingsTabs.SEEDS} />
              <Tab disabled={!globalKeySet} label={t('settings.globalKey')} value={SettingsTabs.GLOBAL_KEY} />
              <Tab
                disabled={!globalKeySet || !hasWallets}
                label={t('settings.exportVault')}
                value={SettingsTabs.EXPORT_VAULT}
              />
            </TabList>
            <TabPanel className={classes.formBody} value={SettingsTabs.COMMON}>
              <FormRow>
                <FormLabel>{t('settings.currency')}</FormLabel>
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
              </FormRow>
              <FormRow>
                <FormLabel>{t('settings.lang')}</FormLabel>
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
              </FormRow>
              <FormRow last>
                <ButtonGroup classes={{ container: classes.buttons }}>
                  <Button primary={true} label="Save" onClick={this.handleSave} />
                </ButtonGroup>
              </FormRow>
            </TabPanel>
            <TabPanel className={classes.formBody} value={SettingsTabs.SEEDS}>
              {seeds.length > 0 ? (
                seeds.map((seed) => <SeedItem key={seed.id} seed={seed} updateSeed={updateSeed} />)
              ) : (
                <Alert severity="info">{t('settings.seedsNote')}</Alert>
              )}
            </TabPanel>
            {globalKeySet && (
              <>
                <TabPanel className={classes.formBody} value={SettingsTabs.GLOBAL_KEY}>
                  <FormRow>
                    <FormLabel>{t('settings.globalKeyOld')}</FormLabel>
                    <PasswordInput onChange={(password) => this.setState({ oldPassword: password })} />
                  </FormRow>
                  <FormRow>
                    <FormLabel>{t('settings.globalKeyNew')}</FormLabel>
                    <PasswordInput
                      error={this.state.changePasswordError}
                      onChange={(password) => this.setState({ newPassword: password })}
                    />
                  </FormRow>
                  <FormRow>
                    <FormLabel>{t('settings.globalKeyConfirm')}</FormLabel>
                    <PasswordInput onChange={(password) => this.setState({ confirmPassword: password })} />
                  </FormRow>
                  <FormRow last>
                    <ButtonGroup classes={{ container: classes.buttons }}>
                      <Button
                        disabled={!this.checkPasswords()}
                        primary={true}
                        label="Change"
                        onClick={this.handleChange}
                      />
                    </ButtonGroup>
                  </FormRow>
                </TabPanel>
                <TabPanel className={classes.formBody} value={SettingsTabs.EXPORT_VAULT}>
                  <FormRow>
                    <Alert severity="info">{t('settings.exportNote')}</Alert>
                  </FormRow>
                  <FormRow last>
                    <FormLabel>{t('settings.exportBackup')}</FormLabel>
                    <Button label={t('settings.exportSelectFile')} primary={true} onClick={this.handleExportSettings} />
                  </FormRow>
                </TabPanel>
              </>
            )}
          </TabContext>
        </div>
      </Page>
    );
  }
}

export default withStyles(styles)(SettingsForm);

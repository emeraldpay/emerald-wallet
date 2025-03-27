import { Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import { Alert, MenuItem, Tab, TextField } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { WithTranslation } from 'react-i18next';
import { DispatchProps, MutableState, StateProps } from '../Settings/Settings';
import { ExportResult } from '../Settings/types';
import SeedItem from './SeedItem';

const useStyles = makeStyles()((theme) => ({
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
    borderRight: `1px solid ${theme.palette.secondary.main}`,
    marginRight: 20,
  },
}));

enum SettingsTabs {
  COMMON = '0',
  SEEDS = '1',
  GLOBAL_KEY = '2',
  EXPORT_VAULT = '3',
}

interface State extends MutableState {
  changePasswordError?: string;
  confirmPassword?: string;
  globalKeySet: boolean;
  newPassword?: string;
  oldPassword?: string;
  tab: SettingsTabs;
}

export interface Props extends DispatchProps, MutableState, StateProps, WithTranslation {}

const SettingsForm: React.FC<Props> = (props) => {
  const { classes } = useStyles();
  const { goBack, hasWallets, seeds, t, updateSeed, onSubmit, onChangeGlobalKey, showNotification, exportVaultFile } = props;

  const [state, setState] = React.useState<State>({
    currency: props.currency.toLowerCase(),
    globalKeySet: false,
    language: props.language,
    tab: SettingsTabs.COMMON,
  });

  const oldPasswordClearRef = React.useRef<(() => void) | undefined>();
  const newPasswordClearRef = React.useRef<(() => void) | undefined>();
  const confirmPasswordClearRef = React.useRef<(() => void) | undefined>();

  React.useEffect(() => {
    const checkGlobalKey = async () => {
      const hasGlobalKey = await props.isGlobalKeySet();
      setState(prevState => ({ ...prevState, globalKeySet: hasGlobalKey }));
    };

    checkGlobalKey();
  }, [props]);

  const checkPasswords = (): boolean => {
    const { confirmPassword, newPassword, oldPassword } = state;
    return (confirmPassword?.length ?? 0) > 0 && (newPassword?.length ?? 0) > 0 && (oldPassword?.length ?? 0) > 0;
  };

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setState(prevState => ({ ...prevState, currency: event.target.value }));
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setState(prevState => ({ ...prevState, language: event.target.value }));
  };

  const handleSettingsSave = async (): Promise<void> => {
    await onSubmit(state);
  };

  const handlePasswordChange = async (): Promise<void> => {
    const { confirmPassword, newPassword, oldPassword } = state;

    setState(prevState => ({ ...prevState, changePasswordError: undefined }));

    if (newPassword == null || oldPassword == null || confirmPassword == null) {
      return;
    }

    if (newPassword === oldPassword || newPassword !== confirmPassword) {
      setState(prevState => ({ ...prevState, changePasswordError: t('settings.globalKeyPasswordMismatch') }));
      return;
    }

    const passwordChanged = await onChangeGlobalKey(oldPassword, newPassword);

    if (passwordChanged) {
      showNotification(t('settings.globalKeyChanged'));

      setState(prevState => ({
        ...prevState,
        confirmPassword: undefined,
        newPassword: undefined,
        oldPassword: undefined,
      }));

      if (oldPasswordClearRef.current) oldPasswordClearRef.current();
      if (newPasswordClearRef.current) newPasswordClearRef.current();
      if (confirmPasswordClearRef.current) confirmPasswordClearRef.current();
    } else {
      setState(prevState => ({ ...prevState, changePasswordError: t('settings.globalKeyErrorOccurred') }));
    }
  };

  const handleExportSettings = async (): Promise<void> => {
    const result = await exportVaultFile();

    if (result !== ExportResult.CANCEL) {
      const exported = result === ExportResult.COMPLETE;

      showNotification(
        t(exported ? 'settings.exportSuccessful' : 'settings.exportFailed'),
        exported ? 'success' : 'warning',
      );
    }
  };

  const { currency, globalKeySet, language, tab } = state;

  return (
    <Page title="Settings" leftIcon={<Back onClick={goBack} />}>
      <div className={classes.tabsContainer}>
        <TabContext value={tab}>
          <TabList
            className={classes.tabsSwitcher}
            orientation="vertical"
            variant="scrollable"
            onChange={(_, newTab) => setState(prevState => ({ ...prevState, tab: newTab as SettingsTabs }))}
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
              <TextField select={true} fullWidth={true} value={currency} onChange={handleCurrencyChange}>
                <MenuItem key="eur" value="eur">
                  EUR
                </MenuItem>
                <MenuItem key="usd" value="usd">
                  USD
                </MenuItem>
                <MenuItem key="gbp" value="gbp">
                  GBP
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
              <TextField select={true} value={language} fullWidth={true} onChange={handleLanguageChange}>
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
                <Button primary={true} label="Save" onClick={handleSettingsSave} />
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
                  <PasswordInput
                    autoFocus
                    minLength={1}
                    placeholder="Enter existing password"
                    showLengthNotice={false}
                    clearPassword={(callback) => { oldPasswordClearRef.current = callback; }}
                    onChange={(password) => setState(prevState => ({ ...prevState, oldPassword: password }))}
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>{t('settings.globalKeyNew')}</FormLabel>
                  <PasswordInput
                    error={state.changePasswordError}
                    clearPassword={(callback) => { newPasswordClearRef.current = callback; }}
                    onChange={(password) => setState(prevState => ({ ...prevState, newPassword: password }))}
                  />
                </FormRow>
                <FormRow>
                  <FormLabel>{t('settings.globalKeyConfirm')}</FormLabel>
                  <PasswordInput
                    clearPassword={(callback) => { confirmPasswordClearRef.current = callback; }}
                    onChange={(password) => setState(prevState => ({ ...prevState, confirmPassword: password }))}
                  />
                </FormRow>
                <FormRow last>
                  <ButtonGroup classes={{ container: classes.buttons }}>
                    <Button
                      disabled={!checkPasswords()}
                      primary={true}
                      label="Change"
                      onClick={handlePasswordChange}
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
                  <Button label={t('settings.exportSelectFile')} primary={true} onClick={handleExportSettings} />
                </FormRow>
              </TabPanel>
            </>
          )}
        </TabContext>
      </div>
    </Page>
  );
};

export default SettingsForm;

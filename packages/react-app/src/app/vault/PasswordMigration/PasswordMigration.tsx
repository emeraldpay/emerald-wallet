import { OddPasswordItem, Uuid } from '@emeraldpay/emerald-vault-core';
import { accounts, screen } from '@emeraldwallet/store';
import { Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput, Table } from '@emeraldwallet/ui';
import {
  CircularProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import { green as greenColor, grey as greyColor, orange as orangeColor } from '@material-ui/core/colors';
import { Done as DoneIcon, RemoveCircle as SkipIcon, Warning as WarningIcon } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { useState } from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    gutter: {
      marginBottom: 15,
    },
    label: {
      minWidth: 360,
      width: 360,
    },
    loader: {
      fontSize: '1.7142857142857142rem',
    },
    status: {
      alignItems: 'center',
      display: 'inline-flex',
      gap: '5px',
      minWidth: 120,
    },
  }),
);

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  getLegacyItems(): Promise<OddPasswordItem[]>;
  goHome(): Promise<void>;
  upgradeLegacyItems(globalPassword: string, password: string): Promise<Uuid[]>;
}

type PasswordType = OddPasswordItem & { upgraded?: boolean };

const PasswordMigration: React.FC<DispatchProps> = ({ checkGlobalKey, getLegacyItems, goHome, upgradeLegacyItems }) => {
  const styles = useStyles();

  const [initializing, setInitializing] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const [legacyItems, setLegacyItems] = React.useState<PasswordType[]>([]);

  const [globalPassword, setGlobalPassword] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [globalPasswordError, setGlobalPasswordError] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const applyPassword = React.useCallback(async () => {
    setGlobalPasswordError(undefined);
    setPasswordError(undefined);

    const correctGlobalPassword = await checkGlobalKey(globalPassword);

    if (!correctGlobalPassword) {
      setGlobalPasswordError('Incorrect password');

      return;
    }

    if (password.length === 0) {
      setPasswordError('Incorrect password');

      return;
    }

    setUpgrading(true);

    const upgraded = await upgradeLegacyItems(globalPassword, password);

    setUpgrading(false);
    setLegacyItems(
      legacyItems.map((item) => ({
        ...item,
        upgraded: item.upgraded === true ? item.upgraded : upgraded.includes(item.id),
      })),
    );
  }, [legacyItems, globalPassword, password, checkGlobalKey, upgradeLegacyItems]);

  React.useEffect(
    () => {
      (async () => {
        const items = await getLegacyItems();

        setLegacyItems(items);

        setInitializing(false);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const allItemsUpgraded = legacyItems.reduce((carry, item) => carry && item.upgraded === true, true);

  return (
    <Page title="Setup Global Password">
      <Alert severity="info" style={{ marginBottom: 15 }}>
        Starting Emerald Wallet v2.6 uses a different schema to store Privates Keys, which is more secure and easier to
        use.
      </Alert>
      <Typography style={{ marginBottom: 15 }}>
        To begin using the new format, please enter your password(s) to current wallets so Emerald will be able to
        migrate them.
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {legacyItems.map((password) => (
            <TableRow key={password.id}>
              <TableCell>{password.type === 'key' ? 'Private Key' : 'Seed'}</TableCell>
              <TableCell>{password.id}</TableCell>
              <TableCell>
                {upgrading && !password.upgraded ? (
                  <div className={styles.status}>
                    <CircularProgress color="primary" className={styles.loader} size="1em" />
                    <span>Migrating...</span>
                  </div>
                ) : password.upgraded == null ? (
                  <div className={styles.status}>
                    <WarningIcon style={{ color: orangeColor['500'] }} />
                    <span>Migration required</span>
                  </div>
                ) : password.upgraded ? (
                  <div className={styles.status}>
                    <DoneIcon style={{ color: greenColor['500'] }} />
                    <span>Migration successful</span>
                  </div>
                ) : (
                  <div className={styles.status}>
                    <SkipIcon style={{ color: greyColor['500'] }} />
                    <span>Migration skipped</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FormRow>
        <FormLabel classes={{ root: styles.label }}>Global password:</FormLabel>
        <PasswordInput
          disabled={initializing}
          error={globalPasswordError}
          onChange={(value) => setGlobalPassword(value)}
        />
      </FormRow>
      <FormRow>
        <FormLabel classes={{ root: styles.label }}>Old password (for any of the items above):</FormLabel>
        <PasswordInput disabled={initializing} error={passwordError} onChange={(value) => setPassword(value)} />
      </FormRow>
      <FormRow>
        <FormLabel classes={{ root: styles.label }} />
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button
            disabled={initializing}
            label={allItemsUpgraded ? 'Continue' : 'Skip'}
            primary={allItemsUpgraded}
            onClick={goHome}
          />
          {!allItemsUpgraded && <Button disabled={initializing} label="Apply" primary={true} onClick={applyPassword} />}
        </ButtonGroup>
      </FormRow>
    </Page>
  );
};

export default connect<unknown, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    getLegacyItems() {
      return dispatch(accounts.actions.getOddPasswordItems());
    },
    goHome() {
      return dispatch(screen.actions.gotoWalletsScreen());
    },
    upgradeLegacyItems(globalPassword, password) {
      return dispatch(accounts.actions.tryUpgradeOddItems(password, globalPassword));
    },
  }),
)(PasswordMigration);

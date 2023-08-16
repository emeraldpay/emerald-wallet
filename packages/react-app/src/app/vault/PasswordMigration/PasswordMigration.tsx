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
  getLegacyItems(): Promise<OddPasswordItem[]>;
  goHome(): Promise<void>;
  upgradeLegacyItems(legacyPassword: string, globalPassword: string): Promise<Uuid[]>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

type PasswordType = OddPasswordItem & { upgraded?: boolean };

const PasswordMigration: React.FC<DispatchProps> = ({
  getLegacyItems,
  goHome,
  upgradeLegacyItems,
  verifyGlobalKey,
}) => {
  const styles = useStyles();

  const [initializing, setInitializing] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [verifying, setVerifying] = React.useState(false);

  const [legacyItems, setLegacyItems] = React.useState<PasswordType[]>([]);

  const [globalPassword, setGlobalPassword] = React.useState<string>();
  const [globalPasswordError, setGlobalPasswordError] = React.useState<string>();

  const [legacyPassword, setLegacyPassword] = React.useState<string>();
  const [legacyPasswordError, setLegacyPasswordError] = React.useState<string>();

  const applyPassword = async (): Promise<void> => {
    if (globalPassword == null || legacyPassword == null || legacyPassword.length === 0) {
      return;
    }

    setGlobalPasswordError(undefined);
    setLegacyPasswordError(undefined);

    setVerifying(true);

    const correctGlobalPassword = await verifyGlobalKey(globalPassword);

    if (!correctGlobalPassword) {
      setGlobalPasswordError('Incorrect password');
      setVerifying(false);

      return;
    }

    setUpgrading(true);

    const upgraded = await upgradeLegacyItems(legacyPassword, globalPassword);

    setLegacyItems(
      legacyItems.map((item) => ({
        ...item,
        upgraded: item.upgraded === true ? item.upgraded : upgraded.includes(item.id),
      })),
    );

    setUpgrading(false);
    setVerifying(false);
  };

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

  const processing = initializing || upgrading || verifying;
  const applyDisabled = processing || (globalPassword?.length ?? 0) === 0 || (legacyPassword?.length ?? 0) === 0;

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
          {legacyItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.type === 'key' ? 'Private Key' : 'Seed'}</TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell>
                {upgrading && !item.upgraded ? (
                  <div className={styles.status}>
                    <CircularProgress color="primary" className={styles.loader} size="1em" />
                    <span>Migrating...</span>
                  </div>
                ) : item.upgraded == null ? (
                  <div className={styles.status}>
                    <WarningIcon style={{ color: orangeColor['500'] }} />
                    <span>Migration required</span>
                  </div>
                ) : item.upgraded ? (
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
          minLength={1}
          placeholder="Enter existing password"
          showLengthNotice={false}
          onChange={(value) => setGlobalPassword(value)}
        />
      </FormRow>
      <FormRow>
        <FormLabel classes={{ root: styles.label }}>Old password (for any of the items above):</FormLabel>
        <PasswordInput
          disabled={initializing}
          error={legacyPasswordError}
          minLength={1}
          placeholder="Enter existing password"
          showLengthNotice={false}
          onChange={(value) => setLegacyPassword(value)}
        />
      </FormRow>
      <FormRow>
        <FormLabel classes={{ root: styles.label }} />
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button
            disabled={processing}
            label={allItemsUpgraded ? 'Continue' : 'Skip'}
            primary={allItemsUpgraded}
            onClick={goHome}
          />
          {!allItemsUpgraded && (
            <Button disabled={applyDisabled} label="Apply" primary={true} onClick={applyPassword} />
          )}
        </ButtonGroup>
      </FormRow>
    </Page>
  );
};

export default connect<unknown, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getLegacyItems() {
      return dispatch(accounts.actions.getOddPasswordItems());
    },
    goHome() {
      return dispatch(screen.actions.gotoWalletsScreen());
    },
    upgradeLegacyItems(legacyPassword, globalPassword) {
      return dispatch(accounts.actions.tryUpgradeOddItems(legacyPassword, globalPassword));
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(PasswordMigration);

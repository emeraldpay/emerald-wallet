import { OddPasswordItem, Uuid } from '@emeraldpay/emerald-vault-core';
import { accounts, screen } from '@emeraldwallet/store';
import { Button, ButtonGroup, Page, PasswordInput } from '@emeraldwallet/ui';
import {
  CircularProgress,
  createStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  withStyles,
} from '@material-ui/core';
import { green as greenColor, grey as greyColor, orange as orangeColor } from '@material-ui/core/colors';
import { Done as DoneIcon, RemoveCircle as SkipIcon, Warning as WarningIcon } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { useState } from 'react';
import { connect } from 'react-redux';
import FormFieldWrapper from '../../../transaction/CreateTx/FormFieldWrapper';
import FormLabel from '../../../transaction/CreateTx/FormLabel/FormLabel';

const styles = createStyles({
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
});

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  getLegacyItems(): Promise<OddPasswordItem[]>;
  goHome(): Promise<void>;
  upgradeLegacyItems(globalPassword: string, password: string): Promise<Uuid[]>;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

type PasswordType = OddPasswordItem & { upgraded?: boolean };

const PasswordMigration: React.FC<DispatchProps & StylesProps> = ({
  classes,
  checkGlobalKey,
  getLegacyItems,
  goHome,
  upgradeLegacyItems,
}) => {
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
  }, [legacyItems, globalPassword, password]);

  React.useEffect(() => {
    (async () => {
      const items = await getLegacyItems();

      setLegacyItems(items);

      setInitializing(false);
    })();
  }, []);

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
                  <div className={classes.status}>
                    <CircularProgress color="primary" className={classes.loader} size="1em" />
                    <span>Migrating...</span>
                  </div>
                ) : password.upgraded == null ? (
                  <div className={classes.status}>
                    <WarningIcon style={{ color: orangeColor['500'] }} />
                    <span>Migration required</span>
                  </div>
                ) : password.upgraded ? (
                  <div className={classes.status}>
                    <DoneIcon style={{ color: greenColor['500'] }} />
                    <span>Migration successful</span>
                  </div>
                ) : (
                  <div className={classes.status}>
                    <SkipIcon style={{ color: greyColor['500'] }} />
                    <span>Migration skipped</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FormFieldWrapper>
        <FormLabel classes={{ root: classes.label }}>Global password:</FormLabel>
        <PasswordInput
          disabled={initializing}
          error={globalPasswordError}
          onChange={(value) => setGlobalPassword(value)}
        />
      </FormFieldWrapper>
      <FormFieldWrapper>
        <FormLabel classes={{ root: classes.label }}>Old password (for any of the items above):</FormLabel>
        <PasswordInput
          disabled={initializing}
          error={passwordError}
          onChange={(value) => setPassword(value)}
        />
      </FormFieldWrapper>
      <FormFieldWrapper>
        <FormLabel classes={{ root: classes.label }} />
        <ButtonGroup>
          <Button
            disabled={initializing}
            label={allItemsUpgraded ? 'Continue' : 'Skip'}
            primary={allItemsUpgraded}
            onClick={goHome}
          />
          {!allItemsUpgraded && <Button disabled={initializing} label="Apply" primary={true} onClick={applyPassword} />}
        </ButtonGroup>
      </FormFieldWrapper>
    </Page>
  );
};

export default connect<{}, DispatchProps>(
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
)(withStyles(styles)(PasswordMigration));

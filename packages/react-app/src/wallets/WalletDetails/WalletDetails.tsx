import { EthereumEntry, isBitcoinEntry, isEthereumEntry, Wallet, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { accounts, IState, screen } from '@emeraldwallet/store';
import { Back, HashIcon, InlineEdit, Page, PageTitle, Pen3 as EditIcon } from '@emeraldwallet/ui';
import { Box, Button, createStyles, Grid, IconButton, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AccountBalanceWalletOutlined as WalletIcon } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import WalletMenu from '../WalletList/WalletMenu';
import BitcoinAccountItem from './BitcoinAccountItem';
import EthereumAccountItem from './EthereumAccountItem';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    actionButton: {
      width: '150px',
      margin: '5px 10px',
    },
    actions: {
      textAlign: 'center',
      clear: 'both',
      marginTop: '20px',
      paddingLeft: theme.spacing(3),
    },
    walletIcon: {
      cursor: 'pointer',
      paddingLeft: '16px',
      paddingTop: '24px',
    },
  }),
);

interface OwnProps {
  walletId: string;
}

interface StateProps {
  hasOtherWallets: boolean;
  wallet?: Wallet;
}

interface DispatchProps {
  goBack(): void;
  onReceive(): void;
  onSend(): void;
  updateWallet(data: Partial<Wallet>): void;
}

const WalletDetails: React.FC<DispatchProps & OwnProps & StateProps> = ({
  hasOtherWallets,
  wallet,
  goBack,
  updateWallet,
  onReceive,
  onSend,
}) => {
  if (wallet == null) {
    return (
      <Alert>
        <Typography>Wallet is not found</Typography>
      </Alert>
    );
  }

  const styles = useStyles();

  const [edit, setEdit] = React.useState(false);

  const handleSave = (data: { id: string; value: string }): void => {
    updateWallet({
      id: data.id,
      name: data.value,
    });

    setEdit(false);
  };

  const walletName = wallet.name ?? '';

  const renderTitle = (): React.ReactElement => (
    <PageTitle>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', paddingRight: '5px' }}>
          <WalletIcon />
        </div>
        <div style={{ width: '100%' }}>
          {edit ? (
            <InlineEdit
              placeholder="Wallet name"
              initialValue={walletName}
              id={wallet.id}
              onSave={handleSave}
              onCancel={() => setEdit(false)}
            />
          ) : (
            <React.Fragment>
              <Typography className={styles.titleText}>
                {walletName}
                <IconButton onClick={() => setEdit(true)}>
                  <EditIcon />
                </IconButton>
              </Typography>
            </React.Fragment>
          )}
        </div>
      </div>
    </PageTitle>
  );

  const renderEntry = (entries: WalletEntry[]): React.ReactElement => {
    const [entry] = entries;

    if (isBitcoinEntry(entry)) {
      return <BitcoinAccountItem walletId={wallet.id} entry={entry} key={entry.id} />;
    }

    const ethereumEntries = entries.filter((item): item is EthereumEntry => isEthereumEntry(item));

    if (ethereumEntries.length > 0) {
      return <EthereumAccountItem walletId={wallet.id} entries={ethereumEntries} key={entry.id} />;
    }

    console.warn('Unsupported entry type in wallet ', wallet.id);

    return <Box />;
  };

  const entriesByBlockchain = React.useMemo(
    () =>
      Object.values(
        wallet.entries.reduce<Record<number, WalletEntry[]>>(
          (carry, entry) => ({
            ...carry,
            [entry.blockchain]: [...(carry[entry.blockchain] ?? []), entry],
          }),
          {},
        ),
      ),
    [wallet.entries],
  );

  return (
    <Page
      title={renderTitle()}
      leftIcon={hasOtherWallets ? <Back onClick={goBack} /> : null}
      rightIcon={<WalletMenu walletId={wallet.id} />}
    >
      <Grid container={true}>
        <Grid item={true} xs={2} className={styles.walletIcon}>
          <HashIcon value={'WALLET/' + wallet.id} size={100} />
        </Grid>
        <Grid item={true} xs={7}>
          {entriesByBlockchain.map(renderEntry)}
        </Grid>
        <Grid item={true} xs={3} className={styles.actions}>
          <Button className={styles.actionButton} color="secondary" variant="contained" onClick={onSend}>
            Send
          </Button>
          <Button className={styles.actionButton} color="secondary" variant="contained" onClick={onReceive}>
            Receive
          </Button>
        </Grid>
      </Grid>
    </Page>
  );
};

export default connect(
  (state: IState, ownProps: OwnProps): StateProps => ({
    hasOtherWallets: state.accounts.wallets.length > 1,
    wallet: accounts.selectors.findWallet(state, ownProps.walletId),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps: OwnProps): DispatchProps => {
    return {
      goBack: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
      },
      onReceive: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, ownProps.walletId));
      },
      onSend: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, ownProps.walletId));
      },
      updateWallet: (data: Partial<Wallet>) => {
        if (data.id != null) {
          dispatch(accounts.actions.updateWallet(data.id, data.name ?? ''));
        }
      },
    };
  },
)(WalletDetails);

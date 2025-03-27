import { SeedDescription, Wallet, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { isSeedPkRef } from '@emeraldpay/emerald-vault-core/lib/types';
import { Blockchains, blockchainIdToCode, utils } from '@emeraldwallet/core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, Page, Table } from '@emeraldwallet/ui';
import { Divider, TableBody, TableCell, TableRow } from '@mui/material';
import { Check as CheckIcon, Close as CrossIcon } from '@mui/icons-material';
import { clipboard } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import {makeStyles} from 'tss-react/mui';

const useStyles = makeStyles()({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    marginTop: 20,
    width: '100%',
  },
  header: {
    marginTop: 0,
  },
});

interface DispatchProps {
  goBack(): void;
}

interface OwnProps {
  walletId: string;
}

interface StateProps {
  language: string;
  seeds?: SeedDescription[];
  wallet?: Wallet;
}

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'numeric',
  year: 'numeric',
};

const useTitleCellStyles = makeStyles()({
  body: {
    paddingLeft: 0,
    width: '20%',
  },
});

const TitleTableCell = ({children}: React.PropsWithChildren<any>) => {
  return <TableCell classes={useTitleCellStyles().classes}>{children}</TableCell>;
}

const useValueCellStyles = makeStyles()({
  body: {
    paddingRight: 0,
    //wordBreak: 'break-word',
  },
});

const ValueTableCell = ({children}: React.PropsWithChildren<any>) => {
  return <TableCell classes={useValueCellStyles().classes}>{children}</TableCell>;
}

const WalletInfo: React.FC<OwnProps & StateProps & DispatchProps> = ({
  language,
  seeds,
  wallet,
  goBack,
}) => {
  const { classes } = useStyles();

  const onCopy = React.useCallback(
    () =>
      clipboard.writeText(
        [
          '-- Wallet --',
          `ID: ${wallet?.id}`,
          `Name: ${wallet?.name}`,
          `Created At: ${wallet?.createdAt}`,
          wallet?.reserved != null && wallet.reserved.length > 0
            ? `HD Account: ${wallet.reserved.map(({ accountId }) => `m/x'/x'/${accountId}'/0/0`).join(', ')}`
            : null,
          '-- Entries --',
          (wallet?.entries != null && wallet.entries.length > 0
            ? wallet.entries.map((entry) =>
                [
                  `ID: ${entry.id}`,
                  `Label: ${entry.label ?? 'Not set'}`,
                  `Created At: ${entry.createdAt}`,
                  `Blockchain: ${Blockchains[blockchainIdToCode(entry.blockchain).toString()].getTitle()}`,
                  isBitcoinEntry(entry)
                    ? entry.xpub
                        .map(({ role, xpub }) => `${role === 'receive' ? 'Receive' : 'Change'} xPub: ${xpub}`)
                        .join('\n')
                    : `Address: ${entry.address?.value}`,
                  ...(isSeedPkRef(entry, entry.key)
                    ? [`HD Path: ${entry.key.hdPath}`]
                    : [`Private Key Id: ${entry.key?.keyId}`, `Private Key Type: ${entry.key?.type}`]),
                  entry.receiveDisabled ? `Shadow Entry: True` : null,
                ]
                  .filter((line) => line != null)
                  .join('\n'),
              )
            : ['# No entries']
          ).join('\n---\n'),
          '-- Seeds --',
          (seeds != null && seeds.length > 0
            ? seeds.map((seed) =>
                [
                  `ID: ${seed.id}`,
                  `Label: ${seed.label ?? 'Not set'}`,
                  `Created At: ${seed.createdAt}`,
                  `Hardware: ${seed.type === 'ledger' ? 'True' : 'False'}`,
                ].join('\n'),
              )
            : ['# No seeds']
          ).join('\n---\n'),
        ]
          .filter((line) => line != null)
          .join('\n'),
      ),
    [seeds, wallet],
  );

  return (
    <Page title="Wallet Details" leftIcon={<Back onClick={goBack} />}>
      <h2 className={classes.header}>Wallet</h2>
      <Table>
        <TableBody>
          <TableRow>
            <TitleTableCell>Wallet</TitleTableCell>
            <ValueTableCell>{wallet?.name}</ValueTableCell>
          </TableRow>
          <TableRow>
            <TitleTableCell>ID</TitleTableCell>
            <ValueTableCell>{wallet?.id}</ValueTableCell>
          </TableRow>
          {(wallet?.description?.length ?? 0) > 0 && (
            <TableRow>
              <TitleTableCell>Description</TitleTableCell>
              <ValueTableCell>{wallet?.description}</ValueTableCell>
            </TableRow>
          )}
          <TableRow>
            <TitleTableCell>Created Date</TitleTableCell>
            <ValueTableCell>
              {utils.parseDate(wallet?.createdAt)?.toLocaleDateString(language, dateFormatOptions)}
            </ValueTableCell>
          </TableRow>
          {wallet?.reserved != null && wallet.reserved.length > 0 && (
            <TableRow>
              <TitleTableCell>HD Account</TitleTableCell>
              <ValueTableCell>
                {wallet.reserved.map((reserved) => `m/x'/x'/${reserved.accountId}'/0/0`).join(', ')}
              </ValueTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <h2>Entries</h2>
      {wallet?.entries.map((entry, index) => (
        <div key={entry.id}>
          <Table>
            <TableBody>
              <TableRow>
                <TitleTableCell>ID</TitleTableCell>
                <ValueTableCell>{entry.id}</ValueTableCell>
              </TableRow>
              {(entry.label?.length ?? 0) > 0 && (
                <TableRow>
                  <TitleTableCell>Label</TitleTableCell>
                  <ValueTableCell>{entry.label}</ValueTableCell>
                </TableRow>
              )}
              <TableRow>
                <TitleTableCell>Creation Date</TitleTableCell>
                <ValueTableCell>
                  {utils.parseDate(entry.createdAt)?.toLocaleDateString(language, dateFormatOptions)}
                </ValueTableCell>
              </TableRow>
              <TableRow>
                <TitleTableCell>Blockchain</TitleTableCell>
                <ValueTableCell>
                  {Blockchains[blockchainIdToCode(entry.blockchain).toString()].getTitle()}
                </ValueTableCell>
              </TableRow>
              {isBitcoinEntry(entry) ? (
                entry.xpub.map(({ role, xpub }) => (
                  <TableRow key={xpub}>
                    <TitleTableCell>{role === 'receive' ? 'Receive' : 'Change'} xPub</TitleTableCell>
                    <ValueTableCell>{xpub}</ValueTableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TitleTableCell>Address</TitleTableCell>
                  <ValueTableCell>{entry.address?.value}</ValueTableCell>
                </TableRow>
              )}
              {isSeedPkRef(entry, entry.key) ? (
                <TableRow>
                  <TitleTableCell>HDPath</TitleTableCell>
                  <ValueTableCell>{entry.key.hdPath}</ValueTableCell>
                </TableRow>
              ) : (
                <>
                  <TableRow>
                    <TitleTableCell>Private Key Id</TitleTableCell>
                    <ValueTableCell>{entry.key?.keyId}</ValueTableCell>
                  </TableRow>
                  <TableRow>
                    <TitleTableCell>Private Key Type</TitleTableCell>
                    <ValueTableCell>{entry.key?.type}</ValueTableCell>
                  </TableRow>
                </>
              )}
              {entry.receiveDisabled && (
                <TableRow>
                  <TitleTableCell>Shadow Entry</TitleTableCell>
                  <ValueTableCell>
                    <CheckIcon color="secondary" />
                  </ValueTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {index + 1 < wallet?.entries.length && <Divider />}
        </div>
      ))}
      {(seeds?.length ?? 0) > 0 && (
        <>
          <h2>Seeds</h2>
          {seeds?.map((seed, index) => (
            <div key={seed.id}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TitleTableCell>ID</TitleTableCell>
                    <ValueTableCell>{seed.id}</ValueTableCell>
                  </TableRow>
                  {seed.label != null && (
                    <TableRow>
                      <TitleTableCell>Label</TitleTableCell>
                      <ValueTableCell>{seed.label}</ValueTableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TitleTableCell>Creation Date</TitleTableCell>
                    <ValueTableCell>
                      {utils.parseDate(seed.createdAt)?.toLocaleDateString(language, dateFormatOptions)}
                    </ValueTableCell>
                  </TableRow>
                  <TableRow>
                    <TitleTableCell>Hardware</TitleTableCell>
                    <ValueTableCell>
                      {seed.type === 'ledger' ? <CheckIcon color="primary" /> : <CrossIcon color="secondary" />}
                    </ValueTableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {index + 1 < seeds?.length && <Divider />}
            </div>
          ))}
        </>
      )}
      <ButtonGroup classes={{ container: classes.buttons }}>
        <Button primary={true} label="Copy to clipboard" onClick={onCopy} />
      </ButtonGroup>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId);

    const seeds = wallet?.reserved
      ?.map((reserved) => accounts.selectors.getSeed(state, reserved.seedId))
      .filter((seed) => seed != null);

    return {
      seeds,
      wallet,
      language: i18n.language,
    } as StateProps;
  },
  (dispatch) => ({
    goBack() {
      dispatch(screen.actions.goBack());
    },
  }),
)(WalletInfo);

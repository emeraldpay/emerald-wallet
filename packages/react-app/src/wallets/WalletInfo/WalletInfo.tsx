import { SeedDescription, Wallet } from '@emeraldpay/emerald-vault-core';
import { isSeedPkRef } from '@emeraldpay/emerald-vault-core/lib/types';
import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { blockchainIdToCode, Blockchains } from '@emeraldwallet/core';
import { parseDate } from '@emeraldwallet/core/lib/utils';
import { accounts, IState, screen } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import { createStyles, Divider, Table, TableBody, TableCell, TableRow, withStyles } from '@material-ui/core';
import { Check as CheckIcon, Close as CrossIcon } from '@material-ui/icons';
import { clipboard } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';
import i18n from '../../i18n';

const styles = createStyles({
  header: {
    marginTop: 0,
  },
  textAlignRight: {
    textAlign: 'right',
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

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const dateFormatOptions = {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'numeric',
  year: 'numeric',
};

const TitleTableCell = withStyles(() => ({
  body: {
    paddingLeft: 0,
    width: '20%',
  },
}))(TableCell);

const ValueTableCell = withStyles(() => ({
  body: {
    paddingRight: 0,
    wordBreak: 'break-word',
  },
}))(TableCell);

const WalletInfo: React.FC<OwnProps & StateProps & StylesProps & DispatchProps> = ({
  classes,
  language,
  seeds,
  wallet,
  goBack,
}) => {
  const onCopy = React.useCallback(
    () =>
      clipboard.writeText(
        [
          '-- Wallet --',
          `ID: ${wallet?.id}`,
          `Name: ${wallet?.name}`,
          `Created At: ${wallet?.createdAt}`,
          `HD Account: ${wallet?.reserved?.map((reserved) => `m/x’/x’/${reserved.accountId}’/0/0`).join(', ')}`,
          '-- Entries --',
          (wallet?.entries != null && wallet.entries.length > 0
            ? wallet.entries.map((entry) =>
                [
                  `ID: ${entry.id}`,
                  `Label: ${entry.label ?? 'Not set'}`,
                  `Created At: ${entry.createdAt}`,
                  `Blockchain: ${Blockchains[blockchainIdToCode(entry.blockchain).toString()].getTitle()}`,
                  `Address: ${entry.address?.value}`,
                  ...(isSeedPkRef(entry, entry.key)
                    ? [`HD Path: ${entry.key.hdPath}`]
                    : [`Private Key Id: ${entry.key?.keyId}`, `Private Key Type: ${entry.key?.type}`]),
                ].join('\n'),
              )
            : ['# No entries']
          ).join('\n---\n'),
          '-- Seeds --',
          (seeds != null && seeds.length > 0
            ? seeds?.map((seed) =>
                [
                  `ID: ${seed.id}`,
                  `Label: ${seed.label ?? 'Not set'}`,
                  `Created At: ${seed.createdAt}`,
                  `Hardware: ${seed.type === 'ledger' ? 'True' : 'False'}`,
                ].join('\n'),
              )
            : ['# No seeds']
          ).join('\n---\n'),
        ].join('\n'),
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
              {parseDate(wallet?.createdAt)?.toLocaleDateString(language, dateFormatOptions)}
            </ValueTableCell>
          </TableRow>
          <TableRow>
            <TitleTableCell>HD Account</TitleTableCell>
            <ValueTableCell>
              {wallet?.reserved?.map((reserved) => `m/x’/x’/${reserved.accountId}’/0/0`).join(', ')}
            </ValueTableCell>
          </TableRow>
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
                  {parseDate(entry.createdAt)?.toLocaleDateString(language, dateFormatOptions)}
                </ValueTableCell>
              </TableRow>
              <TableRow>
                <TitleTableCell>Blockchain</TitleTableCell>
                <ValueTableCell>
                  {Blockchains[blockchainIdToCode(entry.blockchain).toString()].getTitle()}
                </ValueTableCell>
              </TableRow>
              <TableRow>
                <TitleTableCell>Address</TitleTableCell>
                <ValueTableCell>{entry.address?.value}</ValueTableCell>
              </TableRow>
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
                      {parseDate(seed.createdAt)?.toLocaleDateString(language, dateFormatOptions)}
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
      <Table>
        <TableBody>
          <TableRow>
            <TitleTableCell />
            <ValueTableCell className={classes.textAlignRight}>
              <Button primary={true} label="Copy to clipboard" onClick={onCopy} />
            </ValueTableCell>
          </TableRow>
        </TableBody>
      </Table>
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
)(withStyles(styles)(WalletInfo));

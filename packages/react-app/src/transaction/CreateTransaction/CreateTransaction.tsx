import { convert, toBaseUnits } from '@emeraldplatform/core';
import { Units, Wei } from '@emeraldplatform/eth';
import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { blockchainByName, BlockchainCode, Blockchains, IAccount, workflow } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import {
  addressBook,
  addresses,
  blockchains,
  ledger,
  screen,
  settings,
  tokens
} from '@emeraldwallet/store';
import { CreateTx, SignTx } from '@emeraldwallet/ui';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { connect } from 'react-redux';
import { traceValidate, txFeeFiat } from './util';

type CreateEthereumTx = workflow.CreateEthereumTx;
const { TxTarget } = workflow;

enum PAGES {
  TX = 1,
  SIGN = 2
}

const DEFAULT_GAS_LIMIT = '21000';

interface ICreateTxProps {
  useLedger: boolean;
  currency: string;
  tokenSymbols: string[];
  txFeeSymbol: string;
  addressBookAddresses: string[];
  ownAddresses: string[];
  accountAddress: string;
  data: any;
  from: any;
  to: any;
  value: any;
  amount: any;
  mode: string;
  typedData: any;
  token: any;
  gasPrice: any;
  gasLimit: any;
  selectedFromAccount: any;
  balance: any;
  getTxFeeFiatForGasLimit: (gas: number) => string;
  getFiatForAddress: (address: string, token: any) => any;
  getBalanceForAddress: (address: string, token: any) => any;
  onCancel?: () => void;
  onEmptyAddressBookClick?: any;
  allTokens?: any;
  fiatRate?: any;
  signAndSend: (args: {transaction: CreateEthereumTx, password: any, data: any, token: any}) => void;
}

interface ICreateTxState {
  hash?: string;
  transaction: any;
  password?: string;
  page: PAGES;
  token: any;
  data?: any;
  typedData?: any;
  amount?: any;
}

interface IOwnProps {
  account: IAccount;
  gasLimit: any;
  amount: any;
  data: any;
  typedData: any;
}

class CreateTransaction extends React.Component<ICreateTxProps, ICreateTxState> {

  get balance () {
    return this.props.getBalanceForAddress(this.transaction.from!, this.state.token);
  }

  get transaction (): CreateEthereumTx {
    return workflow.CreateEthereumTx.fromPlain(this.state.transaction);
  }

  set transaction (tx) {
    this.setState({ transaction: tx.dump() });
  }

  public static txFromProps (props: ICreateTxProps) {
    const tx = new workflow.CreateEthereumTx();
    tx.from = props.selectedFromAccount;
    tx.totalBalance = props.balance || props.getBalanceForAddress(tx.from!, props.token);
    tx.gasPrice = props.gasPrice;
    tx.amount = props.amount;
    tx.gas = new BigNumber(props.gasLimit || DEFAULT_GAS_LIMIT);
    return tx;
  }
  constructor (props: ICreateTxProps) {
    super(props);
    this.onChangeFrom = this.onChangeFrom.bind(this);
    this.onChangeTo = this.onChangeTo.bind(this);
    this.onChangeToken = this.onChangeToken.bind(this);
    this.onChangeGasLimit = this.onChangeGasLimit.bind(this);
    this.onSubmitCreateTransaction = this.onSubmitCreateTransaction.bind(this);
    this.onSubmitSignTxForm = this.onSubmitSignTxForm.bind(this);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.getPage = this.getPage.bind(this);
    this.onMaxClicked = this.onMaxClicked.bind(this);
    const tx = CreateTransaction.txFromProps(props);
    this.state = {
      transaction: tx.dump(),
      page: props.mode ? PAGES.SIGN : PAGES.TX,
      token: props.token
    };
  }

  public onChangeFrom = (from: string) => {
    const tx = this.transaction;
    if (typeof from === 'undefined') {
      tx.setFrom(null, Wei.ZERO);
      this.transaction = tx;
      return;
    }
    const balance = this.props.getBalanceForAddress(from, this.state.token);
    tx.setFrom(from, balance);
    this.transaction = tx;
  }

  public onChangeTo = (to: string) => {
    const tx = this.transaction;
    tx.to = to;
    this.transaction = tx;
  }

  public onChangeToken = (token: any) => {
    this.setState({ token });
  }

  public onChangePassword = (password: string) => {
    this.setState({ password });
  }

  public onChangeGasLimit = (value: string) => {
    const tx = this.transaction;
    tx.gas = new BigNumber(value || DEFAULT_GAS_LIMIT);
    this.transaction = tx;
  }

  /**
   * @param amount Wei class
   */
  public onChangeAmount = (amount: any) => {
    // TODO check if Wei instance
    if (typeof amount !== 'object') {
      return;
    }
    const tx = this.transaction;
    tx.amount = amount;
    tx.target = TxTarget.MANUAL;
    this.transaction = tx;
  }

  public componentDidUpdate (prevProps: ICreateTxProps) {
    const {
      from, to, value, data
    } = prevProps;
    const props = this.props;
    if (from !== props.from || to !== props.to || value !== props.value || data !== props.data) {
      this.setState({
        page: props.mode ? PAGES.SIGN : PAGES.TX,
        token: this.props.tokenSymbols[0],
        data: this.props.data,
        typedData: this.props.typedData,
        transaction: CreateTransaction.txFromProps(this.props).dump()
      });
    }
  }

  public componentDidMount () {
    this.setState({
      amount: this.props.amount,
      data: this.props.data,
      typedData: this.props.typedData,
      token: this.props.token,
      transaction: CreateTransaction.txFromProps(this.props).dump()
    });
  }

  public onSubmitCreateTransaction = () => {
    this.setState({
      page: PAGES.SIGN
    });
  }

  public onSubmitSignTxForm = () => {
    this.props.signAndSend({
      transaction: this.transaction,
      password: this.state.password,
      data: this.state.data,
      token: this.state.token
    });
  }

  public onMaxClicked () {
    const tx = this.transaction;
    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();
    this.transaction = tx;
  }

  public getPage () {
    if (!this.state.transaction.from) { return null; }
    const tx = this.transaction;
    switch (this.state.page) {
      case PAGES.TX:
        return (
          <CreateTx
            tx={tx}
            txFeeToken={this.props.txFeeSymbol}
            token={this.state.token}
            txFeeFiat={this.props.getTxFeeFiatForGasLimit(tx.gas.toNumber())}
            fiatBalance={this.props.getFiatForAddress(tx.from!, this.state.token)}
            currency={this.props.currency}
            tokenSymbols={this.props.tokenSymbols}
            addressBookAddresses={this.props.addressBookAddresses}
            ownAddresses={this.props.ownAddresses}
            onChangeFrom={this.onChangeFrom}
            onChangeToken={this.onChangeToken}
            onChangeGasLimit={this.onChangeGasLimit}
            onChangeAmount={this.onChangeAmount}
            onChangeTo={this.onChangeTo}
            onSubmit={this.onSubmitCreateTransaction}
            onCancel={this.props.onCancel}
            onEmptyAddressBookClick={this.props.onEmptyAddressBookClick}
            onMaxClicked={this.onMaxClicked}
          />
        );
      case PAGES.SIGN:
        return (
          <SignTx
            fiatRate={this.props.fiatRate}
            tx={tx}
            onChangePassword={this.onChangePassword}
            useLedger={this.props.useLedger}
            typedData={this.state.typedData}
            onSubmit={this.onSubmitSignTxForm}
            mode={this.props.mode}
            onCancel={this.props.onCancel}
          />
        );
      default: return null;
    }
  }

  public render () {
    return (
      <Page title='Create Transaction' leftIcon={<Back onClick={this.props.onCancel}/>}>
        {this.getPage()}
      </Page>
    );
  }
}

function signAndSendToken (dispatch: any, ownProps: IOwnProps, args: any) {
  const {
    transaction, password, token
  } = args;
  const chain = ownProps.account.blockchain;
  const tokenInfo = registry.bySymbol(chain, token);
  const tokenUnits = toBaseUnits(convert.toBigNumber(transaction.amount), tokenInfo.decimals || 18);

  const txData = tokens.actions.createTokenTxData(
    transaction.to,
    tokenUnits,
    true
  );
  return dispatch(
    addresses.actions.sendTransaction(
      chain,
      transaction.from,
      password,
      tokenInfo.address,
      transaction.gas,
      transaction.gasPrice,
      Wei.ZERO,
      txData
    )
  );
}

function signAndSendEther (dispatch: any, ownProps: IOwnProps, { transaction, password }: { transaction: CreateEthereumTx, password: string }) {
  const chain = ownProps.account.blockchain;
  const useLedger = ownProps.account.hardware || false;

  const plainTx = {
    password,
    from: transaction.from,
    to: transaction.to,
    gas: transaction.gas,
    gasPrice: transaction.gasPrice,
    value: transaction.amount
  };

  return traceValidate(chain, plainTx, dispatch, blockchains.actions.estimateGas)
    .then(() => dispatch(ledger.actions.setWatch(false)))
    .then(() => dispatch(ledger.actions.setConnected(false)))
    .then(() => ledger.actions.closeConnection())
    .then(() => (useLedger ? dispatch(screen.actions.showDialog('sign-transaction', transaction)) : null))
    .then(() => {
      return dispatch(
        addresses.actions.sendTransaction(
          chain,
          transaction.from!,
          password,
          transaction.to!,
          transaction.gas.toNumber(),
          transaction.gasPrice,
          transaction.amount,
          ''
        )
      );
    });
}

function signAndSend (dispatch: any, ownProps: IOwnProps, args: any) {
  const chain = ownProps.account.blockchain;
  const { coinTicker } = Blockchains[chain].params;
  const token = args.token.toUpperCase();
  if (token !== coinTicker) {
    return signAndSendToken(dispatch, ownProps, args);
  }
  return signAndSendEther(dispatch, ownProps, args);
}

export default connect(
  (state: any, ownProps: IOwnProps) => {
    const { account } = ownProps;
    const chain = account.blockchain;
    const blockchain = blockchainByName(chain);
    const txFeeSymbol = blockchain.params.coinTicker;
    const allTokens = registry.tokens[chain as BlockchainCode]
      .concat([{ address: '', symbol: txFeeSymbol, name: txFeeSymbol }])
      .reverse();
    const gasPrice = blockchains.selectors.gasPrice(state, chain);
    const fiatRate = state.wallet.settings.get('localeRate');

    return {
      amount: ownProps.amount || Wei.ZERO,
      gasLimit: ownProps.gasLimit || DEFAULT_GAS_LIMIT,
      typedData: ownProps.typedData,
      token: blockchain.params.coinTicker,
      txFeeSymbol,
      data: ownProps.data,
      selectedFromAccount: account.id,
      getBalanceForAddress: (address: string, token: any) => {
        // TODO: handle token for ERC20 case
        return addresses.selectors.find(state, address, chain)!.balance;
      },
      getFiatForAddress: (address: string, token: any) => {
        if (token !== txFeeSymbol) {
          return '??';
        }
        const selectedAccount = addresses.selectors.find(state, address, chain);
        const newBalance = selectedAccount!.balance;
        return newBalance.getFiat(fiatRate).toString();
      },
      getTxFeeFiatForGasLimit: (gasLimit: number) => txFeeFiat(gasPrice, gasLimit, fiatRate),
      currency: settings.selectors.fiatCurrency(state),
      gasPrice,
      tokenSymbols: allTokens.map((i: any) => i.symbol),
      addressBookAddresses: addressBook.selectors.all(state).map((i) => i.address),
      ownAddresses: addresses.selectors.allByBlockchain(state, blockchain.params.code).toJS().map((i: any) => i.id),
      useLedger: account.hardware || false,
      ledgerConnected: state.ledger.get('connected'),
      allTokens
    };
  },

  (dispatch, ownProps: IOwnProps) => ({
    onCancel: () => dispatch(screen.actions.gotoScreen('home', ownProps.account)),
    onEmptyAddressBookClick: () => dispatch(screen.actions.gotoScreen('add-address')),
    signAndSend: (args: any) => signAndSend(dispatch, ownProps, args)
  })
)(CreateTransaction);

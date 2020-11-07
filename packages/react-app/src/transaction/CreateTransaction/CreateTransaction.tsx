import { convert, toBaseUnits } from '@emeraldplatform/core';
import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import {
  BlockchainCode,
  Blockchains,
  workflow,
  blockchainIdToCode, AnyCoinCode, tokenAmount, CurrencyAmount, amountFactory
} from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import {
  accounts,
  addressBook,
  blockchains,
  hwkey,
  screen,
  settings,
  tokens,
  transaction,
  IState
} from '@emeraldwallet/store';
import {BigNumber} from 'bignumber.js';
import * as React from 'react';
import {connect} from 'react-redux';
import ChainTitle from '../../common/ChainTitle';
import CreateTx from '../CreateTx';
import SignTx from '../SignTx';
import {traceValidate, txFeeFiat} from './util';
import {WalletEntry} from "@emeraldpay/emerald-vault-core";
import {Wei} from '@emeraldpay/bigamount-crypto';
import {BigAmount, Formatter, FormatterBuilder} from "@emeraldpay/bigamount";

type CreateEthereumTx = workflow.CreateEthereumTx;
type CreateERC20Tx = workflow.CreateERC20Tx;

const {TxTarget} = workflow;

enum PAGES {
  TX = 1,
  SIGN = 2
}

const DEFAULT_GAS_LIMIT = '21000';
const DEFAULT_ERC20_GAS_LIMIT = '40000';

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
  sourceEntry: WalletEntry;
  gasLimit?: any;
  amount?: any;
  data?: any;
  typedData?: any;
}

function isToken(tx: CreateERC20Tx | CreateEthereumTx): tx is CreateERC20Tx {
  let coin = tx.getTokenSymbol().toLowerCase();
  return coin == "dai" || coin == "usdt";
}

class CreateTransaction extends React.Component<IOwnProps & Props & IDispatchFromProps, ICreateTxState> {

  get balance() {
    if (isToken(this.transaction)) {
      return this.props.getTokenBalanceForAddress(this.transaction.from!, this.state.token);
    } else {
      return this.props.getBalance();
    }
  }

  get transaction(): CreateEthereumTx | CreateERC20Tx {
    const currentChain = Blockchains[this.props.chain];
    if (currentChain.params.coinTicker !== this.state.token) {
      return workflow.CreateERC20Tx.fromPlain(this.state.transaction);
    }
    return workflow.CreateEthereumTx.fromPlain(this.state.transaction);
  }

  set transaction (tx) {
    this.setState({ transaction: tx.dump() });
  }

  public static txFromProps(props: IOwnProps & Props & IDispatchFromProps) {
    const tx = new workflow.CreateEthereumTx();
    tx.from = props.selectedFromAddress;
    tx.setTotalBalance(props.getBalance());
    tx.gasPrice = props.gasPrice;
    tx.amount = props.amount;
    tx.gas = new BigNumber(props.gasLimit || DEFAULT_GAS_LIMIT);
    return tx;
  }

  constructor(props: IOwnProps & Props & IDispatchFromProps) {
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
      return;
    }
    if (isToken(tx)) {
      const balance = this.props.getTokenBalanceForAddress(from, this.state.token);
      tx.setTotalBalance(balance);
    } else {
      const balance = this.props.getBalance();
      tx.setTotalBalance(balance);
    }
    this.transaction = tx;
  }

  public onChangeTo = (to: string) => {
    const tx = this.transaction;
    tx.to = to;
    this.transaction = tx;
  }

  public onChangeToken = (tokenSymbol: any) => {
    const {getBalance} = this.props;
    this.setState({ token: tokenSymbol });

    const currentChain = Blockchains[this.props.chain];
    const tx = this.restoreTx(tokenSymbol);

    if (isToken(tx)) {
      const tokenInfo = registry.bySymbol(this.props.chain, tokenSymbol);
      if (tokenInfo) {
        // Adjust Gas Limit
        tx.gas = BigNumber.max(tx.gas, new BigNumber(DEFAULT_ERC20_GAS_LIMIT));
        tx.totalEtherBalance = getBalance();
        tx.setAmount(tokenAmount(9, tokenInfo.symbol));
      }
      const balance = this.props.getTokenBalanceForAddress(tx.from!, tokenSymbol);
      tx.setTotalBalance(balance);
    } else {
      // Gas for ordinary transaction
      tx.gas = BigNumber.max(tx.gas, new BigNumber(DEFAULT_GAS_LIMIT));
      tx.setAmount(Wei.ZERO);
      const balance = this.props.getBalance();
      tx.setTotalBalance(balance);
    }
    this.transaction = tx;
  }

  public onChangePassword = (password: string) => {
    this.setState({password});
  }

  public onChangeGasLimit = (value: string) => {
    const tx = this.transaction;
    tx.gas = new BigNumber(value || DEFAULT_GAS_LIMIT);
    this.transaction = tx;
  }

  public onChangeAmount = (amount: BigAmount) => {
    if (!BigAmount.is(amount)) {
      console.warn("Not a BigAmount", amount);
    }
    const tx = this.transaction;
    if (isToken(tx)) {
      tx.setAmount(amount, tx.tokenSymbol);
    } else if (Wei.is(amount)) {
      tx.setAmount(amount)
    } else {
      console.log("Invalid amount type", amount.toString())
    }
    tx.target = TxTarget.MANUAL;
    this.transaction = tx;
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
    if (!this.state.transaction.from) {
      return null;
    }
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
    const { chain } = this.props;
    return (
      <Page
        title={<ChainTitle chain={chain} text={'Create Transaction'} />}
        leftIcon={<Back onClick={this.props.onCancel}/>}
      >
        {this.getPage()}
      </Page>
    );
  }

  private restoreTx (tokenSymbol: any) {
    const currentChain = Blockchains[this.props.chain];
    if (currentChain.params.coinTicker !== tokenSymbol) {
      return workflow.CreateERC20Tx.fromPlain(this.state.transaction);
    }
    return workflow.CreateEthereumTx.fromPlain(this.state.transaction);
  }
}

function signTokenTx (dispatch: any, ownProps: IOwnProps, args: any) {
  const {
    password, token
  } = args;
  const accountId = ownProps.sourceEntry.id;
  const chain = blockchainIdToCode(ownProps.sourceEntry.blockchain);
  const tokenInfo = registry.bySymbol(chain, token);
  const tokenUnits = toBaseUnits(convert.toBigNumber(args.transaction.amount), tokenInfo.decimals);

  const txData = tokens.actions.createTokenTxData(
    args.transaction.to,
    tokenUnits,
    true
  );
  return dispatch(
    transaction.actions.signTransaction(
      accountId,
      chain,
      args.transaction.from,
      password,
      tokenInfo.address,
      args.transaction.gas,
      args.transaction.gasPrice,
      Wei.ZERO,
      txData
    )
  );
}

function signEtherTx (
  dispatch: any, ownProps: IOwnProps, request: { transaction: CreateEthereumTx, password: string }
  ) {
  const entryId = ownProps.sourceEntry.id;
  const blockchainCode = blockchainIdToCode(ownProps.sourceEntry.blockchain);
  const useLedger = false; // TODO
  const plainTx = {
    password: request.password,
    from: request.transaction.from,
    to: request.transaction.to,
    gas: request.transaction.gas,
    gasPrice: request.transaction.gasPrice,
    value: request.transaction.amount
  };

  return traceValidate(blockchainCode, plainTx, dispatch, transaction.actions.estimateGas)
    .then(() => dispatch(hwkey.actions.setWatch(false)))
    .then(() => (useLedger ? dispatch(screen.actions.showDialog('sign-transaction', request.transaction)) : null))
    .then(() => {
      return dispatch(
        transaction.actions.signTransaction(
          entryId,
          blockchainCode,
          request.transaction.from!,
          request.password,
          request.transaction.to!,
          request.transaction.gas.toNumber(),
          request.transaction.gasPrice,
          request.transaction.amount,
          ''
        )
      );
    });
}

function sign (dispatch: any, ownProps: IOwnProps, args: any) {
  const blockchain = Blockchains[blockchainIdToCode(ownProps.sourceEntry.blockchain)];
  const {coinTicker} = blockchain.params;
  const token = args.token.toUpperCase();
  if (token !== coinTicker) {
    return signTokenTx(dispatch, ownProps, args);
  }
  return signEtherTx(dispatch, ownProps, args);
}

interface IDispatchFromProps {
  signAndSend: (args: {transaction: CreateEthereumTx | CreateERC20Tx, password: any, data: any, token: any}) => void;
  onCancel: () => void;
  onEmptyAddressBookClick: () => void;
}

interface Props {
  chain: BlockchainCode;
  useLedger: boolean;
  currency: string;
  tokenSymbols: string[];
  txFeeSymbol: string;
  addressBookAddresses: string[];
  ownAddresses: string[];
  data: any;
  from?: any;
  to?: any;
  value?: any;
  amount: any;
  mode?: string;
  typedData: any;
  token: any;
  gasPrice: any;
  gasLimit: any;
  selectedFromAddress: string;
  getTxFeeFiatForGasLimit: (gas: number) => string;
  getFiatForAddress: (address: string, token: AnyCoinCode) => string;
  getBalance: () => Wei;
  getTokenBalanceForAddress: (address: string, token: AnyCoinCode) => BigAmount;
  onCancel?: () => void;
  onEmptyAddressBookClick?: () => void;
  allTokens?: any;
  fiatRate?: any;
}

const fiatFormatter = new FormatterBuilder()
  .useTopUnit()
  .number(2)
  .build()

export default connect(
  (state: IState, ownProps: IOwnProps): Props => {
    const {sourceEntry} = ownProps;
    const blockchain = Blockchains[blockchainIdToCode(sourceEntry.blockchain)];
    const txFeeSymbol = blockchain.params.coinTicker;
    const allTokens = registry.tokens[blockchain.params.code]
      .concat([{address: '', symbol: txFeeSymbol, decimals: blockchain.params.decimals}])
      .reverse();
    const gasPrice = blockchains.selectors.gasPrice(state, blockchain.params.code);
    const fiatRate = settings.selectors.fiatRate(blockchain.params.code, state);
    const zero = amountFactory(blockchain.params.code)(0);

    return {
      chain: blockchain.params.code,
      amount: ownProps.amount || Wei.ZERO,
      gasLimit: ownProps.gasLimit || DEFAULT_GAS_LIMIT,
      typedData: ownProps.typedData,
      token: blockchain.params.coinTicker,
      txFeeSymbol,
      data: ownProps.data,
      selectedFromAddress: sourceEntry.address!.value, //TODO not for bitcoin
      getTokenBalanceForAddress: (address: string, token: AnyCoinCode): BigAmount => {
        const tokenInfo = registry.bySymbol(blockchain.params.code, token);
        const tokenBalance = tokens.selectors.selectBalance(state, tokenInfo.address, address, blockchain.params.code)
          || tokenAmount(0, token);
        return tokenBalance;
        // if (blockchain.params.coinTicker !== token) {
        // }
      },
      getBalance: (): Wei => {
        return new Wei(accounts.selectors.getBalance(state, sourceEntry.id, zero)!.number);
      },
      getFiatForAddress: (address: string, token: AnyCoinCode): string => {
        if (token !== txFeeSymbol) {
          return '??';
        }
        const newBalance = accounts.selectors.getBalance(state, sourceEntry.id, zero)!;
        const rate = settings.selectors.fiatRate(token, state) || 0;
        const fiat = new CurrencyAmount(
          newBalance.getNumberByUnit(newBalance.units.top).multipliedBy(rate),
          settings.selectors.fiatCurrency(state)
        )
        return fiatFormatter.format(fiat);
      },
      getTxFeeFiatForGasLimit: (gasLimit: number) => {
        const price = blockchains.selectors.gasPrice(state, blockchain.params.code);
        return txFeeFiat(price.number.toFixed(), gasLimit, fiatRate);
      },
      currency: settings.selectors.fiatCurrency(state),
      gasPrice,
      tokenSymbols: allTokens.map((i: any) => i.symbol),
      addressBookAddresses: addressBook.selectors.all(state).map((i: any) => i.address),
      ownAddresses: accounts.selectors.allEntriesByBlockchain(state, blockchain.params.code)
        .map((a: WalletEntry) => a.address!.value),
      useLedger: false, // TODO
      allTokens
    };
  },

  (dispatch: any, ownProps: IOwnProps): IDispatchFromProps => ({
    onCancel: () => dispatch(screen.actions.gotoScreen(screen.Pages.HOME, ownProps.sourceEntry)),
    onEmptyAddressBookClick: () => dispatch(screen.actions.gotoScreen('add-address')),
    signAndSend: (args: any) => {
      sign(dispatch, ownProps, args)
        .then((result: any) => {
          if (result) {
            dispatch(screen.actions.gotoScreen(screen.Pages.BROADCAST_TX, result));
          }
        });
    }
  })
)(CreateTransaction);

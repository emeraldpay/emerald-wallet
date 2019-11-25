import { convert, toBaseUnits } from '@emeraldplatform/core';
import { Units as EthUnits, Wei } from '@emeraldplatform/eth';
import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { blockchainByName, BlockchainCode, Blockchains, IAccount, IUnits, Units, workflow } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import {
  addressBook,
  addresses,
  blockchains,
  ledger,
  screen,
  settings,
  tokens,
  transaction
} from '@emeraldwallet/store';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { connect } from 'react-redux';
import ChainTitle from '../../common/ChainTitle';
import CreateTx from '../CreateTx';
import SignTx from '../SignTx';
import { traceValidate, txFeeFiat } from './util';

type CreateEthereumTx = workflow.CreateEthereumTx;
type CreateERC20Tx = workflow.CreateERC20Tx;

const { TxTarget } = workflow;

enum PAGES {
  TX = 1,
  SIGN = 2
}

const DEFAULT_GAS_LIMIT = '21000';
const DEFAULT_ERC20_GAS_LIMIT = '40000';

interface ICreateTxProps {
  chain: BlockchainCode;
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
  getTxFeeFiatForGasLimit: (gas: number) => string;
  getFiatForAddress: (address: string, token: any) => any;
  getBalanceForAddress: (address: string, token: any) => IUnits;
  onCancel?: () => void;
  onEmptyAddressBookClick?: any;
  allTokens?: any;
  fiatRate?: any;
  signAndSend: (args: {transaction: CreateEthereumTx | CreateERC20Tx, password: any, data: any, token: any}) => void;
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

  get transaction (): CreateEthereumTx | CreateERC20Tx {
    const currentChain = Blockchains[this.props.chain];
    if (currentChain.params.coinTicker !== this.state.token) {
      return workflow.CreateERC20Tx.fromPlain(this.state.transaction);
    }
    return workflow.CreateEthereumTx.fromPlain(this.state.transaction);
  }

  set transaction (tx) {
    this.setState({ transaction: tx.dump() });
  }

  public static txFromProps (props: ICreateTxProps) {
    const tx = new workflow.CreateEthereumTx();
    tx.from = props.selectedFromAccount;
    tx.setTotalBalance(props.getBalanceForAddress(tx.from!, props.token));
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
      return;
    }
    const balance = this.props.getBalanceForAddress(from, this.state.token);
    tx.setTotalBalance(balance);
    this.transaction = tx;
  }

  public onChangeTo = (to: string) => {
    const tx = this.transaction;
    tx.to = to;
    this.transaction = tx;
  }

  public onChangeToken = (tokenSymbol: any) => {
    const { getBalanceForAddress } = this.props;
    this.setState({ token: tokenSymbol });

    const currentChain = Blockchains[this.props.chain];
    const tx = this.restoreTx(tokenSymbol);

    if (currentChain.params.coinTicker !== tokenSymbol) {
      const tokenInfo = registry.bySymbol(this.props.chain, tokenSymbol);
      if (tokenInfo) {
        // Adjust Gas Limit
        tx.gas = BigNumber.max(tx.gas, new BigNumber(DEFAULT_ERC20_GAS_LIMIT));
        (tx as CreateERC20Tx).totalEtherBalance =
          new Wei(getBalanceForAddress(tx.from!, currentChain.params.coinTicker).amount, EthUnits.WEI);
        tx.setAmount(new Units(0, tokenInfo.decimals), tokenInfo.symbol);
      }
    } else {
      // Gas for ordinary transaction
      tx.gas = BigNumber.max(tx.gas, new BigNumber(DEFAULT_GAS_LIMIT));
      tx.setAmount(new Units(0, 18));
    }
    const balance = this.props.getBalanceForAddress(tx.from!, tokenSymbol);
    tx.setTotalBalance(balance);
    this.transaction = tx;
  }

  public onChangePassword = (password: string) => {
    this.setState({ password });
  }

  public onChangeGasLimit = (value: string) => {
    const tx = this.transaction;
    tx.gas = new BigNumber(value || DEFAULT_GAS_LIMIT);
    this.transaction = tx;
  }

  public onChangeAmount = (amount: IUnits) => {
    // TODO check if Wei instance
    if (typeof amount !== 'object') {
      return;
    }
    const tx = this.transaction;
    tx.setAmount(amount, tx.getTokenSymbol());
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
  const chain = ownProps.account.blockchain;
  const tokenInfo = registry.bySymbol(chain, token);
  const tokenUnits = toBaseUnits(convert.toBigNumber(args.transaction.amount), tokenInfo.decimals);

  const txData = tokens.actions.createTokenTxData(
    args.transaction.to,
    tokenUnits,
    true
  );
  return dispatch(
    transaction.actions.signTransaction(
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
  dispatch: any, ownProps: IOwnProps, request: { transaction: CreateEthereumTx, password: string }) {
  const chain = ownProps.account.blockchain;
  const useLedger = ownProps.account.hardware || false;
  const plainTx = {
    password: request.password,
    from: request.transaction.from,
    to: request.transaction.to,
    gas: request.transaction.gas,
    gasPrice: request.transaction.gasPrice,
    value: request.transaction.amount
  };

  return traceValidate(chain, plainTx, dispatch, transaction.actions.estimateGas)
    .then(() => dispatch(ledger.actions.setWatch(false)))
    .then(() => dispatch(ledger.actions.setConnected(false)))
    .then(() => (useLedger ? dispatch(screen.actions.showDialog('sign-transaction', request.transaction)) : null))
    .then(() => {
      return dispatch(
        transaction.actions.signTransaction(
          chain,
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
  const chain = ownProps.account.blockchain;
  const { coinTicker } = Blockchains[chain].params;
  const token = args.token.toUpperCase();
  if (token !== coinTicker) {
    return signTokenTx(dispatch, ownProps, args);
  }
  return signEtherTx(dispatch, ownProps, args);
}

export default connect(
  (state: any, ownProps: IOwnProps) => {
    const { account } = ownProps;
    const chain = account.blockchain;
    const blockchain = blockchainByName(chain);
    const txFeeSymbol = blockchain.params.coinTicker;
    const allTokens = registry.tokens[chain as BlockchainCode]
      .concat([{ address: '', symbol: txFeeSymbol, decimals: blockchain.params.decimals }])
      .reverse();
    const gasPrice = blockchains.selectors.gasPrice(state, chain);
    const fiatRate = settings.selectors.fiatRate(chain, state);

    return {
      chain,
      amount: ownProps.amount || Wei.ZERO,
      gasLimit: ownProps.gasLimit || DEFAULT_GAS_LIMIT,
      typedData: ownProps.typedData,
      token: blockchain.params.coinTicker,
      txFeeSymbol,
      data: ownProps.data,
      selectedFromAccount: account.id,
      getBalanceForAddress: (address: string, token: any): IUnits => {
        if (blockchain.params.coinTicker !== token) {
          const tokenInfo = registry.bySymbol(chain, token);
          const tokenBalance = tokens.selectors.selectBalance(state, tokenInfo.address, address, chain);
          return new Units(tokenBalance.unitsValue, tokenBalance.decimals);
        }
        const etherBalance = addresses.selectors.find(state, address, chain)!.balance;
        return new Units(etherBalance.toString(EthUnits.WEI), 18);
      },
      getFiatForAddress: (address: string, token: any): string => {
        if (token !== txFeeSymbol) {
          return '??';
        }
        const selectedAccount = addresses.selectors.find(state, address, chain);
        const newBalance = selectedAccount!.balance;
        return newBalance.getFiat(fiatRate);
      },
      getTxFeeFiatForGasLimit: (gasLimit: number) => {
        const price = blockchains.selectors.gasPrice(state, chain);
        return txFeeFiat(price.value.toString(), gasLimit, fiatRate);
      },
      currency: settings.selectors.fiatCurrency(state),
      gasPrice,
      tokenSymbols: allTokens.map((i: any) => i.symbol),
      addressBookAddresses: addressBook.selectors.all(state).map((i: any) => i.address),
      ownAddresses: addresses.selectors.allByBlockchain(state, blockchain.params.code).toJS().map((i: any) => i.id),
      useLedger: account.hardware || false,
      ledgerConnected: state.ledger.get('connected'),
      allTokens
    };
  },

  (dispatch, ownProps: IOwnProps) => ({
    onCancel: () => dispatch(screen.actions.gotoScreen(screen.Pages.HOME, ownProps.account)),
    onEmptyAddressBookClick: () => dispatch(screen.actions.gotoScreen('add-address')),
    signAndSend: (args: any) => {
      sign(dispatch, ownProps, args)
        .then((result: any) => {
          dispatch(screen.actions.gotoScreen('broadcast-tx', result));
        });
    }
  })
)(CreateTransaction);

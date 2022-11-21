import { BigAmount, FormatterBuilder, Unit } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  AnyCoinCode,
  BlockchainCode,
  Blockchains,
  CurrencyAmount,
  EthereumTransactionType,
  amountDecoder,
  amountFactory,
  blockchainIdToCode,
  formatAmount,
  isAnyTokenCode,
  isCoinTickerCode,
  toBaseUnits,
  toBigNumber,
  tokenAmount,
  tokenUnits,
  workflow,
} from '@emeraldwallet/core';
import { TokenInfo, registry } from '@emeraldwallet/erc20';
import {
  DEFAULT_FEE,
  DefaultFee,
  FEE_KEYS,
  GasPrices,
  IState,
  SignData,
  accounts,
  application,
  hwkey,
  screen,
  settings,
  tokens,
  transaction,
} from '@emeraldwallet/store';
import { Back, Page } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { traceValidate } from './util';
import { EmeraldDialogs } from '../../app/screen/Dialog';
import ChainTitle from '../../common/ChainTitle';
import CreateTx from '../CreateTx';
import SignTx from '../SignTx';

const DEFAULT_GAS_LIMIT = 21000 as const;
const DEFAULT_ERC20_GAS_LIMIT = 40000 as const;

enum PAGES {
  TX = 1,
  SIGN = 2,
}

type CreateEthereumTx = workflow.CreateEthereumTx;
type CreateERC20Tx = workflow.CreateERC20Tx;

type AnyTransaction = CreateEthereumTx | CreateERC20Tx;

type Request = {
  entryId: string;
  password?: string;
  token: AnyCoinCode;
  transaction: AnyTransaction;
};

interface OwnProps {
  amount?: any;
  data?: any;
  gasLimit?: any;
  sourceEntry: WalletEntry;
  typedData?: any;
}

interface CreateTxState {
  amount?: any;
  data?: any;
  hash?: string;
  page: PAGES;
  password?: string;
  passwordError?: string;
  token: any;
  transaction: any;
  typedData?: any;
  highGasPrice: GasPrices;
  lowGasPrice: GasPrices;
  stdGasPrice: GasPrices;
}

interface DispatchFromProps {
  checkGlobalKey: (password: string) => Promise<boolean>;
  onCancel: () => void;
  signAndSend: (request: Request) => void;
  getFees(blockchain: BlockchainCode, defaultFee: DefaultFee): Promise<Record<typeof FEE_KEYS[number], GasPrices>>;
}

interface Props {
  allTokens?: any;
  amount: any;
  blockchain: BlockchainCode;
  currency: string;
  data: any;
  defaultFee: DefaultFee;
  eip1559: boolean;
  fiatRate?: any;
  from?: any;
  gasLimit: any;
  mode?: string;
  ownAddresses: string[];
  selectedFromAddress: string;
  to?: any;
  token: any;
  tokenSymbols: string[];
  txFeeSymbol: string;
  typedData: any;
  useLedger: boolean;
  value?: any;
  getBalance: (address: string) => WeiAny;
  getBalancesByAddress: (address: string) => string[];
  getEntryByAddress: (address: string) => WalletEntry | undefined;
  getFiatForAddress: (address: string, token: AnyCoinCode) => string;
  getTokenBalanceForAddress: (address: string, token: AnyCoinCode) => BigAmount;
}

function isToken(tx: AnyTransaction): tx is CreateERC20Tx {
  return isAnyTokenCode(tx.getTokenSymbol().toUpperCase());
}

const { TxTarget } = workflow;

class CreateTransaction extends React.Component<OwnProps & Props & DispatchFromProps, CreateTxState> {
  constructor(props: OwnProps & Props & DispatchFromProps) {
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
    this.onSetMaxGasPrice = this.onSetMaxGasPrice.bind(this);
    this.onSetPriorityGasPrice = this.onSetPriorityGasPrice.bind(this);
    const tx = CreateTransaction.txFromProps(props);
    this.state = {
      highGasPrice: DEFAULT_FEE,
      lowGasPrice: DEFAULT_FEE,
      stdGasPrice: DEFAULT_FEE,
      page: props.mode ? PAGES.SIGN : PAGES.TX,
      token: props.token,
      transaction: tx.dump(),
    };
  }

  get balance() {
    if (isToken(this.transaction)) {
      return this.props.getTokenBalanceForAddress(this.transaction.from!, this.state.token);
    } else {
      return this.props.getBalance(this.transaction.from!);
    }
  }

  get transaction(): AnyTransaction {
    const { blockchain } = this.props;
    const {
      token,
      transaction: { tokenSymbol: transactionToken },
    } = this.state;

    const decoder: (value: string) => WeiAny = amountDecoder(blockchain);
    const factory = amountFactory(blockchain);

    let { amount } = this.state.transaction;

    // The user may switch from one asset to another. i.e., initially he entered an amount for ETH then switched the
    // token to USDT. Which also suppose to switch to different decimals (18 -> 6) but keep the same human-readable
    // value (i.e. entered 123.45 ETH which should became 123.45 USDT)

    // here we have a ERC20 to transfer
    if (Blockchains[blockchain].params.coinTicker !== token) {
      // and asset has changed
      if (token !== transactionToken) {
        amount = new BigAmount(decoder(amount).toEther().valueOf(), tokenUnits(token)).encode();
      }

      return workflow.CreateERC20Tx.fromPlain({ ...this.state.transaction, amount, tokenSymbol: token });
    }

    // here we have a native ETH, but switched from ERC20
    if (token !== transactionToken && !isCoinTickerCode(transactionToken)) {
      const units = tokenUnits(transactionToken);

      amount = factory(BigAmount.decode(amount, units).getNumberByUnit(units.top)).encode();
    }

    return workflow.CreateEthereumTx.fromPlain({ ...this.state.transaction, amount });
  }

  set transaction(tx) {
    this.setState({ transaction: tx.dump() });
  }

  public static txFromProps(props: OwnProps & Props & DispatchFromProps) {
    const zeroAmount = amountFactory(props.blockchain)(0) as WeiAny;

    const tx = new workflow.CreateEthereumTx(
      null,
      props.blockchain,
      props.eip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
    );

    tx.amount = props.amount;
    tx.from = props.selectedFromAddress;
    tx.gas = props.gasLimit ?? DEFAULT_GAS_LIMIT;
    tx.maxGasPrice = zeroAmount;
    tx.priorityGasPrice = zeroAmount;
    tx.setTotalBalance(props.getBalance(props.selectedFromAddress));

    return tx;
  }

  public onChangeFrom = (from: string): void => {
    if (from == null) {
      return;
    }

    const tx = this.transaction;

    if (isToken(tx)) {
      const balance = this.props.getTokenBalanceForAddress(from, this.state.token);

      tx.setTotalBalance(balance);
    } else {
      const balance = this.props.getBalance(from);

      tx.setTotalBalance(balance);
    }

    tx.from = from;
    tx.rebalance();

    this.transaction = tx;
  };

  public onChangeTo = (to: string | undefined) => {
    const tx = this.transaction;
    tx.to = to ?? undefined;
    this.transaction = tx;
  };

  public onChangeToken = (tokenSymbol: any) => {
    const { getBalance } = this.props;
    this.setState({ token: tokenSymbol });

    const tx = this.restoreTx(tokenSymbol);

    if (isToken(tx)) {
      const tokenInfo = registry.byTokenSymbol(this.props.blockchain, tokenSymbol);
      if (tokenInfo) {
        // Adjust Gas Limit
        tx.gas = Math.max(tx.gas, DEFAULT_ERC20_GAS_LIMIT);
        tx.totalBalance = getBalance(tx.from!);
        tx.setAmount(tokenAmount(0, tokenInfo.symbol), tokenSymbol);
      }
      const balance = this.props.getTokenBalanceForAddress(tx.from!, tokenSymbol);
      tx.setTotalBalance(balance);
    } else {
      // Gas for ordinary transaction
      tx.gas = Math.max(tx.gas, DEFAULT_GAS_LIMIT);
      tx.setAmount(amountFactory(this.props.blockchain)(0) as WeiAny);
      const balance = this.props.getBalance(tx.from!);
      tx.setTotalBalance(balance);
    }
    this.transaction = tx;
  };

  public onChangePassword = (password: string) => {
    this.setState({ password });
  };

  public onChangeGasLimit = (value: string) => {
    const tx = this.transaction;
    tx.gas = parseInt(value);
    this.transaction = tx;
  };

  public onChangeAmount = (amount: BigAmount) => {
    const tx = this.transaction;

    if (isToken(tx)) {
      tx.setAmount(amount, tx.tokenSymbol);
    } else if (BigAmount.is(amount)) {
      tx.setAmount(amount as WeiAny);
    } else {
      console.log('Invalid amount type', amount);
    }

    tx.target = TxTarget.MANUAL;

    this.transaction = tx;
  };

  public async componentDidMount() {
    const fees = await this.props.getFees(this.props.blockchain, this.props.defaultFee);

    const factory = amountFactory(this.props.blockchain);

    const { avgLast, avgMiddle, avgTail5 } = fees;
    const tx = this.transaction;

    if (this.props.eip1559) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = factory(avgTail5.max) as WeiAny;
      tx.priorityGasPrice = factory(avgTail5.priority) as WeiAny;
    } else {
      tx.gasPrice = factory(avgTail5.max) as WeiAny;
      tx.maxGasPrice = undefined;
      tx.priorityGasPrice = undefined;
    }

    tx.rebalance();

    this.transaction = tx;

    this.setState({
      highGasPrice: avgMiddle,
      lowGasPrice: avgLast,
      stdGasPrice: avgTail5,
      amount: this.props.amount,
      data: this.props.data,
      token: this.props.token,
      transaction: tx.dump(),
      typedData: this.props.typedData,
    });
  }

  public onSubmitCreateTransaction = () => {
    this.setState({
      page: PAGES.SIGN,
    });
  };

  public onSubmitSignTxForm = async () => {
    this.setState({ passwordError: undefined });

    if (this.transaction.from == null) {
      return;
    }

    const correctPassword = await this.props.checkGlobalKey(this.state.password ?? '');

    if (correctPassword) {
      const entry = this.props.getEntryByAddress(this.transaction.from);

      if (entry == null || !isEthereumEntry(entry)) {
        return;
      }

      this.props.signAndSend({
        entryId: entry.id,
        password: this.state.password,
        transaction: this.transaction,
        token: this.state.token,
      });
    } else {
      this.setState({ passwordError: 'Incorrect password' });
    }
  };

  public onMaxClicked() {
    const tx = this.transaction;
    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();
    this.transaction = tx;
  }

  public onSetMaxGasPrice(price: number, unit: Unit) {
    const tx = this.transaction;

    const factory = amountFactory(tx.blockchain);
    const gasPrice = BigAmount.createFor(price, factory(0).units, factory, unit);

    if (this.props.eip1559) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = gasPrice as WeiAny;
    } else {
      tx.gasPrice = gasPrice as WeiAny;
      tx.maxGasPrice = undefined;
    }

    tx.rebalance();

    this.transaction = tx;
  }

  public onSetPriorityGasPrice(price: number, unit: Unit) {
    const tx = this.transaction;

    const factory = amountFactory(tx.blockchain);
    const gasPrice = BigAmount.createFor(price, factory(0).units, factory, unit);

    tx.priorityGasPrice = gasPrice as WeiAny;
    tx.rebalance();

    this.transaction = tx;
  }

  public getPage() {
    if (!this.state.transaction.from) {
      return null;
    }
    const tx = this.transaction;
    switch (this.state.page) {
      case PAGES.TX:
        return (
          <CreateTx
            chain={this.props.blockchain}
            eip1559={this.props.eip1559}
            highGasPrice={this.state.highGasPrice}
            lowGasPrice={this.state.lowGasPrice}
            stdGasPrice={this.state.stdGasPrice}
            tx={tx}
            txFeeToken={this.props.txFeeSymbol}
            token={this.state.token}
            fiatBalance={this.props.getFiatForAddress(tx.from!, this.state.token)}
            currency={this.props.currency}
            tokenSymbols={this.props.tokenSymbols}
            ownAddresses={this.props.ownAddresses}
            onChangeFrom={this.onChangeFrom}
            onChangeToken={this.onChangeToken}
            onChangeGasLimit={this.onChangeGasLimit}
            onChangeAmount={this.onChangeAmount}
            onChangeTo={this.onChangeTo}
            onSubmit={this.onSubmitCreateTransaction}
            onCancel={this.props.onCancel}
            onMaxClicked={this.onMaxClicked}
            onSetMaxGasPrice={this.onSetMaxGasPrice}
            onSetPriorityGasPrice={this.onSetPriorityGasPrice}
            getBalance={this.props.getBalance}
            getBalancesByAddress={this.props.getBalancesByAddress}
            getTokenBalanceForAddress={this.props.getTokenBalanceForAddress}
          />
        );
      case PAGES.SIGN:
        return (
          <SignTx
            passwordError={this.state.passwordError}
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
      default:
        return null;
    }
  }

  public render() {
    const { blockchain } = this.props;
    return (
      <Page
        title={<ChainTitle chain={blockchain} text={'Create Transaction'} />}
        leftIcon={<Back onClick={this.props.onCancel} />}
      >
        {this.getPage()}
      </Page>
    );
  }

  private restoreTx(tokenSymbol: any) {
    const currentChain = Blockchains[this.props.blockchain];
    const zeroAmount = amountFactory(this.props.blockchain)(0) as WeiAny;

    if (currentChain.params.coinTicker !== tokenSymbol) {
      return workflow.CreateERC20Tx.fromPlain({
        ...this.state.transaction,
        tokenSymbol,
        amount: new BigAmount(0, tokenUnits(tokenSymbol)).encode(),
        totalEtherBalance: undefined,
        totalTokenBalance: undefined,
      });
    }

    return workflow.CreateEthereumTx.fromPlain({
      ...this.state.transaction,
      amount: zeroAmount.encode(),
      totalEtherBalance: undefined,
      totalTokenBalance: undefined,
    });
  }
}

function signTokenTx(
  dispatch: any,
  ownProps: OwnProps,
  { entryId, password, token, transaction: tx }: Request,
): Promise<SignData | null> {
  if (password == null || tx.to == null || tx.from == null) {
    console.warn('Invalid tx', tx.to, tx.from);

    return Promise.resolve(null);
  }

  const blockchainCode = blockchainIdToCode(ownProps.sourceEntry.blockchain);

  const tokenInfo = registry.byTokenSymbol(blockchainCode, token);

  if (tokenInfo == null) {
    return Promise.resolve(null);
  }

  const tokenUnits = toBaseUnits(toBigNumber(tx.amount.number), tokenInfo.decimals);
  const zeroAmount = amountFactory(blockchainCode)(0) as WeiAny;

  const txData = tokens.actions.createTokenTxData(tx.to, tokenUnits, true);

  return dispatch(
    transaction.actions.signTransaction(
      entryId,
      blockchainCode,
      tx.from,
      password,
      tokenInfo.address,
      tx.gas,
      zeroAmount,
      txData,
      tx.type,
      tx.gasPrice,
      tx.maxGasPrice,
      tx.priorityGasPrice,
    ),
  );
}

function signEtherTx(
  dispatch: any,
  ownProps: OwnProps,
  { entryId, password, transaction: tx }: Request,
): Promise<SignData | null> {
  if (tx.to == null || tx.from == null || !BigAmount.is(tx.amount)) {
    console.warn('Invalid tx', tx.to, tx.from, tx.amount);

    return Promise.resolve(null);
  }

  const blockchainCode = blockchainIdToCode(ownProps.sourceEntry.blockchain);

  const plainTx = {
    from: tx.from,
    gas: tx.gas,
    to: tx.to,
    value: tx.amount,
  };

  const validated = traceValidate(blockchainCode, plainTx, dispatch, transaction.actions.estimateGas);

  let prepared: Promise<any>;

  if (password == null) {
    prepared = validated
      .then(() => dispatch(hwkey.actions.setWatch(false)))
      .then(() => dispatch(screen.actions.showDialog(EmeraldDialogs.SIGN_TX)));
  } else {
    prepared = validated;
  }

  return prepared.then(() =>
    dispatch(
      transaction.actions.signTransaction(
        entryId,
        blockchainCode,
        plainTx.from,
        password ?? '',
        plainTx.to,
        tx.gas,
        plainTx.value,
        '',
        tx.type,
        tx.gasPrice,
        tx.maxGasPrice,
        tx.priorityGasPrice,
      ),
    ),
  );
}

function sign(dispatch: any, ownProps: OwnProps, request: Request): Promise<SignData | null> {
  const blockchain = Blockchains[blockchainIdToCode(ownProps.sourceEntry.blockchain)];
  const token = request.token.toUpperCase();
  const { coinTicker } = blockchain.params;

  if (token === coinTicker) {
    return signEtherTx(dispatch, ownProps, request);
  }

  return signTokenTx(dispatch, ownProps, request);
}

const fiatFormatter = new FormatterBuilder().useTopUnit().number(2).build();

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const { sourceEntry } = ownProps;

    const blockchainCode = blockchainIdToCode(sourceEntry.blockchain);
    const blockchain = Blockchains[blockchainCode];
    const txFeeSymbol = blockchain.params.coinTicker;
    const zero = amountFactory(blockchain.params.code)(0) as WeiAny;

    const allTokens: TokenInfo[] = [
      {
        address: '',
        decimals: blockchain.params.decimals,
        symbol: txFeeSymbol,
      },
      ...(registry.byBlockchain(blockchain.params.code) ?? []),
    ];

    const getEntryByAddress = (address: string): WalletEntry | undefined =>
      accounts.selectors.findAccountByAddress(state, address, blockchainCode);

    return {
      allTokens,
      getEntryByAddress,
      amount: ownProps.amount ?? zero,
      blockchain: blockchain.params.code,
      currency: settings.selectors.fiatCurrency(state),
      data: ownProps.data,
      defaultFee: application.selectors.getDefaultFee(state, blockchainCode),
      eip1559: blockchain.params.eip1559 ?? false,
      gasLimit: ownProps.gasLimit ?? DEFAULT_GAS_LIMIT,
      ownAddresses:
        accounts.selectors
          .findWalletByEntryId(state, sourceEntry.id)
          ?.entries.filter((entry) => !entry.receiveDisabled)
          .reduce<Array<string>>(
            (carry, entry) =>
              entry.blockchain === sourceEntry.blockchain && entry.address != null
                ? [...carry, entry.address.value]
                : carry,
            [],
          ) ?? [],
      selectedFromAddress: sourceEntry.address!.value,
      token: blockchain.params.coinTicker,
      tokenSymbols: allTokens.map((i) => i.symbol),
      txFeeSymbol,
      typedData: ownProps.typedData,
      useLedger: false, // TODO
      getBalance: (address: string): WeiAny => {
        const entry = getEntryByAddress(address);

        if (entry == null || !isEthereumEntry(entry)) {
          return zero as WeiAny;
        }

        return accounts.selectors.getBalance(state, entry.id, zero);
      },
      getBalancesByAddress(address) {
        const entry = getEntryByAddress(address);

        if (entry == null || !isEthereumEntry(entry)) {
          return [];
        }

        const balance = accounts.selectors.getBalance(state, entry.id, zero) ?? zero;
        const tokensBalances = tokens.selectors.selectBalances(state, blockchainCode, address) ?? [];

        return [balance, ...tokensBalances].map(formatAmount);
      },
      getFiatForAddress: (address: string, token: AnyCoinCode): string => {
        if (token !== txFeeSymbol) {
          return '??';
        }

        const entry = getEntryByAddress(address);

        if (entry == null || !isEthereumEntry(entry)) {
          return fiatFormatter.format(zero);
        }

        const newBalance = accounts.selectors.getBalance(state, entry.id, zero)!;
        const rate = settings.selectors.fiatRate(token, state) ?? 0;
        const fiat = CurrencyAmount.create(
          newBalance.getNumberByUnit(newBalance.units.top).multipliedBy(rate).toNumber(),
          settings.selectors.fiatCurrency(state),
        );

        return fiatFormatter.format(fiat);
      },
      getTokenBalanceForAddress: (address: string, token: AnyCoinCode): BigAmount => {
        const zero = tokenAmount(0, token);

        const tokenInfo = registry.byTokenSymbol(blockchain.params.code, token);

        if (tokenInfo == null) {
          return zero;
        }

        return tokens.selectors.selectBalance(state, blockchain.params.code, address, tokenInfo.address) ?? zero;
      },
    };
  },
  (dispatch: any, ownProps: OwnProps): DispatchFromProps => ({
    getFees: (blockchain, defaultFee) => {
      return dispatch(transaction.actions.getFee(blockchain, defaultFee));
    },
    onCancel: () => {
      dispatch(screen.actions.goBack());
    },
    signAndSend: (request) => {
      sign(dispatch, ownProps, request).then((signed) => {
        if (signed != null) {
          dispatch(
            screen.actions.gotoScreen(
              screen.Pages.BROADCAST_TX,
              {
                ...signed,
                fee: request.transaction.getFees(),
                originalAmount: request.transaction.amount,
              },
              null,
              true,
            ),
          );
        }
      });
    },
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(CreateTransaction);

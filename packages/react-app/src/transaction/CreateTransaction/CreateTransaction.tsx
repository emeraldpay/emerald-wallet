import { BigAmount, FormatterBuilder, Unit } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  CurrencyAmount,
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_LIMIT_ERC20,
  EthereumTransaction,
  EthereumTransactionType,
  TokenData,
  TokenRegistry,
  amountDecoder,
  amountFactory,
  blockchainIdToCode,
  formatAmount,
  workflow,
} from '@emeraldwallet/core';
import { TxDetailsPlain } from '@emeraldwallet/core/lib/workflow';
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
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { connect } from 'react-redux';
import ChainTitle from '../../common/ChainTitle';
import CreateTx from '../CreateTx';
import SignTx from '../SignTransaction';

enum PAGES {
  TX = 1,
  SIGN = 2,
}

type CreateEthereumTx = workflow.CreateEthereumTx;
type CreateERC20Tx = workflow.CreateERC20Tx;

type AnyTransaction = CreateEthereumTx | CreateERC20Tx;

type BaseToken = Pick<TokenData, 'address' | 'decimals' | 'symbol'>;

type Request = {
  entryId: string;
  password?: string;
  token: string;
  transaction: AnyTransaction;
};

interface OwnProps {
  amount?: any;
  data?: any;
  gasLimit?: any;
  sourceEntry: WalletEntry;
}

interface CreateTxState {
  amount?: any;
  data?: any;
  hash?: string;
  page: PAGES;
  password?: string;
  passwordError?: string;
  token: string;
  transaction: TxDetailsPlain;
  initializing: boolean;
  highGasPrice: GasPrices;
  lowGasPrice: GasPrices;
  stdGasPrice: GasPrices;
}

interface DispatchFromProps {
  checkGlobalKey(password: string): Promise<boolean>;
  estimateGas(tx: EthereumTransaction): Promise<number>;
  getFees(blockchain: BlockchainCode, defaultFee: DefaultFee): Promise<Record<(typeof FEE_KEYS)[number], GasPrices>>;
  onCancel(): void;
  signAndSend(tokenRegistry: TokenRegistry, request: Request): void;
}

interface Props {
  allTokens?: BaseToken[];
  amount: any;
  blockchain: BlockchainCode;
  currency: string;
  data: any;
  defaultFee: DefaultFee;
  eip1559: boolean;
  fiatRate?: any;
  from?: any;
  gasLimit: any;
  ownAddresses: string[];
  selectedFromAddress?: string;
  to?: any;
  token: any;
  tokenRegistry: TokenRegistry;
  tokenSymbols: string[];
  txFeeSymbol: string;
  value?: any;
  getBalance(address: string): WeiAny;
  getBalancesByAddress(address: string): string[];
  getEntryByAddress(address: string): WalletEntry | undefined;
  getFiatBalance(token: string, address?: string): string | null;
  getTokenBalance(token: string, address?: string): BigAmount;
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
      initializing: true,
      highGasPrice: DEFAULT_FEE,
      lowGasPrice: DEFAULT_FEE,
      stdGasPrice: DEFAULT_FEE,
      amount: props.amount,
      data: props.data,
      page: PAGES.TX,
      token: props.token,
      transaction: tx.dump(),
    };
  }

  get balance() {
    const tx = this.transaction;

    if (this.isToken(tx)) {
      return this.props.getTokenBalance(this.state.token, tx.from);
    }

    return this.props.getBalance(tx.from!);
  }

  get transaction(): AnyTransaction {
    const { blockchain, tokenRegistry } = this.props;
    const { token, transaction } = this.state;

    if (Blockchains[blockchain].params.coinTicker === token) {
      return workflow.CreateEthereumTx.fromPlain(transaction);
    }

    return workflow.CreateERC20Tx.fromPlain(tokenRegistry, { ...transaction, tokenSymbol: token });
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
    tx.setTotalBalance(props.selectedFromAddress == null ? zeroAmount : props.getBalance(props.selectedFromAddress));

    return tx;
  }

  isToken(tx: AnyTransaction): tx is CreateERC20Tx {
    return this.props.tokenRegistry.hasSymbol(tx.blockchain, tx.getTokenSymbol());
  }

  public onChangeFrom = (from: string): void => {
    if (from == null) {
      return;
    }

    const tx = this.transaction;

    if (this.isToken(tx)) {
      const balance = this.props.getTokenBalance(this.state.token, from);

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
    const { blockchain, tokenRegistry, getBalance, getTokenBalance } = this.props;
    const { token, transaction } = this.state;

    const { coinTicker } = Blockchains[blockchain].params;

    let amount: BigNumber;

    if (token === coinTicker) {
      ({ number: amount } = amountDecoder(blockchain)(transaction.amount));
    } else {
      const tokenData = tokenRegistry.bySymbol(blockchain, token);

      ({ number: amount } = BigAmount.decode(transaction.amount, tokenData.getUnits()));
    }

    let tx: workflow.CreateERC20Tx | workflow.CreateEthereumTx;

    if (tokenSymbol === coinTicker) {
      tx = workflow.CreateEthereumTx.fromPlain({
        ...transaction,
        amount: amountFactory(blockchain)(amount).encode(),
        gas: Math.max(transaction.gas, DEFAULT_GAS_LIMIT),
        totalEtherBalance: undefined,
        totalTokenBalance: undefined,
      });

      tx.setTotalBalance(getBalance(tx.from!));
    } else {
      const tokenData = tokenRegistry.bySymbol(blockchain, tokenSymbol);

      tx = workflow.CreateERC20Tx.fromPlain(tokenRegistry, {
        ...transaction,
        tokenSymbol,
        amount: tokenData.getAmount(amount).encode(),
        gas: Math.max(transaction.gas, DEFAULT_GAS_LIMIT_ERC20),
        totalEtherBalance: undefined,
        totalTokenBalance: undefined,
      });

      tx.totalBalance = getBalance(tx.from!);
      tx.setTotalBalance(getTokenBalance(tokenSymbol, tx.from));
    }

    this.transaction = tx;

    this.setState({ token: tokenSymbol });
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

    if (this.isToken(tx)) {
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
      initializing: false,
      highGasPrice: avgMiddle,
      lowGasPrice: avgLast,
      stdGasPrice: avgTail5,
      transaction: tx.dump(),
    });
  }

  public onSubmitCreateTransaction = async () => {
    const { estimateGas } = this.props;

    const tx = this.transaction;

    const gas = await estimateGas(tx.build());

    tx.gas = gas;
    tx.rebalance();

    this.transaction = tx;

    this.setState({ page: PAGES.SIGN });
  };

  public onSubmitSignTxForm = async (): Promise<void> => {
    this.setState({ passwordError: undefined });

    const tx = this.transaction;

    if (tx.from == null) {
      return;
    }

    const { tokenRegistry, checkGlobalKey, getEntryByAddress, signAndSend } = this.props;
    const { password, token } = this.state;

    if (password != null) {
      const correctPassword = await checkGlobalKey(password ?? '');

      if (!correctPassword) {
        this.setState({ passwordError: 'Incorrect password' });

        return;
      }
    }

    const entry = getEntryByAddress(tx.from);

    if (entry == null || !isEthereumEntry(entry)) {
      return;
    }

    signAndSend(tokenRegistry, {
      entryId: entry.id,
      password: password,
      transaction: tx,
      token: token,
    });
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

    const {
      blockchain,
      currency,
      eip1559,
      ownAddresses,
      tokenRegistry,
      tokenSymbols,
      txFeeSymbol,
      getBalance,
      getBalancesByAddress,
      getFiatBalance,
      getTokenBalance,
      onCancel,
    } = this.props;
    const { initializing, highGasPrice, lowGasPrice, passwordError, stdGasPrice, token } = this.state;

    const tx = this.transaction;

    switch (this.state.page) {
      case PAGES.TX:
        return (
          <CreateTx
            chain={blockchain}
            eip1559={eip1559}
            initializing={initializing}
            highGasPrice={highGasPrice}
            lowGasPrice={lowGasPrice}
            stdGasPrice={stdGasPrice}
            tx={tx}
            txFeeToken={txFeeSymbol}
            token={token}
            fiatBalance={getFiatBalance(token, tx.from)}
            currency={currency}
            tokenRegistry={tokenRegistry}
            tokenSymbols={tokenSymbols}
            ownAddresses={ownAddresses}
            onChangeFrom={this.onChangeFrom}
            onChangeToken={this.onChangeToken}
            onChangeGasLimit={this.onChangeGasLimit}
            onChangeAmount={this.onChangeAmount}
            onChangeTo={this.onChangeTo}
            onSubmit={this.onSubmitCreateTransaction}
            onCancel={onCancel}
            onMaxClicked={this.onMaxClicked}
            onSetMaxGasPrice={this.onSetMaxGasPrice}
            onSetPriorityGasPrice={this.onSetPriorityGasPrice}
            getBalance={getBalance}
            getBalancesByAddress={getBalancesByAddress}
            getTokenBalance={getTokenBalance}
          />
        );
      case PAGES.SIGN:
        return (
          <SignTx
            passwordError={passwordError}
            transaction={tx}
            onCancel={onCancel}
            onChangePassword={this.onChangePassword}
            onSubmit={this.onSubmitSignTxForm}
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
        title={<ChainTitle blockchain={blockchain} title="Create Transaction" />}
        leftIcon={<Back onClick={this.props.onCancel} />}
      >
        {this.getPage()}
      </Page>
    );
  }
}

async function sign(
  dispatch: any,
  ownProps: OwnProps,
  tokenRegistry: TokenRegistry,
  { entryId, password, transaction: tx }: Request,
): Promise<SignData | null> {
  const { from, to } = tx;

  if (to == null || from == null) {
    console.warn('Invalid tx', from, to);

    return Promise.resolve(null);
  }

  if (password == null) {
    await dispatch(hwkey.actions.setWatch(false));
    await dispatch(screen.actions.showDialog(screen.Dialogs.SIGN_TX));
  }

  return dispatch(transaction.actions.signTransaction(entryId, tx.build(), password));
}

const fiatFormatter = new FormatterBuilder().useTopUnit().number(2).build();

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const { sourceEntry } = ownProps;

    const blockchainCode = blockchainIdToCode(sourceEntry.blockchain);
    const blockchain = Blockchains[blockchainCode];
    const txFeeSymbol = blockchain.params.coinTicker;
    const zero = amountFactory(blockchain.params.code)(0) as WeiAny;

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const allTokens: BaseToken[] = [
      {
        address: '',
        decimals: blockchain.params.decimals,
        symbol: txFeeSymbol,
      },
      ...(tokenRegistry.byBlockchain(blockchain.params.code) ?? []),
    ];

    const getEntryByAddress = (address: string): WalletEntry | undefined =>
      accounts.selectors.findAccountByAddress(state, address, blockchainCode);

    const uniqueAddresses =
      accounts.selectors
        .findWalletByEntryId(state, sourceEntry.id)
        ?.entries.filter((entry) => !entry.receiveDisabled)
        .reduce<Set<string>>(
          (carry, entry) =>
            entry.blockchain === sourceEntry.blockchain && entry.address != null
              ? carry.add(entry.address.value)
              : carry,
          new Set(),
        ) ?? new Set();

    const ownAddresses = [...uniqueAddresses];

    const selectedFromAddress = sourceEntry.address?.value ?? ownAddresses[0];

    return {
      allTokens,
      ownAddresses,
      getEntryByAddress,
      selectedFromAddress,
      txFeeSymbol,
      tokenRegistry,
      amount: ownProps.amount ?? zero,
      blockchain: blockchain.params.code,
      currency: settings.selectors.fiatCurrency(state),
      data: ownProps.data,
      defaultFee: application.selectors.getDefaultFee(state, blockchainCode),
      eip1559: blockchain.params.eip1559 ?? false,
      gasLimit: ownProps.gasLimit ?? DEFAULT_GAS_LIMIT,
      token: blockchain.params.coinTicker,
      tokenSymbols: allTokens.map((i) => i.symbol),
      getBalance(address) {
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
      getFiatBalance(token, address) {
        if (address == null) {
          return null;
        }

        let balance: BigAmount;

        if (tokenRegistry.hasSymbol(blockchainCode, token)) {
          const tokenData = tokenRegistry.bySymbol(blockchainCode, token);
          const zeroAmount = tokenData.getAmount(0);

          balance = tokens.selectors.selectBalance(state, blockchainCode, address, tokenData.address) ?? zeroAmount;
        } else {
          const entry = getEntryByAddress(address);

          if (entry == null || !isEthereumEntry(entry)) {
            return null;
          }

          balance = accounts.selectors.getBalance(state, entry.id, zero);
        }

        const rate = settings.selectors.fiatRate(state, token);

        if (rate == null) {
          return null;
        }

        const fiatBalance = CurrencyAmount.create(
          balance.getNumberByUnit(balance.units.top).multipliedBy(rate).toNumber(),
          settings.selectors.fiatCurrency(state),
        );

        return fiatFormatter.format(fiatBalance);
      },
      getTokenBalance(token, address) {
        const { code: blockchainCode } = blockchain.params;

        const tokenData = tokenRegistry.bySymbol(blockchainCode, token);
        const zeroAmount = tokenData.getAmount(0);

        if (address == null) {
          return zeroAmount;
        }

        return tokens.selectors.selectBalance(state, blockchainCode, address, tokenData.address) ?? zeroAmount;
      },
    };
  },
  (dispatch: any, ownProps: OwnProps): DispatchFromProps => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    estimateGas(tx) {
      return dispatch(transaction.actions.estimateGas(blockchainIdToCode(ownProps.sourceEntry.blockchain), tx));
    },
    getFees(blockchain, defaultFee) {
      return dispatch(transaction.actions.getFee(blockchain, defaultFee));
    },
    onCancel() {
      dispatch(screen.actions.goBack());
    },
    signAndSend(tokenRegistry, request) {
      sign(dispatch, ownProps, tokenRegistry, request).then((signed) => {
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
  }),
)(CreateTransaction);

// FIXME Refactor component

import { BigAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  CurrencyAmount,
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_LIMIT_ERC20,
  EthereumAddress,
  EthereumTransaction,
  EthereumTransactionType,
  TokenAmount,
  TokenRegistry,
  amountDecoder,
  amountFactory,
  blockchainIdToCode,
  formatAmount,
  workflow,
} from '@emeraldwallet/core';
import {
  Allowance,
  DEFAULT_FEE,
  FEE_KEYS,
  GasPrices,
  IState,
  SignData,
  TokenBalanceBelong,
  accounts,
  allowances,
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

interface OwnProps {
  data?: any;
  entry: WalletEntry;
  gasLimit?: any;
  initialAllowance?: Allowance;
  initialAmount?: BigAmount;
  initialAsset?: string;
}

interface Account {
  address: string;
  asset: string;
  ownerAddress?: string;
}

interface StateProps {
  accounts: Record<string, Account>;
  asset: string;
  amount: any;
  blockchain: BlockchainCode;
  eip1559: boolean;
  fiatRate?: any;
  from?: any;
  gasLimit: any;
  selectedFromAddress?: string;
  to?: any;
  tokenRegistry: TokenRegistry;
  coinTicker: string;
  value?: any;
  isHardware: boolean;
  getBalance(address: string): WeiAny;
  getBalancesByAddress(address: string, ownerAddress: string | null): string[];
  getEntryByAddress(address: string): WalletEntry | undefined;
  getFiatBalance(asset: string, address?: string): BigAmount | undefined;
  getTokenBalance(contractAddress: string, address?: string, ownerAddress?: string): TokenAmount;
}

interface Request {
  entryId: string;
  password?: string;
  token: string;
  transaction: AnyTransaction;
}

interface DispatchProps {
  estimateGas(tx: EthereumTransaction): Promise<number>;
  getFees(blockchain: BlockchainCode): Promise<Record<(typeof FEE_KEYS)[number], GasPrices>>;
  onCancel(): void;
  signAndSend(request: Request): Promise<void>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

interface State {
  amount?: any;
  asset: string;
  data?: any;
  hash?: string;
  page: PAGES;
  password?: string;
  passwordError?: string;
  transaction: workflow.TxDetailsPlain;
  initializing: boolean;
  highGasPrice: GasPrices;
  lowGasPrice: GasPrices;
  stdGasPrice: GasPrices;
  useEip1559: boolean;
  verifying: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

const { TxTarget } = workflow;

class CreateTransaction extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.onChangeAccount = this.onChangeAccount.bind(this);
    this.onChangeTo = this.onChangeTo.bind(this);
    this.onChangeAsset = this.onChangeAsset.bind(this);
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
      asset: props.asset,
      initializing: true,
      highGasPrice: DEFAULT_FEE,
      lowGasPrice: DEFAULT_FEE,
      stdGasPrice: DEFAULT_FEE,
      amount: props.amount,
      data: props.data,
      page: PAGES.TX,
      transaction: tx.dump(),
      useEip1559: props.eip1559,
      verifying: false,
    };
  }

  get balance(): BigAmount {
    const tx = this.transaction;

    if (this.isToken(tx)) {
      return this.props.getTokenBalance(this.state.asset, tx.from);
    }

    return this.props.getBalance(tx.from!);
  }

  get transaction(): AnyTransaction {
    const { tokenRegistry } = this.props;
    const { asset, transaction } = this.state;

    if (EthereumAddress.isValid(asset)) {
      return workflow.CreateERC20Tx.fromPlain(tokenRegistry, { ...transaction, asset });
    }

    return workflow.CreateEthereumTx.fromPlain(transaction);
  }

  set transaction(tx) {
    this.setState({ transaction: tx.dump() });
  }

  public static txFromProps({
    amount,
    asset,
    blockchain,
    eip1559,
    gasLimit,
    initialAllowance,
    selectedFromAddress,
    tokenRegistry,
    getBalance,
    getTokenBalance,
  }: Props): workflow.CreateEthereumTx | workflow.CreateERC20Tx {
    const txType = eip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;

    const zeroAmount = amountFactory(blockchain)(0) as WeiAny;
    const totalBalance = selectedFromAddress == null ? zeroAmount : getBalance(selectedFromAddress);

    let tx: workflow.CreateEthereumTx | workflow.CreateERC20Tx;

    if (EthereumAddress.isValid(asset) && tokenRegistry.hasAddress(blockchain, asset)) {
      tx = new workflow.CreateERC20Tx(tokenRegistry, asset, blockchain, txType);

      tx.totalBalance = totalBalance;
      tx.transferFrom = initialAllowance?.ownerAddress;

      tx.setTotalBalance(getTokenBalance(asset, selectedFromAddress, initialAllowance?.ownerAddress));
    } else {
      tx = new workflow.CreateEthereumTx(null, blockchain, txType);

      tx.setTotalBalance(totalBalance);
    }

    tx.amount = amount;
    tx.from = selectedFromAddress;
    tx.gas = gasLimit ?? DEFAULT_GAS_LIMIT;
    tx.maxGasPrice = zeroAmount;
    tx.priorityGasPrice = zeroAmount;

    return tx;
  }

  isToken(tx: AnyTransaction): tx is CreateERC20Tx {
    return this.props.tokenRegistry.hasAddress(tx.blockchain, tx.getAsset());
  }

  public onChangeAccount = (key: string): void => {
    const {
      accounts: { [key]: account },
      getBalance,
      getTokenBalance,
    } = this.props;

    const { address, asset, ownerAddress } = account ?? {};

    if (ownerAddress == null) {
      if (address == null) {
        return;
      }

      const tx = this.transaction;

      if (this.isToken(tx)) {
        const balance = getTokenBalance(this.state.asset, address, ownerAddress);

        tx.transferFrom = undefined;

        tx.setTotalBalance(balance);
      } else {
        const balance = getBalance(address);

        tx.setTotalBalance(balance);
      }

      tx.from = address;
      tx.rebalance();

      this.transaction = tx;
    } else {
      this.onChangeAsset(asset, ownerAddress);
    }
  };

  public onChangeTo = (to: string | undefined): void => {
    const tx = this.transaction;

    tx.to = to;

    this.transaction = tx;
  };

  public onChangeAsset = (value: string, ownerAddress?: string): void => {
    const { blockchain, tokenRegistry, getBalance, getTokenBalance } = this.props;
    const { asset, transaction } = this.state;

    const { coinTicker } = Blockchains[blockchain].params;

    let amount: BigNumber;

    if (asset === coinTicker) {
      ({ number: amount } = amountDecoder(blockchain)(transaction.amount));
    } else {
      const token = tokenRegistry.byAddress(blockchain, asset);

      ({ number: amount } = BigAmount.decode(transaction.amount, token.getUnits()));
    }

    let tx: workflow.CreateERC20Tx | workflow.CreateEthereumTx;

    if (EthereumAddress.isValid(value)) {
      const token = tokenRegistry.byAddress(blockchain, value);

      tx = workflow.CreateERC20Tx.fromPlain(tokenRegistry, {
        ...transaction,
        asset: value,
        amount: token.getAmount(amount).encode(),
        gas: Math.max(transaction.gas, DEFAULT_GAS_LIMIT_ERC20),
        totalEtherBalance: undefined,
        totalTokenBalance: undefined,
        transferFrom: ownerAddress,
      });

      tx.totalBalance = getBalance(tx.from!);
      tx.setTotalBalance(getTokenBalance(value, tx.from, ownerAddress));
    } else {
      const factory = amountFactory(blockchain);

      tx = workflow.CreateEthereumTx.fromPlain({
        ...transaction,
        amount: factory(amount).encode(),
        gas: Math.max(transaction.gas, DEFAULT_GAS_LIMIT),
        totalEtherBalance: undefined,
        totalTokenBalance: undefined,
      });

      tx.setTotalBalance(tx.from == null ? (factory(0) as WeiAny) : getBalance(tx.from));
    }

    this.transaction = tx;

    this.setState({ asset: value });
  };

  public onChangePassword = (password: string): void => {
    this.setState({ password });
  };

  public onChangeGasLimit = (value: string): void => {
    const tx = this.transaction;
    tx.gas = parseInt(value);
    this.transaction = tx;
  };

  public onChangeAmount = (amount: BigAmount): void => {
    const tx = this.transaction;

    if (this.isToken(tx)) {
      tx.setAmount(amount);
    } else {
      tx.setAmount(new WeiAny(amount, amount.units));
    }

    tx.target = TxTarget.MANUAL;

    this.transaction = tx;
  };

  public onChangeUseEip1559 = (enabled: boolean, max: WeiAny, priority: WeiAny): void => {
    const tx = this.transaction;

    if (enabled) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = max;
      tx.priorityGasPrice = priority;
    } else {
      tx.gasPrice = max;
      tx.maxGasPrice = undefined;
      tx.priorityGasPrice = undefined;
    }

    tx.type = enabled ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;

    this.transaction = tx;

    this.setState({ useEip1559: enabled });
  };

  public async componentDidMount(): Promise<void> {
    const fees = await this.props.getFees(this.props.blockchain);

    const factory = amountFactory(this.props.blockchain);

    const { avgLast, avgMiddle, avgTail5 } = fees;
    const tx = this.transaction;

    if (this.state.useEip1559) {
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

  public onSubmitCreateTransaction = async (): Promise<void> => {
    const { estimateGas } = this.props;

    const tx = this.transaction;

    tx.gas = await estimateGas(tx.build());
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

    const { isHardware, getEntryByAddress, signAndSend, verifyGlobalKey } = this.props;
    const { password, asset } = this.state;

    // Password should be entered only for a standard encrypted seed, but for Ledger it's always empty.
    if (!isHardware) {
      if (password == null) {
        return;
      }

      this.setState({ verifying: true });

      const correctPassword = await verifyGlobalKey(password);

      if (!correctPassword) {
        this.setState({ passwordError: 'Incorrect password', verifying: false });

        return;
      }
    }

    const entry = getEntryByAddress(tx.from);

    if (entry == null || !isEthereumEntry(entry)) {
      return;
    }

    signAndSend({
      entryId: entry.id,
      password: password,
      transaction: tx,
      token: asset,
    }).catch((exception) => {
      console.warn('Error signing transaction', exception);

      this.setState({ verifying: false });
    });
  };

  public onMaxClicked(callback: (value: BigAmount) => void): void {
    const tx = this.transaction;

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    callback(tx.amount);

    this.transaction = tx;
  }

  public onSetMaxGasPrice(price: WeiAny): void {
    const tx = this.transaction;

    if (this.state.useEip1559) {
      tx.gasPrice = undefined;
      tx.maxGasPrice = price;
    } else {
      tx.gasPrice = price;
      tx.maxGasPrice = undefined;
    }

    tx.rebalance();

    this.transaction = tx;
  }

  public onSetPriorityGasPrice(price: WeiAny): void {
    const tx = this.transaction;

    tx.priorityGasPrice = price;
    tx.rebalance();

    this.transaction = tx;
  }

  public getPage(): React.ReactNode {
    if (!this.state.transaction.from) {
      return null;
    }

    const {
      accounts,
      blockchain,
      eip1559,
      tokenRegistry,
      coinTicker,
      initialAllowance,
      getBalance,
      getBalancesByAddress,
      getFiatBalance,
      getTokenBalance,
      onCancel,
    } = this.props;

    const { asset, initializing, highGasPrice, lowGasPrice, passwordError, stdGasPrice, useEip1559, verifying } =
      this.state;

    const tx = this.transaction;

    switch (this.state.page) {
      case PAGES.TX:
        return (
          <CreateTx
            accounts={accounts}
            asset={asset}
            chain={blockchain}
            coinTicker={coinTicker}
            eip1559={eip1559}
            fiatBalance={getFiatBalance(asset, tx.from)}
            highGasPrice={highGasPrice}
            initialAllowance={initialAllowance}
            initializing={initializing}
            lowGasPrice={lowGasPrice}
            stdGasPrice={stdGasPrice}
            tokenRegistry={tokenRegistry}
            tx={tx}
            useEip1559={useEip1559}
            getBalance={getBalance}
            getBalancesByAddress={getBalancesByAddress}
            getTokenBalance={getTokenBalance}
            onCancel={onCancel}
            onChangeAccount={this.onChangeAccount}
            onChangeAmount={this.onChangeAmount}
            onChangeAsset={this.onChangeAsset}
            onChangeGasLimit={this.onChangeGasLimit}
            onChangeTo={this.onChangeTo}
            onChangeUseEip1559={this.onChangeUseEip1559}
            onMaxClicked={this.onMaxClicked}
            onSetMaxGasPrice={this.onSetMaxGasPrice}
            onSetPriorityGasPrice={this.onSetPriorityGasPrice}
            onSubmit={this.onSubmitCreateTransaction}
          />
        );
      case PAGES.SIGN:
        return (
          <SignTx
            passwordError={passwordError}
            transaction={tx}
            verifying={verifying}
            onCancel={onCancel}
            onChangePassword={this.onChangePassword}
            onSubmit={this.onSubmitSignTxForm}
          />
        );
      default:
        return null;
    }
  }

  public render(): React.ReactNode {
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

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entry, gasLimit, initialAllowance, initialAsset }) => {
    const blockchainCode = blockchainIdToCode(entry.blockchain);
    const blockchain = Blockchains[blockchainCode];
    const coinTicker = blockchain.params.coinTicker;
    const zero = amountFactory(blockchain.params.code)(0) as WeiAny;

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const getEntryByAddress = (address: string): WalletEntry | undefined =>
      accounts.selectors.findAccountByAddress(state, address, blockchainCode);

    const entries = accounts.selectors.findWalletByEntryId(state, entry.id)?.entries ?? [];

    const accountByAddress = entries.reduce<Map<string, Account>>((carry, item) => {
      if (item.blockchain === entry.blockchain && item.address != null) {
        const { value: address } = item.address;

        carry.set(address, { address: address, asset: coinTicker });

        const addressAllowances = allowances.selectors
          .getEntryAllowances(state, item)
          .filter(({ spenderAddress }) => spenderAddress === address);

        addressAllowances.forEach(({ allowance: { token }, ownerAddress, spenderAddress }) =>
          carry.set(`${spenderAddress}:${ownerAddress}`, {
            ownerAddress,
            address: spenderAddress,
            asset: token.address,
          }),
        );
      }

      return carry;
    }, new Map());

    let amount: BigAmount = zero;
    let asset = initialAsset ?? initialAllowance?.token.address ?? blockchain.params.coinTicker;

    if (EthereumAddress.isValid(asset) && tokenRegistry.hasAddress(blockchainCode, asset)) {
      amount = tokenRegistry.byAddress(blockchainCode, asset).getAmount(0);
    } else if (asset !== blockchain.params.coinTicker) {
      asset = blockchain.params.coinTicker;
    }

    const isHardware = accounts.selectors.isHardwareEntry(state, entry) ?? false;

    return {
      amount,
      asset,
      coinTicker,
      isHardware,
      tokenRegistry,
      getEntryByAddress,
      accounts: Object.fromEntries(accountByAddress.entries()),
      blockchain: blockchain.params.code,
      eip1559: blockchain.params.eip1559 ?? false,
      gasLimit: gasLimit ?? DEFAULT_GAS_LIMIT,
      selectedFromAddress: entry.address?.value,
      getBalance(address) {
        const entry = getEntryByAddress(address);

        if (entry == null || !isEthereumEntry(entry)) {
          return zero as WeiAny;
        }

        return accounts.selectors.getBalance(state, entry.id, zero);
      },
      getBalancesByAddress(address, ownerAddress) {
        let balance: WeiAny | undefined;

        if (ownerAddress == null) {
          const entry = getEntryByAddress(address);

          if (entry == null || !isEthereumEntry(entry)) {
            return [];
          }

          balance = accounts.selectors.getBalance(state, entry.id, zero);
        }

        const tokenBalanceBelong = ownerAddress == null ? TokenBalanceBelong.OWN : TokenBalanceBelong.ALLOWED;

        const tokenBalances = tokens.selectors
          .selectBalances(state, blockchainCode, address, { belonging: tokenBalanceBelong })
          .filter((tokenBalance) => tokenBalance.isPositive());

        if (balance == null) {
          return tokenBalances.map((amount) => formatAmount(amount));
        }

        return [balance, ...tokenBalances].map((amount) => formatAmount(amount));
      },
      getFiatBalance(asset, address) {
        if (address == null) {
          return undefined;
        }

        let balance: BigAmount;

        if (tokenRegistry.hasAddress(blockchainCode, asset)) {
          const tokenData = tokenRegistry.byAddress(blockchainCode, asset);
          const zeroAmount = tokenData.getAmount(0);

          balance =
            tokens.selectors.selectBalance(state, blockchainCode, address, tokenData.address, {
              belonging: TokenBalanceBelong.OWN,
            }) ?? zeroAmount;
        } else {
          const entry = getEntryByAddress(address);

          if (entry == null || !isEthereumEntry(entry)) {
            return undefined;
          }

          balance = accounts.selectors.getBalance(state, entry.id, zero);
        }

        const rate = settings.selectors.fiatRate(state, balance);

        if (rate == null) {
          return undefined;
        }

        return CurrencyAmount.create(
          balance.getNumberByUnit(balance.units.top).multipliedBy(rate).toNumber(),
          settings.selectors.fiatCurrency(state),
        );
      },
      getTokenBalance(contractAddress, address, ownerAddress) {
        const { code: blockchainCode } = blockchain.params;

        const tokenData = tokenRegistry.byAddress(blockchainCode, contractAddress);
        const zeroAmount = tokenData.getAmount(0);

        if (address == null) {
          return zeroAmount;
        }

        return (
          tokens.selectors.selectBalance(state, blockchainCode, address, tokenData.address, {
            belonging: ownerAddress == null ? TokenBalanceBelong.OWN : TokenBalanceBelong.ALLOWED,
            belongsTo: ownerAddress,
          }) ?? zeroAmount
        );
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    estimateGas(tx) {
      return dispatch(transaction.actions.estimateGas(blockchainIdToCode(ownProps.entry.blockchain), tx));
    },
    getFees(blockchain) {
      return dispatch(transaction.actions.getFee(blockchain));
    },
    onCancel() {
      dispatch(screen.actions.goBack());
    },
    async signAndSend(request) {
      const { entryId, password, transaction: tx } = request;
      const { from, to } = tx;

      if (to == null || from == null) {
        console.warn('Invalid tx', from, to);

        return;
      }

      const signed: SignData | null = await dispatch(
        transaction.actions.signTransaction(entryId, tx.build(), password),
      );

      if (signed == null) {
        return;
      } else {
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
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(CreateTransaction);

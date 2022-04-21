import { EstimationMode } from '@emeraldpay/api';
import { BigAmount, FormatterBuilder, Predicates } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { isEthereumEntry, WalletEntry } from '@emeraldpay/emerald-vault-core';
import {
  amountFactory,
  AnyCoinCode,
  BlockchainCode,
  blockchainIdToCode,
  Blockchains,
  CurrencyAmount,
  getStandardUnits,
  isAnyTokenCode,
  toBaseUnits,
  toBigNumber,
  tokenAmount,
  workflow,
} from '@emeraldwallet/core';
import { tokenUnits } from '@emeraldwallet/core/lib/blockchains/tokens';
import { registry } from '@emeraldwallet/erc20';
import { accounts, addressBook, hwkey, IState, screen, settings, tokens, transaction } from '@emeraldwallet/store';
import { Back, Page } from '@emeraldwallet/ui';
import { BigNumber } from 'bignumber.js';
import * as React from 'react';
import { connect } from 'react-redux';
import ChainTitle from '../../common/ChainTitle';
import CreateTx from '../CreateTx';
import SignTx from '../SignTx';
import { traceValidate } from './util';

type CreateEthereumTx = workflow.CreateEthereumTx;
type CreateERC20Tx = workflow.CreateERC20Tx;

const { TxTarget } = workflow;

enum PAGES {
  TX = 1,
  SIGN = 2,
}

const DEFAULT_GAS_LIMIT = '21000';
const DEFAULT_ERC20_GAS_LIMIT = '40000';

const FEE_KEYS: EstimationMode[] = ['avgLast', 'avgMiddle', 'avgTail5'];

interface CreateTxState {
  hash?: string;
  transaction: any;
  password?: string;
  page: PAGES;
  token: any;
  data?: any;
  typedData?: any;
  amount?: any;
  maximalGasPrice: string;
  minimalGasPrice: string;
  standardGasPrice: string;
  passwordError?: string;
}

interface OwnProps {
  sourceEntry: WalletEntry;
  gasLimit?: any;
  amount?: any;
  data?: any;
  typedData?: any;
}

const formatBalance = (balance: BigAmount): string => {
  const units = getStandardUnits(balance);

  const balanceFormatter = new FormatterBuilder()
    .when(Predicates.ZERO, (whenTrue, whenFalse): void => {
      whenTrue.useTopUnit();
      whenFalse.useOptimalUnit(undefined, units, 3);
    })
    .number(3, true)
    .append(' ')
    .unitCode()
    .build();

  return balanceFormatter.format(balance);
};

function isToken(tx: CreateERC20Tx | CreateEthereumTx): tx is CreateERC20Tx {
  return isAnyTokenCode(tx.getTokenSymbol().toUpperCase());
}

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
    this.onSetGasPrice = this.onSetGasPrice.bind(this);
    const tx = CreateTransaction.txFromProps(props);
    this.state = {
      maximalGasPrice: '0',
      minimalGasPrice: '0',
      standardGasPrice: '0',
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

  get transaction(): CreateEthereumTx | CreateERC20Tx {
    const currentChain = Blockchains[this.props.chain];
    const {
      token,
      transaction: { tokenSymbol: transactionToken },
    } = this.state;
    let { amount } = this.state.transaction;

    if (currentChain.params.coinTicker !== token) {
      if (token !== transactionToken) {
        const amountValue = Wei.decode(amount).toEther().valueOf();
        amount = new BigAmount(amountValue, tokenUnits(token)).encode();
      }
      return workflow.CreateERC20Tx.fromPlain({ ...this.state.transaction, amount, tokenSymbol: token });
    }

    if (token !== transactionToken && transactionToken != 'ETH') {
      const amountValue = BigAmount.decode(amount, tokenUnits(transactionToken)).number.toNumber();
      amount = new Wei(amountValue, 'ETHER').encode();
    }

    return workflow.CreateEthereumTx.fromPlain({ ...this.state.transaction, amount });
  }

  set transaction(tx) {
    this.setState({ transaction: tx.dump() });
  }

  public static txFromProps(props: OwnProps & Props & DispatchFromProps) {
    const tx = new workflow.CreateEthereumTx();
    tx.from = props.selectedFromAddress;
    tx.setTotalBalance(props.getBalance(props.selectedFromAddress));
    tx.gasPrice = new Wei(0);
    tx.amount = props.amount;
    tx.gas = new BigNumber(props.gasLimit || DEFAULT_GAS_LIMIT);
    return tx;
  }

  public onChangeFrom = (from: string): void => {
    if (from == null) {
      return;
    }

    const tx = this.transaction;

    tx.from = from;

    if (isToken(tx)) {
      const balance = this.props.getTokenBalanceForAddress(from, this.state.token);

      tx.setTotalBalance(balance);
    } else {
      const balance = this.props.getBalance(from);

      tx.setTotalBalance(balance);
    }

    this.transaction = tx;
  };

  public onChangeTo = (to: string) => {
    const tx = this.transaction;
    tx.to = to;
    this.transaction = tx;
  };

  public onChangeToken = (tokenSymbol: any) => {
    const { getBalance } = this.props;
    this.setState({ token: tokenSymbol });

    const tx = this.restoreTx(tokenSymbol);

    if (isToken(tx)) {
      const tokenInfo = registry.bySymbol(this.props.chain, tokenSymbol);
      if (tokenInfo) {
        // Adjust Gas Limit
        tx.gas = BigNumber.max(tx.gas, new BigNumber(DEFAULT_ERC20_GAS_LIMIT));
        tx.totalEtherBalance = getBalance(tx.from!);
        tx.setAmount(tokenAmount(0, tokenInfo.symbol), tokenSymbol);
      }
      const balance = this.props.getTokenBalanceForAddress(tx.from!, tokenSymbol);
      tx.setTotalBalance(balance);
    } else {
      // Gas for ordinary transaction
      tx.gas = BigNumber.max(tx.gas, new BigNumber(DEFAULT_GAS_LIMIT));
      tx.setAmount(Wei.ZERO);
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
    tx.gas = new BigNumber(value || DEFAULT_GAS_LIMIT);
    this.transaction = tx;
  };

  public onChangeAmount = (amount: BigAmount) => {
    if (!BigAmount.is(amount)) {
      console.warn('Not a BigAmount', amount);
    }
    const tx = this.transaction;
    if (isToken(tx)) {
      tx.setAmount(amount, tx.tokenSymbol);
    } else if (Wei.is(amount)) {
      tx.setAmount(amount);
    } else {
      console.log('Invalid amount type', amount.toString());
    }
    tx.target = TxTarget.MANUAL;
    this.transaction = tx;
  };

  public async componentDidMount() {
    const fees = await this.props.getFees(this.props.chain);

    const { avgMiddle } = fees;

    let { avgLast, avgTail5 } = fees;

    const tx = this.transaction;
    tx.gasPrice = new Wei(avgMiddle);
    tx.rebalance();
    this.transaction = tx;

    /**
     * For small networks with less than 5 txes in a block the Tail5 value may be larger that the Middle value.
     * Make sure the order is consistent.
     */
    if (avgTail5 > avgMiddle) {
      avgTail5 = avgMiddle;
    }

    if (avgLast > avgTail5) {
      avgLast = avgTail5;
    }

    this.setState({
      maximalGasPrice: avgMiddle,
      minimalGasPrice: avgLast,
      standardGasPrice: avgTail5,
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

    const correctPassword = await this.props.checkGlobalKey(this.state.password ?? '');

    if (correctPassword) {
      this.props.signAndSend({
        transaction: this.transaction,
        password: this.state.password,
        data: this.state.data,
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

  public onSetGasPrice(price: number) {
    const tx = this.transaction;
    tx.gasPrice = new Wei(price, 'GWei');
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
            maximalGasPrice={this.state.maximalGasPrice}
            minimalGasPrice={this.state.minimalGasPrice}
            standardGasPrice={this.state.standardGasPrice}
            tx={tx}
            txFeeToken={this.props.txFeeSymbol}
            token={this.state.token}
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
            onSetGasPrice={this.onSetGasPrice}
            getBalancesByAddress={this.props.getBalancesByAddress}
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
    const { chain } = this.props;
    return (
      <Page
        title={<ChainTitle chain={chain} text={'Create Transaction'} />}
        leftIcon={<Back onClick={this.props.onCancel} />}
      >
        {this.getPage()}
      </Page>
    );
  }

  private restoreTx(tokenSymbol: any) {
    const currentChain = Blockchains[this.props.chain];

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
      amount: Wei.ZERO.encode(),
      totalEtherBalance: undefined,
      totalTokenBalance: undefined,
    });
  }
}

function signTokenTx(dispatch: any, ownProps: OwnProps, args: any) {
  const { password, token } = args;
  const accountId = ownProps.sourceEntry.id;
  const chain = blockchainIdToCode(ownProps.sourceEntry.blockchain);
  const tokenInfo = registry.bySymbol(chain, token);
  const tokenUnits = toBaseUnits(toBigNumber(args.transaction.amount), tokenInfo.decimals);

  const txData = tokens.actions.createTokenTxData(args.transaction.to, tokenUnits, true);
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
      txData,
    ),
  );
}

function signEtherTx(dispatch: any, ownProps: OwnProps, request: { transaction: CreateEthereumTx; password: string }) {
  const entryId = ownProps.sourceEntry.id;
  const blockchainCode = blockchainIdToCode(ownProps.sourceEntry.blockchain);
  const useLedger = false; // TODO
  const plainTx = {
    password: request.password,
    from: request.transaction.from,
    to: request.transaction.to,
    gas: request.transaction.gas,
    gasPrice: request.transaction.gasPrice,
    value: request.transaction.amount,
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
          '',
        ),
      );
    });
}

function sign(dispatch: any, ownProps: OwnProps, args: any) {
  const blockchain = Blockchains[blockchainIdToCode(ownProps.sourceEntry.blockchain)];
  const { coinTicker } = blockchain.params;
  const token = args.token.toUpperCase();
  if (token !== coinTicker) {
    return signTokenTx(dispatch, ownProps, args);
  }
  return signEtherTx(dispatch, ownProps, args);
}

interface DispatchFromProps {
  getFees: (blockchain: BlockchainCode) => Promise<any>;
  onCancel: () => void;
  onEmptyAddressBookClick: () => void;
  signAndSend: (args: { transaction: CreateEthereumTx | CreateERC20Tx; password: any; data: any; token: any }) => void;
  checkGlobalKey: (password: string) => Promise<boolean>;
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
  gasLimit: any;
  selectedFromAddress: string;
  getFiatForAddress: (address: string, token: AnyCoinCode) => string;
  getBalance: (address: string) => Wei;
  getBalancesByAddress: (address: string) => string[];
  getTokenBalanceForAddress: (address: string, token: AnyCoinCode) => BigAmount;
  onCancel?: () => void;
  onEmptyAddressBookClick?: () => void;
  allTokens?: any;
  fiatRate?: any;
}

const fiatFormatter = new FormatterBuilder().useTopUnit().number(2).build();

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const { sourceEntry } = ownProps;
    const blockchainCode = blockchainIdToCode(sourceEntry.blockchain);
    const blockchain = Blockchains[blockchainCode];
    const txFeeSymbol = blockchain.params.coinTicker;
    const allTokens = registry.tokens[blockchain.params.code]
      .concat([{ address: '', symbol: txFeeSymbol, decimals: blockchain.params.decimals }])
      .reverse();
    const zero = amountFactory(blockchain.params.code)(0);

    return {
      chain: blockchain.params.code,
      amount: ownProps.amount || Wei.ZERO,
      gasLimit: ownProps.gasLimit || DEFAULT_GAS_LIMIT,
      typedData: ownProps.typedData,
      token: blockchain.params.coinTicker,
      txFeeSymbol,
      data: ownProps.data,
      selectedFromAddress: sourceEntry.address!.value,
      getTokenBalanceForAddress: (address: string, token: AnyCoinCode): BigAmount => {
        const tokenInfo = registry.bySymbol(blockchain.params.code, token);

        return (
          tokens.selectors.selectBalance(state, tokenInfo.address, address, blockchain.params.code) ??
          tokenAmount(0, token)
        );
      },
      getBalance: (address: string): Wei => {
        const entry = accounts.selectors.findAccountByAddress(state, address, blockchainCode);

        if (entry == null || !isEthereumEntry(entry)) {
          return new Wei(zero);
        }

        return new Wei(accounts.selectors.getBalance(state, entry.id, zero)!.number);
      },
      getBalancesByAddress(address) {
        const entry = accounts.selectors.findAccountByAddress(state, address, blockchainCode);

        if (entry == null || !isEthereumEntry(entry)) {
          return [];
        }

        const balance = accounts.selectors.getBalance(state, entry.id, zero) ?? zero;
        const tokensBalances = tokens.selectors.selectBalances(state, address, blockchainCode) ?? [];

        return [balance, ...tokensBalances].map(formatBalance);
      },
      getFiatForAddress: (address: string, token: AnyCoinCode): string => {
        if (token !== txFeeSymbol) {
          return '??';
        }

        const entry = accounts.selectors.findAccountByAddress(state, address, blockchainCode);

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
      currency: settings.selectors.fiatCurrency(state),
      tokenSymbols: allTokens.map((i) => i.symbol),
      addressBookAddresses: addressBook.selectors.all(state).map((i) => i.address.value),
      ownAddresses:
        accounts.selectors
          .findWalletByEntryId(state, sourceEntry.id)
          ?.entries.reduce<Array<string>>(
            (carry, entry) =>
              entry.blockchain === sourceEntry.blockchain && entry.address != null
                ? [...carry, entry.address.value]
                : carry,
            [],
          ) ?? [],
      useLedger: false, // TODO
      allTokens,
    };
  },

  (dispatch: any, ownProps: OwnProps): DispatchFromProps => ({
    getFees: async (blockchain) => {
      let results = await Promise.allSettled(
        FEE_KEYS.map((key) => dispatch(transaction.actions.estimateFee(blockchain, 128, key))),
      );

      results = await Promise.allSettled(
        results.map((result, index) =>
          result.status === 'fulfilled'
            ? Promise.resolve(result.value)
            : dispatch(transaction.actions.estimateFee(blockchain, 256, FEE_KEYS[index])),
        ),
      );

      let [avgLastNumber, avgMiddleNumber, avgTail5Number] = results.map(
        (result) => new BigNumber(result.status === 'fulfilled' ? result.value ?? 0 : 0),
      );

      if (avgTail5Number.eq(0)) {
        // TODO Set default value from remote config
        avgTail5Number = new Wei(30, 'GWei').number;
      }

      if (avgTail5Number.lt(avgLastNumber) || avgTail5Number.gt(avgMiddleNumber)) {
        [avgLastNumber, avgMiddleNumber, avgTail5Number] = [avgLastNumber, avgMiddleNumber, avgTail5Number].sort(
          (first, second) => {
            if (first.eq(second)) {
              return 0;
            }

            return first.gt(second) ? 1 : -1;
          },
        );
      }

      const avgTail5 = avgTail5Number.toNumber();

      const avgLast = avgLastNumber.gt(0)
        ? avgLastNumber.toNumber()
        : avgTail5Number.minus(avgTail5Number.multipliedBy(0.05)).toNumber();
      const avgMiddle = avgMiddleNumber.gt(0)
        ? avgMiddleNumber.toNumber()
        : avgTail5Number.plus(avgTail5Number.multipliedBy(0.05)).toNumber();

      return {
        avgLast,
        avgMiddle,
        avgTail5,
      };
    },
    onCancel: () => dispatch(screen.actions.gotoScreen(screen.Pages.HOME, ownProps.sourceEntry)),
    onEmptyAddressBookClick: () => dispatch(screen.actions.gotoScreen('add-address')),
    signAndSend: (args: any) => {
      sign(dispatch, ownProps, args).then((result: any) => {
        if (result) {
          dispatch(screen.actions.gotoScreen(screen.Pages.BROADCAST_TX, result));
        }
      });
    },
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(CreateTransaction);

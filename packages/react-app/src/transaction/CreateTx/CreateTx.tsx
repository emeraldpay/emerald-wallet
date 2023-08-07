import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, EthereumAddress, TokenRegistry, amountFactory, workflow } from '@emeraldwallet/core';
import { GasPrices } from '@emeraldwallet/store';
import { AccountSelect, Button, ButtonGroup, FormLabel, FormRow } from '@emeraldwallet/ui';
import { CircularProgress, WithStyles, createStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { AmountField } from '../../common/AmountField';
import EthTxSettings from '../../common/EthTxSettings/EthTxSettings';
import { Asset, CommonAsset, SelectAsset } from '../../common/SelectAsset';
import { ToField } from '../../common/ToField';

const { ValidationResult } = workflow;

const styles = createStyles({
  gasPriceHelp: {
    position: 'initial',
    paddingLeft: 10,
  },
  gasPriceHelpBox: {
    width: 500,
    clear: 'left',
  },
  gasPriceMarkLabel: {
    fontSize: '0.7em',
    opacity: 0.8,
  },
  gasPriceSlider: {
    width: 300,
    marginBottom: 10,
    paddingTop: 10,
  },
  gasPriceSliderBox: {
    width: 300,
    float: 'left',
  },
  gasPriceTypeBox: {
    width: 240,
    float: 'left',
    height: 40,
  },
  gasPriceValueLabel: {
    fontSize: '0.7em',
  },
  inputField: {
    flexGrow: 5,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
});

interface Account {
  address: string;
  ownerAddress?: string;
}

export interface Props extends WithStyles<typeof styles> {
  accounts: Record<string, Account>;
  asset: string;
  chain: BlockchainCode;
  coinTicker: string;
  eip1559: boolean;
  fiatBalance?: BigAmount;
  highGasPrice: GasPrices;
  initializing: boolean;
  lowGasPrice: GasPrices;
  stdGasPrice: GasPrices;
  tokenRegistry: TokenRegistry;
  tx: workflow.CreateEthereumTx | workflow.CreateERC20Tx;
  useEip1559: boolean;
  getBalance(address: string): WeiAny;
  getBalancesByAddress?(address: string, ownerAddress: string | null): string[];
  getTokenBalance(token: string, address?: string, ownerAddress?: string): BigAmount;
  onCancel?(): void;
  onChangeAccount?(key: string): void;
  onChangeAmount(amount: BigAmount): void;
  onChangeAsset?(tokenSymbol: string): void;
  onChangeGasLimit?(value: string): void;
  onChangeTo(to: string): void;
  onChangeUseEip1559(value: boolean, max: number, priority: number): void;
  onMaxClicked(callback: (value: BigAmount) => void): void;
  onSetMaxGasPrice?(value: number, unit: Unit): void;
  onSetPriorityGasPrice?(value: number, unit: Unit): void;
  onSubmit?(): void;
}

interface State {
  currentMaxGasPrice: number;
  currentPriorityGasPrice: number;
  useEip1559: boolean;
}

class CreateTx extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMaxGasPrice: 0,
      currentPriorityGasPrice: 0,
      useEip1559: props.eip1559,
    };
  }

  public componentDidUpdate({ stdGasPrice: { max: prevMax } }: Props): void {
    const {
      chain,
      stdGasPrice: { max, priority },
    } = this.props;

    if (prevMax !== max) {
      const factory = amountFactory(chain);

      const stdMaxGasPrice = factory(max);
      const stdPriorityGasPrice = factory(priority);

      const gasPriceUnit = stdMaxGasPrice.getOptimalUnit(undefined, undefined, 6);

      this.setState({
        currentMaxGasPrice: stdMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber(),
        currentPriorityGasPrice: stdPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber(),
      });
    }
  }

  public getAssetBalance = (asset: string): BigAmount => {
    const { tx, getBalance, getTokenBalance } = this.props;

    if (tx.from == null) {
      return amountFactory(tx.blockchain)(0);
    }

    if (EthereumAddress.isValid(asset)) {
      return getTokenBalance(asset, tx.from, this.isToken(tx) ? tx.transferFrom : undefined);
    }

    return getBalance(tx.from);
  };

  public render(): React.ReactNode {
    const {
      accounts,
      asset,
      chain,
      classes,
      eip1559,
      fiatBalance,
      initializing,
      highGasPrice,
      lowGasPrice,
      stdGasPrice,
      tokenRegistry,
      tx,
      coinTicker,
      getBalancesByAddress,
      onCancel,
      onChangeAmount,
      onChangeAsset,
      onChangeAccount,
      onChangeTo,
      onChangeUseEip1559,
      onMaxClicked,
      onSetMaxGasPrice,
      onSetPriorityGasPrice,
      onSubmit,
    } = this.props;

    const { currentMaxGasPrice, currentPriorityGasPrice, useEip1559 } = this.state;

    const selectedAccount = this.isToken(tx) && tx.transferFrom != null ? `${tx.from}:${tx.transferFrom}` : tx.from;

    let assets: CommonAsset[] = tokenRegistry.byBlockchain(tx.blockchain);

    if (!this.isToken(tx) || tx.transferFrom == null) {
      assets = [{ symbol: coinTicker }, ...assets];
    }

    const assetsWithBalances = assets.reduce<Asset[]>((carry, { address, symbol }) => {
      const key = address ?? symbol;
      const balance = this.getAssetBalance(key);

      if (balance.isPositive()) {
        return [...carry, { address, balance, symbol }];
      }

      return carry;
    }, []);

    const factory = amountFactory(chain);

    const highMaxGasPrice = factory(highGasPrice.max);
    const lowMaxGasPrice = factory(lowGasPrice.max);
    const stdMaxGasPrice = factory(stdGasPrice.max);

    const highPriorityGasPrice = factory(highGasPrice.priority);
    const lowPriorityGasPrice = factory(lowGasPrice.priority);
    const stdPriorityGasPrice = factory(stdGasPrice.priority);

    const unit = stdMaxGasPrice.getOptimalUnit(undefined, undefined, 6);

    const highMaxGasPriceNumber = highMaxGasPrice.getNumberByUnit(unit).toNumber();
    const lowMaxGasPriceNumber = lowMaxGasPrice.getNumberByUnit(unit).toNumber();
    const stdMaxGasPriceNumber = stdMaxGasPrice.getNumberByUnit(unit).toNumber();

    const highPriorityGasPriceNumber = highPriorityGasPrice.getNumberByUnit(unit).toNumber();
    const lowPriorityGasPriceNumber = lowPriorityGasPrice.getNumberByUnit(unit).toNumber();
    const stdPriorityGasPriceNumber = stdPriorityGasPrice.getNumberByUnit(unit).toNumber();

    return (
      <>
        <FormRow>
          <FormLabel>From</FormLabel>
          <AccountSelect
            accounts={accounts}
            disabled={initializing}
            selectedAccount={selectedAccount}
            getBalancesByAddress={getBalancesByAddress}
            onChange={onChangeAccount}
          />
        </FormRow>
        <FormRow>
          <FormLabel>Token</FormLabel>
          <SelectAsset
            asset={asset}
            assets={assetsWithBalances}
            balance={tx.getTotalBalance()}
            fiatBalance={fiatBalance}
            onChangeAsset={onChangeAsset}
          />
        </FormRow>
        <FormRow>
          <FormLabel>To</FormLabel>
          <ToField blockchain={chain} to={tx.to} onChange={onChangeTo} />
        </FormRow>
        <FormRow>
          <FormLabel>Amount</FormLabel>
          <AmountField
            amount={tx.getAmount()}
            maxDisabled={initializing}
            units={tx.getAmount().units}
            onChangeAmount={onChangeAmount}
            onMaxClick={onMaxClicked}
          />
        </FormRow>
        <EthTxSettings
          initializing={initializing}
          supportEip1559={eip1559}
          useEip1559={useEip1559}
          gasPriceUnit={unit}
          maxGasPrice={currentMaxGasPrice}
          stdMaxGasPrice={stdMaxGasPriceNumber}
          lowMaxGasPrice={lowMaxGasPriceNumber}
          highMaxGasPrice={highMaxGasPriceNumber}
          priorityGasPrice={currentPriorityGasPrice}
          stdPriorityGasPrice={stdPriorityGasPriceNumber}
          lowPriorityGasPrice={lowPriorityGasPriceNumber}
          highPriorityGasPrice={highPriorityGasPriceNumber}
          onUse1559Change={(value) => {
            this.setState({ useEip1559: value });

            onChangeUseEip1559(value, currentMaxGasPrice, currentPriorityGasPrice);
          }}
          onMaxGasPriceChange={(value) => {
            this.setState({ currentMaxGasPrice: value });

            onSetMaxGasPrice?.(value, unit);
          }}
          onPriorityGasPriceChange={(value) => {
            this.setState({ currentPriorityGasPrice: value });

            onSetPriorityGasPrice?.(value, unit);
          }}
        />
        <FormRow last>
          <FormLabel />
          <ButtonGroup classes={{ container: classes.buttons }}>
            {initializing && (
              <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
            )}
            <Button label="Cancel" onClick={onCancel} />
            <Button
              primary
              disabled={initializing || tx.validate() !== ValidationResult.OK}
              label="Create Transaction"
              onClick={onSubmit}
            />
          </ButtonGroup>
        </FormRow>
      </>
    );
  }

  private isToken(tx: workflow.CreateEthereumTx | workflow.CreateERC20Tx): tx is workflow.CreateERC20Tx {
    return this.props.tokenRegistry.hasAddress(tx.blockchain, tx.getAsset());
  }
}

export default withStyles(styles)(CreateTx);

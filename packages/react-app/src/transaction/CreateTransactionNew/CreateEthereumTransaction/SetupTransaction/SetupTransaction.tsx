import { BigAmount, CreateAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  EthereumTransactionType,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  workflow,
} from '@emeraldwallet/core';
import { CreateTxStage, FeeState, IState, txStash } from '@emeraldwallet/store';
import { Button, ButtonGroup, FormLabel, FormRow } from '@emeraldwallet/ui';
import { CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { connect } from 'react-redux';
import { EthTxSettings } from '../../../../common/EthTxSettings';
import { NumberField } from '../../../../common/NumberField';
import { ToField } from '../../../../common/ToField';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  asset: string;
  entry: EthereumEntry;
  ownerAddress?: string;
  onCancel(): void;
  getBalance(entry: EthereumEntry, asset: string, ownerAddress?: string): BigAmount;
}

interface StateProps {
  createTx: workflow.CreateTx;
  fee: FeeState<WeiAny>;
}

interface DispatchProps {
  getFee(blockchain: BlockchainCode): void;
  setStage(stage: CreateTxStage): void;
  setTransaction(transaction: workflow.TxDetailsPlain): void;
}

const SetupTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  createTx,
  fee,
  onCancel,
  getFee,
  setStage,
  setTransaction,
}) => {
  const styles = useStyles();

  const { decimals, supportEip1559 } = React.useMemo(() => {
    const { decimals, eip1559: supportEip1559 = false } = Blockchains[createTx.blockchain].params;

    return { decimals, supportEip1559 };
  }, [createTx.blockchain]);

  const weiFactory = React.useMemo(
    () => amountFactory(createTx.blockchain) as CreateAmount<WeiAny>,
    [createTx.blockchain],
  );

  const zeroAmount = React.useMemo(() => weiFactory(0), [weiFactory]);

  const [maxAmount, setMaxAmount] = React.useState<BigNumber | undefined>();

  const handleToChange = (to: string): void => {
    createTx.to = to;

    setTransaction(createTx.dump());
  };

  const handleAmountChange = (amount: BigNumber): void => {
    createTx.target = workflow.TxTarget.MANUAL;
    createTx.setAmount(amount);

    setTransaction(createTx.dump());
  };

  const handleMaxAmountClick = (): void => {
    createTx.target = workflow.TxTarget.SEND_ALL;
    createTx.rebalance();

    setTransaction(createTx.dump());

    setMaxAmount(createTx.amount.getNumberByUnit(createTx.amount.units.top));
  };

  const handleUseEip1559Change = (checked: boolean): void => {
    createTx.type = checked ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;

    setTransaction(createTx.dump());
  };

  const handleMaxGasPriceChange = (price: WeiAny): void => {
    createTx.gasPrice = price;
    createTx.maxGasPrice = price;

    setTransaction(createTx.dump());
  };

  const handlePriorityGasPriceChange = (price: WeiAny): void => {
    createTx.priorityGasPrice = price;

    setTransaction(createTx.dump());
  };

  React.useEffect(() => {
    if (createTx.target === workflow.TxTarget.SEND_ALL) {
      setMaxAmount(createTx.amount.getNumberByUnit(createTx.amount.units.top));
    } else {
      setMaxAmount(undefined);
    }
  }, [createTx]);

  React.useEffect(() => {
    getFee(createTx.blockchain);
  }, [createTx.blockchain, getFee]);

  const isEip1559 = createTx.type === EthereumTransactionType.EIP1559;
  const gasPrice = (isEip1559 ? createTx.gasPrice : createTx.maxGasPrice) ?? zeroAmount;

  return (
    <>
      <FormRow>
        <FormLabel>To</FormLabel>
        <ToField blockchain={createTx.blockchain} to={createTx.to} onChange={handleToChange} />
      </FormRow>
      <FormRow>
        <FormLabel>Amount</FormLabel>
        <NumberField
          decimals={decimals}
          initialValue={createTx.amount.getNumberByUnit(createTx.amount.units.top)}
          rightIcon={
            <Button
              disabled={fee.loading}
              label="Max"
              primary={createTx.target === workflow.TxTarget.SEND_ALL}
              size="small"
              variant="text"
              onClick={handleMaxAmountClick}
            />
          }
          value={maxAmount}
          onChange={handleAmountChange}
        />
      </FormRow>
      <EthTxSettings
        factory={weiFactory}
        initializing={fee.loading}
        supportEip1559={supportEip1559}
        useEip1559={isEip1559}
        maxGasPrice={gasPrice}
        stdMaxGasPrice={fee.range.stdMaxGasPrice}
        lowMaxGasPrice={fee.range.lowMaxGasPrice}
        highMaxGasPrice={fee.range.highMaxGasPrice}
        priorityGasPrice={createTx.priorityGasPrice ?? zeroAmount}
        stdPriorityGasPrice={fee.range.stdPriorityGasPrice}
        lowPriorityGasPrice={fee.range.lowPriorityGasPrice}
        highPriorityGasPrice={fee.range.highPriorityGasPrice}
        onUse1559Change={handleUseEip1559Change}
        onMaxGasPriceChange={handleMaxGasPriceChange}
        onPriorityGasPriceChange={handlePriorityGasPriceChange}
      />
      <FormRow last>
        <FormLabel />
        <ButtonGroup classes={{ container: styles.buttons }}>
          {fee.loading && (
            <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
          )}
          <Button label="Cancel" onClick={onCancel} />
          <Button
            primary
            disabled={fee.loading || createTx.validate() !== workflow.ValidationResult.OK}
            label="Create Transaction"
            onClick={() => setStage(CreateTxStage.SIGN)}
          />
        </ButtonGroup>
      </FormRow>
    </>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { asset, entry, ownerAddress, getBalance }) => {
    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const fee = txStash.selectors.getFee<WeiAny>(state, blockchainIdToCode(entry.blockchain));
    const transaction = txStash.selectors.getTransaction(state);

    const { createTx } = new workflow.CreateTxConverter(
      { asset, entry, ownerAddress, transaction, feeRange: fee.range },
      tokenRegistry,
      getBalance,
    );

    return { createTx, fee };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getFee(blockchain) {
      dispatch(txStash.actions.getFee(blockchain));
    },
    setStage(stage) {
      dispatch(txStash.actions.setStage(stage));
    },
    setTransaction(transaction) {
      dispatch(txStash.actions.setTransaction(transaction));
    },
  }),
)(SetupTransaction);

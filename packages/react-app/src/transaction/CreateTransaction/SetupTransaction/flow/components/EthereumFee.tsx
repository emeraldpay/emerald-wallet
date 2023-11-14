import { CreateAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { Blockchains, EthereumTransactionType, amountFactory, workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { EthTxSettings } from '../../../../../common/EthTxSettings';

interface OwnProps {
  createTx: workflow.AnyEthereumCreateTx;
  feeRange: workflow.EthereumFeeRange;
  initializing: boolean;
  setTransaction(transaction: workflow.AnyPlainTx): void;
}

export const EthereumFee: React.FC<OwnProps> = ({ createTx, feeRange, initializing, setTransaction }) => {
  const factory = React.useMemo(
    () => amountFactory(createTx.blockchain) as CreateAmount<WeiAny>,
    [createTx.blockchain],
  );

  const zeroAmount = React.useMemo(() => factory(0), [factory]);

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

  const { eip1559: supportEip1559 = false } = Blockchains[createTx.blockchain].params;

  const isEip1559 = createTx.type === EthereumTransactionType.EIP1559;
  const gasPrice = (isEip1559 ? createTx.gasPrice : createTx.maxGasPrice) ?? zeroAmount;

  return (
    <EthTxSettings
      factory={factory}
      initializing={initializing}
      supportEip1559={supportEip1559}
      useEip1559={isEip1559}
      maxGasPrice={gasPrice}
      stdMaxGasPrice={feeRange.stdMaxGasPrice}
      lowMaxGasPrice={feeRange.lowMaxGasPrice}
      highMaxGasPrice={feeRange.highMaxGasPrice}
      priorityGasPrice={createTx.priorityGasPrice ?? zeroAmount}
      stdPriorityGasPrice={feeRange.stdPriorityGasPrice}
      lowPriorityGasPrice={feeRange.lowPriorityGasPrice}
      highPriorityGasPrice={feeRange.highPriorityGasPrice}
      onUse1559Change={handleUseEip1559Change}
      onMaxGasPriceChange={handleMaxGasPriceChange}
      onPriorityGasPriceChange={handlePriorityGasPriceChange}
    />
  );
};

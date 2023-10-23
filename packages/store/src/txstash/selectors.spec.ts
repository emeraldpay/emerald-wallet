import { BlockchainCode, amountFactory } from '../../../core/lib';
import { IState } from '../types';
import { getFee } from './selectors';
import { CreateTxStage, moduleName } from './types';

describe('tx stash selectors', () => {
  it('returns zero fee if not set yet', () => {
    const state = { [moduleName]: {} } as IState;

    const fee = getFee(state, BlockchainCode.ETH);

    const zeroAmount = amountFactory(BlockchainCode.ETH)(0);

    expect(fee.loading).toBeTruthy();
    expect(fee.range.stdMaxGasPrice.equals(zeroAmount)).toBeTruthy();
    expect(fee.range.lowMaxGasPrice.equals(zeroAmount)).toBeTruthy();
    expect(fee.range.highMaxGasPrice.equals(zeroAmount)).toBeTruthy();
    expect(fee.range.stdPriorityGasPrice.equals(zeroAmount)).toBeTruthy();
    expect(fee.range.lowPriorityGasPrice.equals(zeroAmount)).toBeTruthy();
    expect(fee.range.highPriorityGasPrice.equals(zeroAmount)).toBeTruthy();
  });

  it('returns fee if value set', () => {
    const someAmount = amountFactory(BlockchainCode.ETH)(1001);
    const someNumeric = someAmount.number.toString();

    const state: Partial<IState> = {
      [moduleName]: {
        fee: {
          [BlockchainCode.ETH]: {
            range: {
              stdMaxGasPrice: someNumeric,
              lowMaxGasPrice: someNumeric,
              highMaxGasPrice: someNumeric,
              stdPriorityGasPrice: someNumeric,
              lowPriorityGasPrice: someNumeric,
              highPriorityGasPrice: someNumeric,
            },
            timestamp: Date.now(),
          },
        },
        stage: CreateTxStage.SETUP,
      },
    };

    const fee = getFee(state as IState, BlockchainCode.ETH);

    expect(fee.loading).toBeFalsy();
    expect(fee.range.stdMaxGasPrice.equals(someAmount)).toBeTruthy();
    expect(fee.range.lowMaxGasPrice.equals(someAmount)).toBeTruthy();
    expect(fee.range.highMaxGasPrice.equals(someAmount)).toBeTruthy();
    expect(fee.range.stdPriorityGasPrice.equals(someAmount)).toBeTruthy();
    expect(fee.range.lowPriorityGasPrice.equals(someAmount)).toBeTruthy();
    expect(fee.range.highPriorityGasPrice.equals(someAmount)).toBeTruthy();
  });
});

import { BlockchainCode, amountFactory, workflow } from '../../../core/lib';
import { IState } from '../types';
import { getFee } from './selectors';
import { CreateTxStage, moduleName } from './types';

describe('tx stash selectors', () => {
  it('returns zero Bitcoin fee if not set yet', () => {
    const state = { [moduleName]: {} } as IState;

    const fee = getFee(state, BlockchainCode.BTC);

    expect(fee.loading).toBeTruthy();

    if (workflow.CreateTxConverter.isBitcoinFeeRange(fee.range)) {
      expect(fee.range.std).toEqual(0);
      expect(fee.range.min).toEqual(0);
      expect(fee.range.max).toEqual(0);
    }
  });

  it('returns zero Ethereum fee if not set yet', () => {
    const state = { [moduleName]: {} } as IState;

    const fee = getFee(state, BlockchainCode.ETH);

    const zeroAmount = amountFactory(BlockchainCode.ETH)(0);

    expect(fee.loading).toBeTruthy();

    if (workflow.CreateTxConverter.isEthereumFeeRange(fee.range)) {
      expect(fee.range.stdMaxGasPrice.equals(zeroAmount)).toBeTruthy();
      expect(fee.range.lowMaxGasPrice.equals(zeroAmount)).toBeTruthy();
      expect(fee.range.highMaxGasPrice.equals(zeroAmount)).toBeTruthy();
      expect(fee.range.stdPriorityGasPrice.equals(zeroAmount)).toBeTruthy();
      expect(fee.range.lowPriorityGasPrice.equals(zeroAmount)).toBeTruthy();
      expect(fee.range.highPriorityGasPrice.equals(zeroAmount)).toBeTruthy();
    }
  });

  it('returns Bitcoin fee if value set', () => {
    const state: Partial<IState> = {
      [moduleName]: {
        fee: {
          [BlockchainCode.BTC]: {
            range: {
              std: 2048,
              min: 1024,
              max: 3096,
            },
            timestamp: Date.now(),
          },
        },
        stage: CreateTxStage.SETUP,
      },
    };

    const fee = getFee(state as IState, BlockchainCode.BTC);

    expect(fee.loading).toBeFalsy();

    if (workflow.CreateTxConverter.isBitcoinFeeRange(fee.range)) {
      expect(fee.range.std).toEqual(2048);
      expect(fee.range.min).toEqual(1024);
      expect(fee.range.max).toEqual(3096);
    }
  });

  it('returns Ethereum fee if value set', () => {
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

    if (workflow.CreateTxConverter.isEthereumFeeRange(fee.range)) {
      expect(fee.range.stdMaxGasPrice.equals(someAmount)).toBeTruthy();
      expect(fee.range.lowMaxGasPrice.equals(someAmount)).toBeTruthy();
      expect(fee.range.highMaxGasPrice.equals(someAmount)).toBeTruthy();
      expect(fee.range.stdPriorityGasPrice.equals(someAmount)).toBeTruthy();
      expect(fee.range.lowPriorityGasPrice.equals(someAmount)).toBeTruthy();
      expect(fee.range.highPriorityGasPrice.equals(someAmount)).toBeTruthy();
    }
  });
});

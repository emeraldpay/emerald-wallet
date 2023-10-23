import { BigAmount } from '@emeraldpay/bigamount';
import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { DefaultFee, FeePrices, IState, application, transaction } from '@emeraldwallet/store';
import { Button, ButtonGroup, FormLabel, FormRow } from '@emeraldwallet/ui';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Slider,
  Switch,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import validate from 'bitcoin-address-validation';
import * as React from 'react';
import { connect } from 'react-redux';
import { AmountField } from '../../../../common/AmountField';
import { ToField } from '../../../../common/ToField';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    feeHelp: {
      paddingLeft: 10,
      position: 'initial',
    },
    feeHelpBox: {
      width: 500,
      clear: 'left',
    },
    feeMarkLabel: {
      fontSize: '0.7em',
      opacity: 0.8,
    },
    feeSlider: {
      marginBottom: 10,
      paddingTop: 10,
      width: 300,
    },
    feeSliderBox: {
      float: 'left',
      width: 300,
    },
    feeTypeBox: {
      float: 'left',
      height: 40,
      width: 200,
    },
    inputField: {
      flexGrow: 5,
    },
  }),
);

interface OwnProps {
  creator: workflow.CreateBitcoinTx;
  entry: BitcoinEntry;
  onCancel(): void;
  onCreate(): void;
}

interface StateProps {
  blockchain: BlockchainCode;
  defaultFee?: DefaultFee<number>;
  feeTtl: number;
}

interface DispatchProps {
  getFee(
    blockchain: BlockchainCode,
    feeTtl: number,
    defaultFee: DefaultFee<number> | undefined,
  ): Promise<FeePrices<number>>;
}

const SetupTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchain,
  creator,
  defaultFee,
  entry,
  feeTtl,
  getFee,
  onCancel,
  onCreate,
}) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [initializing, setInitializing] = React.useState(true);

  const [to, setTo] = React.useState(creator.tx.to);
  const [amount, setAmount] = React.useState(creator.requiredAmount);

  const [useStdFee, setUseStdFee] = React.useState(true);

  const [maximalFee, setMaximalFee] = React.useState(0);
  const [minimalFee, setMinimalFee] = React.useState(0);
  const [standardFee, setStandardFee] = React.useState(0);

  const [feePrice, setFeePrice] = React.useState(0);

  const handleToChange = (value: string | undefined): void => {
    creator.toAddress = value == null || !validate(value) ? undefined : value;

    setTo(value);
  };

  const handleAmountChange = (value: BigAmount): void => {
    creator.requiredAmount = value;

    setAmount(value);
  };

  const handleMaxClick = (callback: (value: BigAmount) => void): void => {
    creator.target = workflow.TxTarget.SEND_ALL;

    callback(creator.requiredAmount);

    setAmount(creator.requiredAmount);
  };

  const handleFeePriceChange = (value: number): void => {
    creator.feePrice = value;

    setAmount(creator.requiredAmount);
    setFeePrice(value);
  };

  React.useEffect(
    () => {
      getFee(blockchain, feeTtl, defaultFee).then(({ avgLast, avgTail5, avgMiddle }) => {
        if (mounted.current) {
          setMinimalFee(avgLast);
          setStandardFee(avgTail5);
          setMaximalFee(avgMiddle);

          handleFeePriceChange(avgTail5);

          setInitializing(false);
        }
      });

      return () => {
        mounted.current = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <FormRow>
        <FormLabel>To</FormLabel>
        <ToField blockchain={blockchainIdToCode(entry.blockchain)} to={to} onChange={handleToChange} />
      </FormRow>
      <FormRow>
        <FormLabel>Amount</FormLabel>
        <AmountField
          amount={amount}
          maxDisabled={initializing}
          units={creator.requiredAmount.units}
          onChangeAmount={handleAmountChange}
          onMaxClick={handleMaxClick}
        />
      </FormRow>
      <FormRow>
        <FormLabel top>Fee</FormLabel>
        <Box className={styles.inputField}>
          <Box className={styles.feeTypeBox}>
            <FormControlLabel
              control={
                <Switch
                  checked={useStdFee}
                  disabled={initializing}
                  onChange={(event) => {
                    const checked = event.target.checked;

                    if (checked) {
                      handleFeePriceChange(standardFee);
                    }

                    setUseStdFee(checked);
                  }}
                  name="checkedB"
                  color="primary"
                />
              }
              label={useStdFee ? 'Standard Fee' : 'Custom Fee'}
            />
          </Box>
          {!useStdFee && (
            <Box className={styles.feeSliderBox}>
              <Slider
                className={styles.feeSlider}
                classes={{ markLabel: styles.feeMarkLabel }}
                defaultValue={standardFee}
                getAriaValueText={(value) => creator.estimateFees(value).toString()}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks={[
                  { value: minimalFee, label: 'Slow' },
                  { value: maximalFee, label: 'Urgent' },
                ]}
                min={minimalFee}
                max={maximalFee}
                onChange={(event, value) => handleFeePriceChange(value as number)}
                valueLabelFormat={(value) => (value / 1024).toFixed(2)}
              />
            </Box>
          )}
          <Box className={styles.feeHelpBox}>
            <FormHelperText className={styles.feeHelp}>{creator.estimateFees(feePrice).toString()}</FormHelperText>
          </Box>
        </Box>
      </FormRow>
      <FormRow last>
        <FormLabel />
        <ButtonGroup classes={{ container: styles.buttons }}>
          {initializing && (
            <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
          )}
          <Button label="Cancel" onClick={onCancel} />
          <Button
            primary
            disabled={initializing || creator.validate() !== workflow.ValidationResult.OK}
            label="Create Transaction"
            onClick={onCreate}
          />
        </ButtonGroup>
      </FormRow>
    </>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entry }) => {
    const blockchain = blockchainIdToCode(entry.blockchain);

    return {
      blockchain,
      defaultFee: application.selectors.getDefaultFee<number>(state, blockchain),
      feeTtl: application.selectors.getFeeTtl(state, blockchain),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    async getFee(blockchain, feeTtl, defaultFee) {
      const fees: number[] = await Promise.all([
        dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgLast')),
        dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgMiddle')),
        dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgTail5')),
      ]);

      const [avgLast, avgTail5, avgMiddle] = fees
        .map((fee) => fee ?? 0)
        .sort((first, second) => {
          if (first === second) {
            return 0;
          }

          return first > second ? 1 : -1;
        });

      if (avgMiddle === 0) {
        const defaults = {
          avgLast: defaultFee?.min ?? '0',
          avgMiddle: defaultFee?.max ?? '0',
          avgTail5: defaultFee?.std ?? '0',
        };

        const cachedFee = await dispatch(application.actions.cacheGet(`fee.${blockchain}`));

        if (cachedFee == null) {
          return defaults;
        }

        try {
          return JSON.parse(cachedFee);
        } catch (exception) {
          return defaults;
        }
      }

      const fee = {
        avgLast,
        avgMiddle,
        avgTail5,
      };

      await dispatch(application.actions.cachePut(`fee.${blockchain}`, JSON.stringify(fee), feeTtl));

      return fee;
    },
  }),
)(SetupTransaction);

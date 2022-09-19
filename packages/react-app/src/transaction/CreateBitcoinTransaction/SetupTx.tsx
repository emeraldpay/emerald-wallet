import { BigAmount } from '@emeraldpay/bigamount';
import { BitcoinEntry, EntryId, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { FeePrices, screen } from '@emeraldwallet/store';
import { Button, ButtonGroup } from '@emeraldwallet/ui';
import { Box, FormControlLabel, FormHelperText, Slider, Switch, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import validate from 'bitcoin-address-validation';
import * as React from 'react';
import { connect } from 'react-redux';
import AmountField from '../CreateTx/AmountField';
import FormFieldWrapper from '../CreateTx/FormFieldWrapper';
import FormLabel from '../CreateTx/FormLabel/FormLabel';
import ToField from '../CreateTx/ToField/ToField';

const { ValidationResult } = workflow;

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: 800,
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
  create: workflow.CreateBitcoinTx;
  entry: BitcoinEntry;
  source: EntryId;
  getFees(): Promise<FeePrices<number>>;
  onCreate(tx: UnsignedBitcoinTx): void;
}

interface StateProps {
  onCancel?(): void;
}

const SetupTx: React.FC<OwnProps & StateProps> = ({ create, entry, getFees, onCancel, onCreate }) => {
  const styles = useStyles();

  const [amount, setAmount] = React.useState(create.requiredAmount);
  const [feePrice, setFeePrice] = React.useState(0);
  const [maximalFee, setMaximalFee] = React.useState(0);
  const [minimalFee, setMinimalFee] = React.useState(0);
  const [standardFee, setStandardFee] = React.useState(0);
  const [useStdFee, setUseStdFee] = React.useState(true);

  const getTotalFee = React.useCallback((price: number) => create.estimateFees(price).toString(), [create]);

  const onSetAmount = React.useCallback(
    (value: BigAmount) => {
      create.requiredAmountBitcoin = value.number.toNumber();

      setAmount(create.requiredAmount);
    },
    [create],
  );

  const onSetAmountMax = React.useCallback(() => {
    create.setMaxAmount();

    setAmount(create.requiredAmount);
  }, [create]);

  const onSetFeePrice = React.useCallback(
    (price: number) => {
      create.feePrice = price;

      setFeePrice(price);
    },
    [create],
  );

  const onSetTo = React.useCallback(
    (value: string) => {
      const validation = validate(value);

      create.address = validation === false ? '' : validation.address;
    },
    [create],
  );

  React.useEffect(() => {
    getFees().then(({ avgLast, avgTail5, avgMiddle }) => {
      setMinimalFee(avgLast);
      setStandardFee(avgTail5);
      setMaximalFee(avgMiddle);

      onSetFeePrice(avgTail5);
    });
  }, [useStdFee, getFees, onSetFeePrice]);

  const valid = standardFee > 0 && create.validate() == ValidationResult.OK;

  return (
    <div className={styles.container}>
      <FormFieldWrapper>
        <ToField blockchain={blockchainIdToCode(entry.blockchain)} to={create.address} onChange={onSetTo} />
      </FormFieldWrapper>
      <FormFieldWrapper>
        <AmountField
          initialAmount={amount}
          units={create.requiredAmount.units}
          onChangeAmount={onSetAmount}
          onMaxClicked={onSetAmountMax}
        />
      </FormFieldWrapper>
      <FormFieldWrapper>
        <FormLabel>Fee</FormLabel>
        <Box className={styles.inputField}>
          <Box className={styles.feeTypeBox}>
            <FormControlLabel
              control={
                <Switch
                  checked={useStdFee}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    if (checked) {
                      setFeePrice(standardFee);
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
                getAriaValueText={getTotalFee}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks={[
                  { value: minimalFee, label: 'Slow' },
                  { value: maximalFee, label: 'Urgent' },
                ]}
                min={minimalFee}
                max={maximalFee}
                onChange={(event, value) => onSetFeePrice(value as number)}
                valueLabelFormat={(value) => (value / 1024).toFixed(2)}
              />
            </Box>
          )}
          <Box className={styles.feeHelpBox}>
            <FormHelperText className={styles.feeHelp}>{getTotalFee(feePrice)}</FormHelperText>
          </Box>
        </Box>
      </FormFieldWrapper>
      <FormFieldWrapper style={{ paddingBottom: 0 }}>
        <FormLabel />
        <ButtonGroup classes={{ container: styles.inputField }}>
          <Button label="Cancel" onClick={onCancel} />
          <Button
            disabled={!valid}
            label="Create Transaction"
            primary={true}
            onClick={() => onCreate(create.create())}
          />
        </ButtonGroup>
      </FormFieldWrapper>
    </div>
  );
};

export default connect(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    onCancel: () => dispatch(screen.actions.gotoWalletsScreen()),
  }),
)(SetupTx);

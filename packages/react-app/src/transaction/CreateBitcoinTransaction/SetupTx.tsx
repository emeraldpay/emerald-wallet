import { BigAmount } from "@emeraldpay/bigamount";
import { EntryId, UnsignedBitcoinTx } from "@emeraldpay/emerald-vault-core";
import { BitcoinEntry } from "@emeraldpay/emerald-vault-core/lib/types";
import { ButtonGroup } from "@emeraldplatform/ui";
import { CreateBitcoinTx, ValidationResult } from "@emeraldwallet/core/lib/workflow";
import { IState, screen } from "@emeraldwallet/store";
import { Button } from "@emeraldwallet/ui";
import { Box, createStyles, FormControlLabel, FormHelperText, Slider, Switch, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import validate from 'bitcoin-address-validation';
import classNames from "classnames";
import * as React from "react";
import { Dispatch } from "react";
import { connect } from "react-redux";
import FormFieldWrapper from "../CreateTx/FormFieldWrapper";
import FormLabel from "../CreateTx/FormLabel/FormLabel";

const useStyles = makeStyles(() =>
  createStyles({
    inputField: {
      flexGrow: 5
    },
    toField: {
      width: "500px",
    },
    amountField: {
      width: "300px",
    },
    feeTypeBox: {
      width: "200px",
      float: "left",
      // make at least as slider height
      height: "40px",
    },
    feeSliderBox: {
      width: "300px",
      float: "left"
    },
    feeHelpBox: {
      width: "500px",
      clear: "left",
    },
    feeSlider: {
      width: "300px",
      marginBottom: "10px",
      paddingTop: "10px",
    },
    feeHelp: {
      position: "initial",
      paddingLeft: "10px"
    },
    withHelp: {
      minHeight: "80px"
    },
    feeMarkLabel: {
      fontSize: "0.7em",
      opacity: 0.8
    }
  })
);

/**
 *
 */
const Component = (({create, onCreate, getFees, onCancel}: Props & OwnProps) => {
  const styles = useStyles();
  const [to, setTo] = React.useState("");
  const [toError, setToError] = React.useState<string | undefined>('');
  const [stdFee, setStdFee] = React.useState(true);
  const [amount, setAmountState] = React.useState(0);
  const [amountStr, setAmountStr] = React.useState("0");
  const [feePrice, setFeePrice] = React.useState(0);
  const [standardFee, setStandardFee] = React.useState(0);
  const [minimalFee, setMinimalFee] = React.useState(0);
  const [maximalFee, setMaximalFee] = React.useState(0);

  // instance recreated on each global state change, update it with the current local state
  create.address = to;
  create.requiredAmountBitcoin = amount

  function updateTo(value: string) {
    setTo(value);
    const parsed = validate(value);
    if (parsed) {
      create.address = parsed.address;
      setToError(undefined);
      //TODO verify network
    } else {
      create.address = "";
      setToError("Invalid address");
    }
  }

  function totalFee(price: number): string {
    return create.estimateFees(price).toString();
  }

  function setNewFeePrice(price: number) {
    create.feePrice = price;
    setFeePrice(price);
  }

  function setAmount(value: string) {
    setAmountStr(value);
    try {
      const bitcoins = parseFloat(value.trim());
      create.requiredAmountBitcoin = bitcoins;
      setAmountState(bitcoins);
    } catch (e) {
      create.requiredAmountBitcoin = 0;
      setAmountState(0);
    }
  }

  const valid = standardFee > 0 && create.validate() == ValidationResult.OK;

  React.useEffect(() => {
    (
      async () => {
        const {avgLast, avgTail5, avgMiddle} = await getFees();

        setMinimalFee(avgLast);
        setStandardFee(avgTail5);
        setMaximalFee(avgMiddle);

        setNewFeePrice(avgTail5);
      }
    )();
  }, [stdFee]);

  return <Box>

    <FormFieldWrapper>
      <FormLabel>To</FormLabel>
      <Box className={classNames(styles.inputField, styles.withHelp)}>
        <TextField
          className={styles.toField}
          value={to}
          error={(toError?.length ?? 0) > 0}
          helperText={toError}
          onChange={(e: any) => updateTo(e.target.value)}
        />
      </Box>
    </FormFieldWrapper>

    <FormFieldWrapper>
      <FormLabel>Amount</FormLabel>
      <Box className={classNames(styles.inputField, styles.withHelp)}>
        <TextField
          className={styles.amountField}
          value={amountStr}
          onChange={(e: any) => setAmount(e.target.value)}
          helperText={"Send " + create.requiredAmount.toString() + " of " + create.totalAvailable.toString()}
        />
      </Box>
    </FormFieldWrapper>

    <FormFieldWrapper>
      <FormLabel>Fee</FormLabel>
      <Box className={styles.inputField}>
        <Box className={styles.feeTypeBox}>
          <FormControlLabel
            control={
              <Switch
                checked={stdFee}
                onChange={(event) => {
                  const checked = event.target.checked;
                  if (checked) {
                    setFeePrice(standardFee);
                  }
                  setStdFee(checked);
                }}
                name="checkedB"
                color="primary"
              />
            }
            label={stdFee ? "Standard Fee" : "Custom Fee"}/>
        </Box>
        {!stdFee && (
          <Box className={styles.feeSliderBox}>
            <Slider
              className={styles.feeSlider}
              classes={{ markLabel: styles.feeMarkLabel }}
              defaultValue={standardFee}
              getAriaValueText={totalFee}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              step={1}
              marks={[
                { value: minimalFee, label: "Slow" },
                { value: maximalFee, label: "Urgent" },
              ]}
              min={minimalFee}
              max={maximalFee}
              onChange={(e, value) => setNewFeePrice(value as number)}
              valueLabelFormat={(value) => (value / 1024).toFixed(2)}
            />
          </Box>
        )}
        <Box className={styles.feeHelpBox}>
          <FormHelperText className={styles.feeHelp}>{totalFee(feePrice)}</FormHelperText>
        </Box>
      </Box>
    </FormFieldWrapper>

    <FormFieldWrapper style={{paddingBottom: '0px'}}>
      <FormLabel/>
      <ButtonGroup style={{flexGrow: 5}}>
        <Button label="Cancel" onClick={onCancel} />
        <Button
          disabled={!valid}
          primary={true}
          label='Create Transaction'
          onClick={() => onCreate(create.create())}
        />
      </ButtonGroup>
    </FormFieldWrapper>

  </Box>
})

// State Properties
interface Props {
  onCancel?: () => void;
}

// Component properties
interface OwnProps {
  create: CreateBitcoinTx<BigAmount>;
  entry: BitcoinEntry;
  source: EntryId;
  getFees: () => Promise<any>;
  onCreate: (tx: UnsignedBitcoinTx) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {};
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps) => {
    return {
      onCancel: () => dispatch(screen.actions.gotoScreen(screen.Pages.HOME, ownProps.source)),
    }
  }
)((Component));

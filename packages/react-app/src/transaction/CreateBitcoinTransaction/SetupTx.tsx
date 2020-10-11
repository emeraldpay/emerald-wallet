import {connect} from "react-redux";
import * as React from "react";
import {Dispatch} from "react";
import {Box, createStyles, FormHelperText, Slider, TextField, Theme} from "@material-ui/core";
import {accounts, IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import FormFieldWrapper from "../CreateTx/FormFieldWrapper";
import {ButtonGroup} from "@emeraldplatform/ui";
import {CreateBitcoinTx, ValidationResult} from "@emeraldwallet/core/lib/workflow";
import {BigAmount} from "@emeraldpay/bigamount";
import FormLabel from "../CreateTx/FormLabel/FormLabel";
import {Button} from "@emeraldwallet/ui";
import classNames from "classnames";
import validate from 'bitcoin-address-validation';
import {UnsignedBitcoinTx} from "@emeraldpay/emerald-vault-core";
import {BitcoinEntry} from "@emeraldpay/emerald-vault-core/lib/types";

const useStyles = makeStyles<Theme>((theme) =>
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
    feeSlider: {
      width: "300px"
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
const Component = (({create, onCreate, standardFee}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [to, setTo] = React.useState("");
  const [toError, setToError] = React.useState();
  const [feePrice, setFeePriceState] = React.useState(0);
  const [feesStr, setFeesStr] = React.useState(create.fees.toString());
  const [amount, setAmountState] = React.useState(0);
  const [amountStr, setAmountStr] = React.useState("0");

  // instance recreated on each global state change, update it with the current local state
  create.address = to;
  if (feePrice > 0) {
    create.feePrice = feePrice
  }
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

  function setFeePrice(price: number) {
    create.feePrice = price;
    setFeePriceState(price);
    setFeesStr(create.fees.toString());
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
    setFeesStr(create.fees.toString());
  }

  const valid = create.validate() == ValidationResult.OK;

  return <Box>

    <FormFieldWrapper>
      <FormLabel>To</FormLabel>
      <Box className={classNames(styles.inputField, styles.withHelp)}>
        <TextField
          className={styles.toField}
          value={to}
          error={toError?.length > 0}
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
        <Slider
          className={styles.feeSlider}
          classes={{markLabel: styles.feeMarkLabel}}
          defaultValue={standardFee}
          getAriaValueText={totalFee}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          step={10}
          marks={[
            {value: Math.round(standardFee / 2), label: "Slow"},
            {value: standardFee, label: "Normal"},
            {value: standardFee * 2, label: "Urgent"},
          ]}
          min={10}
          max={standardFee * 4}
          onChange={(e, value) => setFeePrice(value as number)}
        />
        <FormHelperText className={styles.feeHelp}>{feesStr}</FormHelperText>
      </Box>
    </FormFieldWrapper>

    <FormFieldWrapper style={{paddingBottom: '0px'}}>
      <FormLabel/>
      <ButtonGroup style={{flexGrow: 5}}>
        <Button
          label='Cancel'
          onClick={() => {
          }}
        />
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
  create: CreateBitcoinTx<BigAmount>,
  standardFee: number,
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  entry: BitcoinEntry,
  onCreate: (tx: UnsignedBitcoinTx) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    let utxo = accounts.selectors.getUtxo(state, ownProps.entry.id);
    const standardFee = 65;
    const create = new CreateBitcoinTx<BigAmount>(ownProps.entry, utxo);
    create.feePrice = 65;
    return {
      create,
      standardFee,
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));
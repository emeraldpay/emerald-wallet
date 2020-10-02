import {connect} from "react-redux";
import * as React from "react";
import {Dispatch} from "react";
import {Box, createStyles, FormHelperText, Slider, TextField, Theme} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import FormFieldWrapper from "../CreateTx/FormFieldWrapper";
import {ButtonGroup} from "@emeraldplatform/ui";
import {CreateBitcoinTx, ValidationResult} from "@emeraldwallet/core/lib/workflow";
import {BigAmount} from "@emeraldpay/bigamount";
import FormLabel from "../CreateTx/FormLabel/FormLabel";
import {Button} from "@emeraldwallet/ui";
import classNames from "classnames";
import validate from 'bitcoin-address-validation';

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
  })
);

/**
 *
 */
const Component = (({create, onCreate}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [to, setTo] = React.useState("");
  const [toError, setToError] = React.useState();
  const [feesStr, setFeesStr] = React.useState(create.fees.toString());
  const [amountStr, setAmountStr] = React.useState("0");

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
    setFeesStr(create.fees.toString());
  }

  function setAmount(value: string) {
    setAmountStr(value);
    try {
      const bitcoins = parseFloat(value.trim());
      create.amountBitcoin = bitcoins;
    } catch (e) {
      create.amountBitcoin = 0;
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
          defaultValue={200}
          getAriaValueText={totalFee}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          step={10}
          marks={[
            {value: 50, label: "Slow"},
            {value: 150, label: "Normal"},
            {value: 250, label: "Urgent"},
          ]}
          min={10}
          max={350}
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
          onClick={() => onCreate()}
        />
      </ButtonGroup>
    </FormFieldWrapper>

  </Box>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  create: CreateBitcoinTx<BigAmount>,
  onCreate: () => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));
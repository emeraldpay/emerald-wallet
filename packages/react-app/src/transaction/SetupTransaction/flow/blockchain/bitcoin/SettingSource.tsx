import { FormControlLabel, FormHelperText, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React from 'react';
import { workflow } from '@emeraldwallet/core';

interface SettingSourceProps {
  createTx: workflow.CreateBitcoinTx;
  setTransaction(transaction: workflow.AnyPlainTx): void;
}
export const SettingSource = ({createTx, setTransaction}: SettingSourceProps) => {
  let [value, setValue] = React.useState<workflow.UtxoOrder>(createTx.utxoOrder);

  let description = "";
  if (value === "oldest") {
    description = "Use oldest UTXO";
  } else if (value === "newest") {
    description = "Use newest UTXO";
  } else if (value === "random") {
    description = "Use random selection of all UTXO";
  } else if (value === "largest") {
    description = "Use largest UTXO";
  } else if (value === "smallest") {
    description = "Use smallest UTXO";
  }

  let onChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as workflow.UtxoOrder);
    createTx.utxoOrder = event.target.value as workflow.UtxoOrder;
    setValue(createTx.utxoOrder);
    setTransaction(createTx.dump());
  }

  let selector = <Select variant={"standard"} value={value} onChange={onChange}>
    <MenuItem value={"oldest"}>Oldest</MenuItem>
    <MenuItem value={"newest"}>Newest</MenuItem>
    <MenuItem value={"random"}>Random</MenuItem>
    <MenuItem value={"largest"}>Largest</MenuItem>
    <MenuItem value={"smallest"}>Smallest</MenuItem>
  </Select>;

  return (
      <FormControlLabel
        control={selector}
        label={<FormHelperText variant={"right"}>{description}</FormHelperText>}
        labelPlacement="end"/>
  )
}

import { BlockchainCode, IBlockchain } from '@emeraldwallet/core';
import {MenuItem, Select, SelectChangeEvent} from '@mui/material';
import * as React from 'react';

interface OwnProps {
  blockchains: IBlockchain[];
  initialValue?: BlockchainCode;
  onChange?(value: string): void;
}

interface State {
  value?: string;
}

export class ChainSelector extends React.Component<OwnProps, State> {
  constructor(props: OwnProps) {
    super(props);

    const {
      blockchains: [blockchain],
      initialValue,
    } = this.props;

    this.state = {
      value: initialValue ?? (blockchain == null ? BlockchainCode.ETH : blockchain.params.code),
    };
  }

  public handleChange = (event: SelectChangeEvent, _child?: object): void => {
    this.setState({ value: event.target.value });

    this.props.onChange?.(event.target.value);
  };

  public render(): React.ReactNode {
    const { blockchains } = this.props;
    const { value } = this.state;

    return (
      <Select value={value} onChange={this.handleChange}>
        {blockchains.map((blockchain: IBlockchain) => {
          const { code } = blockchain.params;

          return (
            <MenuItem key={code} value={code}>
              {blockchain.getTitle()}
            </MenuItem>
          );
        })}
      </Select>
    );
  }
}

export default ChainSelector;

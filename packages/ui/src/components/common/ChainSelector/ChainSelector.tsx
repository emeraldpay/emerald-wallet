import { BlockchainCode, IBlockchain } from '@emeraldwallet/core';
import { FormControl, Input, InputLabel, MenuItem, Select } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

export const styles = (theme?: any) => createStyles({
  container: {
    position: 'relative'
  },
  selectChain: {
    marginTop: (theme && theme.spacing) && theme.spacing(2)
  },
  formControl: {
    margin: (theme && theme.spacing) && theme.spacing(1),
    minWidth: 120,
    border: 0
  }
});

interface IProps {
  chains: IBlockchain[];
  onChange?: any;
  value?: BlockchainCode;
  classes?: any;
}

interface IState {
  value?: string;
}

export class ChainSelector extends React.Component<IProps, IState> {
  public state = {
    value: this.props.value
  };

  constructor (props: Readonly<IProps>) {
    super(props);
    this.state.value = props.value || (props.chains.length > 0 ? props.chains[0].params.code : BlockchainCode.ETH);
  }

  public handleChange = (event: React.ChangeEvent<{ name?: string; value: string }>): void => {
    this.setState({
      value: event.target.value
    });
    if (this.props.onChange) {
      this.props.onChange(event.target.value);
    }
  }

  public render () {
    const { classes, chains } = this.props;
    const { value } = this.state;
    return (
      <div className={classes.container}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor='chain-helper'>Blockchain</InputLabel>
          <Select
            value={value}
            input={<Input name='chain' id='chain-helper' />}
            onChange={this.handleChange}
            displayEmpty={true}
            name='chain'
            className={classes.selectChain}
          >
            {chains.map((chain: IBlockchain) =>
              <MenuItem value={chain.params.code} key={chain.params.coinTicker}>{chain.getTitle()}</MenuItem>
            )}
          </Select>
          {/*<FormHelperText>Select blockchain</FormHelperText>*/}
        </FormControl>
      </div>
    );
  }
}

export default withStyles(styles)(ChainSelector);

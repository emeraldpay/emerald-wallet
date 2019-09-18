import { Blockchain, BlockchainCode } from '@emeraldwallet/core';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { CSSProperties, withStyles } from '@material-ui/styles';
import * as React from 'react';

export const styles = (theme: any) => ({
  container: {
    position: 'relative'
  } as CSSProperties,
  selectChain: {
    marginTop: theme.spacing(2)
  } as CSSProperties,
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    border: 0
  } as CSSProperties
});

interface Props {
  chains: Blockchain[];
  onChange?: any;
  value?: BlockchainCode;
  classes?: any;
}

interface State {
  value?: string;
}

export class ChainSelector extends React.Component<Props, State> {
  public state = {
    value: this.props.value
  };

  constructor (props: Readonly<Props>) {
    super(props);
    this.state.value = props.value || (props.chains.length > 0 ? props.chains[0].params.code : BlockchainCode.ETH);
  }

  public handleChange (event: React.ChangeEvent<{ name?: string; value: string }>) {
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
            onChange={this.handleChange.bind(this)}
            displayEmpty={true}
            name='chain'
            className={classes.selectChain}
          >
            {chains.map((chain: Blockchain) =>
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

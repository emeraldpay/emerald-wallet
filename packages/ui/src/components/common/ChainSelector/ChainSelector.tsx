import { BlockchainCode, IBlockchain } from '@emeraldwallet/core';
import { FormControl, Input, InputLabel, MenuItem, Select, StyleRules, Theme, createStyles } from '@material-ui/core';
import { WithStyles, withStyles } from '@material-ui/styles';
import * as React from 'react';

export const styles = (theme: Theme): StyleRules =>
  createStyles({
    container: {
      position: 'relative',
    },
    formControl: {
      border: 0,
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectChain: {
      marginTop: theme.spacing(2),
    },
  });

interface OwnProps {
  chains: IBlockchain[];
  value?: BlockchainCode;
  onChange?(value: string): void;
}

interface State {
  value?: string;
}

type Props = OwnProps & WithStyles<typeof styles>;

export class ChainSelector extends React.Component<Props, State> {
  public state = { value: this.props.value };

  constructor(props: Readonly<Props>) {
    super(props);

    this.state.value = props.value ?? (props.chains.length > 0 ? props.chains[0].params.code : BlockchainCode.ETH);
  }

  public handleChange = (event: React.ChangeEvent<{ name?: string; value: string }>): void => {
    this.setState({ value: event.target.value });

    if (this.props.onChange != null) {
      this.props.onChange(event.target.value);
    }
  };

  public render(): React.ReactElement {
    const { classes, chains } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.container}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="chain-helper">Blockchain</InputLabel>
          <Select
            className={classes.selectChain}
            displayEmpty={true}
            input={<Input name="chain" id="chain-helper" />}
            name="chain"
            value={value}
            onChange={this.handleChange}
          >
            {chains.map((chain: IBlockchain) => (
              <MenuItem key={`${chain.params.code}-${chain.params.coinTicker}`} value={chain.params.code}>
                {chain.getTitle()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }
}

export default withStyles(styles)(ChainSelector);

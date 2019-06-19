import * as React from 'react';
import MenuItem from "@material-ui/core/MenuItem";
import {CSSProperties, withStyles} from '@material-ui/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';

export const styles = (theme) => ({
  container: {
    position: "relative"
  } as CSSProperties,
  selectChain: {
    marginTop: theme.spacing(2),
  } as CSSProperties,
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    border: 0
  } as CSSProperties,
});

interface Props {
  onChange?: any;
  value?: string;
  classes?: any;
}

interface State {
  value?: any;
}

const blockchains = [
  {code: "ETH", title: "Ethereum"},
  {code: "ETC", title: "Ethereum Classic"},
];

export class ChainSelector extends React.Component<Props, State> {
  state = {
    value: this.props.value
  };

  constructor(props: Readonly<Props>) {
    super(props);
    this.state.value = props.value || 'ETH';
  }

  handleChange(event: React.ChangeEvent<{ name?: string; value: string }>) {
    this.setState({
      value: event.target.value
    });
    this.props.onChange(event.target.value);
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    return (
      <div className={ classes.container }>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="chain-helper">Blockchain</InputLabel>
          <Select
            value={value || "ETH"}
            input={<Input name="chain" id="chain-helper" />}
            onChange={this.handleChange.bind(this)}
            displayEmpty
            name="chain"
            className={classes.selectChain}
          >
            {blockchains.map( (chain) =>
              <MenuItem value={chain.code} key={chain.code}>{chain.title}</MenuItem>
            )}
          </Select>
          {/*<FormHelperText>Select blockchain</FormHelperText>*/}
        </FormControl>
      </div>
    );
  }
}


export default withStyles(styles)(ChainSelector);

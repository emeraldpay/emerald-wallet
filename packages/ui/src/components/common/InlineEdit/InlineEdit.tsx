import { Checkmark as SubmitIcon, Close as CancelIcon } from '@emeraldplatform/ui-icons';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';

export const styles = {
  textField: {
    // fontSize: '14px',
  }
};

interface Props {
  id?: any;
  initialValue?: any;
  placeholder?: string;
  onCancel?: any;
  onSave?: any;
  classes?: any;
}

interface State {
  currentValue?: any;
}

/**
 * Allows inline editing
 */
export class InlineEdit extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      currentValue: this.props.initialValue
    };
  }

  public handleChange = (event: { target: { value: any; }; }) => {
    this.setState({
      currentValue: event.target.value
    });
  }

  public handleSave = () => {
    if (this.props.onSave) {
      this.props.onSave({
        id: this.props.id,
        value: this.state.currentValue
      });
    }
  }

  public handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  public render () {
    const {
      classes, placeholder
    } = this.props;
    const { currentValue } = this.state;

    return (
      <TextField
        value={currentValue}
        onChange={this.handleChange}
        // style={{maxHeight: '40px'}}
        placeholder={placeholder}
        fullWidth={true}
        InputProps={{
          className: classes.textField,
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton onClick={this.handleCancel}><CancelIcon/></IconButton>
              <IconButton color='primary' onClick={this.handleSave}>
                <SubmitIcon/>
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    );
  }
}

export default withStyles(styles)(InlineEdit);

import { IconButton, InputAdornment, TextField } from '@mui/material';
import * as React from 'react';
import { Close as CancelIcon, Checkmark as SubmitIcon } from '../../../icons';

interface Props {
  id?: string;
  initialValue?: string;
  placeholder?: string;
  onCancel?(): void;
  onSave?(data: { id?: string; value: string }): void;
}

interface State {
  currentValue?: string;
}

/**
 * Allows inline editing
 */
export class InlineEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { currentValue: props.initialValue };
  }

  public handleCancel = (): void => {
    this.props.onCancel?.();
  };

  public handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      currentValue: event.target.value,
    });
  };

  public handleSave = (): void => {
    this.props.onSave?.({
      id: this.props.id,
      value: this.state.currentValue,
    });
  };

  public render(): React.ReactNode {
    const { placeholder } = this.props;
    const { currentValue } = this.state;

    return (
      <TextField
        fullWidth={true}
        placeholder={placeholder}
        value={currentValue}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={this.handleCancel}>
                <CancelIcon />
              </IconButton>
              <IconButton color="primary" onClick={this.handleSave}>
                <SubmitIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={this.handleChange}
        onKeyDown={({ key }) => key === 'Enter' && this.handleSave()}
      />
    );
  }
}

export default InlineEdit;

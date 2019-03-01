import { connect } from 'react-redux';
import React from 'react';
import { Close as CancelIcon, Checkmark as SubmitIcon } from '@emeraldplatform/ui-icons';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

export const styles = {
  nameTextField: {
    fontSize: '14px',
  },
};

/**
 * Allows inline editing account's name
 */
export class AccountEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
    };
  }

  handleChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  handleSave = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit({
        address: this.props.address,
        name: this.state.name,
      });
    }
  };

  render() {
    const {
      cancel, classes,
    } = this.props;
    const { name } = this.state;

    return (
      <TextField
        value={name}
        onChange={this.handleChange}
        style={{ maxHeight: '40px' }}
        placeholder="Account name"
        underlineShow={false}
        fullWidth={true}
        InputProps={{
          className: classes.nameTextField,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={cancel}><CancelIcon /></IconButton>
              <IconButton color="primary" onClick={this.handleSave}>
                <SubmitIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  }
}

const StyledAccountEdit = withStyles(styles)(AccountEdit);

export default connect(
  (state, ownProps) => ({
    blockAddress: true,
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      ownProps.submit(data);
    },
    cancel: () => {
      ownProps.cancel();
    },
  })
)(StyledAccountEdit);

import React from 'react';
import withStyles from 'react-jss';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import IconButton from '@material-ui/core/IconButton';
import { Trash as DeleteIcon } from '@emeraldplatform/ui-icons';
import { Input } from 'emerald-js-ui';
import tokensStore from '../../../store/vault/tokens';

const styles2 = {
  tokenItemContainer: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInput: {
    marginLeft: '4px',
    minWidth: '405px',
    fontSize: '16px',
  },
  symbolInput: {
    maxWidth: '80px',
    fontSize: '16px',
  },
};

const deleteIconStyle = {
  width: '19px',
  height: '19px',
};

const Token = (props) => {
  const { token, classes } = props;
  const tokenAddress = token.get('address');
  const symbol = token.get('symbol');

  return (
    <div className={ classes.tokenItemContainer }>
      <div className={ classes.symbolInput }>
        <Input
          value={ symbol }
          underlineShow={ false }
        />
      </div>
      <div className={ classes.addressInput }>
        <Input
          value={ tokenAddress }
          underlineShow={ false }

        />
      </div>
      <div>
        <IconButton onClick={ () => props.onDelete(token) } >
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
};

Token.propTypes = {
  token: PropTypes.object.isRequired,
};

const StyledToken = withStyles(styles2)(Token);

const TokensList = ({ tokens, onDelete }) => {
  return (
    <div>
      { tokens.map((token) => <StyledToken {...{onDelete}} key={ token.get('address') } {...{token}}/>)}
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  return {
    tokens: state.tokens.get('tokens', Immutable.List()),
  };
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  onDelete: (token) => {
    dispatch(tokensStore.actions.removeToken(token.get('address')));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TokensList);

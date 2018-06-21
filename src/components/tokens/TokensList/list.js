import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { IconButton } from 'material-ui';
import { Trash as DeleteIcon } from 'emerald-js-ui/lib/icons3';
import { Input } from 'emerald-js-ui';
import tokens from '../../../store/vault/tokens';

import styles from './list.scss';

const deleteIconStyle = {
  width: '19px',
  height: '19px',
};

const Token = (props) => {
  const { token } = props;
  const tokenAddress = token.get('address');
  const symbol = token.get('symbol');

  return (
    <div className={ styles.tokenItemContainer }>
      <div className={ styles.symbolInput }>
        <Input
          value={ symbol }
          underlineShow={ false }
        />
      </div>
      <div className={ styles.addressInput }>
        <Input
          value={ tokenAddress }
          underlineShow={ false }

        />
      </div>
      <div>
        <IconButton onClick={ () => props.onDelete(token) } iconStyle={ deleteIconStyle }>
          <DeleteIcon/>
        </IconButton>
      </div>
    </div>
  );
};

Token.propTypes = {
  token: PropTypes.object.isRequired,
};

const TokensList = ({ tokens, onDelete }) => {
  return (
    <div>
      { tokens.map((token) =>
        <Token {...{onDelete}} key={ token.get('address') } {...{token}}/>)}
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
    dispatch(tokens.actions.removeToken(token.get('address')));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TokensList);

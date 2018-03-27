import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { IconButton } from 'material-ui';
import { Delete as DeleteIcon } from 'emerald-js-ui/lib/icons';
import { Input } from 'emerald-js-ui';

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
        <IconButton iconStyle={ deleteIconStyle }>
          <DeleteIcon/>
        </IconButton>
      </div>
    </div>
  );
};

Token.propTypes = {
  token: PropTypes.object.isRequired,
};

const TokensList = ({ tokens }) => {
  return (
    <div>
      { tokens.map((token) =>
        <Token key={ token.get('address') } token={ token }/>)}
    </div>
  );
};

function mapStateToProps(state, ownProps) {
  return {
    tokens: state.tokens.get('tokens', Immutable.List()),
  };
}

export default connect(
  mapStateToProps,
  null
)(TokensList);


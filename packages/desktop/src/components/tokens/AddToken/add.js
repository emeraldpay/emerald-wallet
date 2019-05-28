import React from 'react';
import { convert } from '@emeraldplatform/core';
import {InputTokenAddress, AddToken} from '@emeraldwallet/ui';
import { connect } from 'react-redux';
import TokenUnits from 'lib/tokenUnits';
import tokens from '../../../store/vault/tokens';

export class NewCustomToken extends React.Component {
    state = {};

    handleFetchToken = (address) => {
      const { onFetchToken } = this.props;
      if (onFetchToken) {
        onFetchToken(address)
          .then((result) => this.setState({
            token: result,
          }));
      }
    };

    handleCancel = () => {
      this.setState({
        token: null,
      });
    };

    handleAddToken = () => {
      const { onSubmit } = this.props;
      const { token } = this.state;
      if (onSubmit) {
        onSubmit(token).then(this.setState({token: null}));
      }
    };

    render() {
      const { token, error } = this.state;

      const total = (tokenData) => new TokenUnits(
        convert.toBigNumber(tokenData.totalSupply),
        convert.toBigNumber(tokenData.decimals)
      );

      if (!token) {
        return (
          <InputTokenAddress
            onSubmit={ this.handleFetchToken }
          />
        );
      }

      return (
        <AddToken
          address={token.address}
          symbol={token.symbol}
          totalSupply={total(token).getDecimalized()}
          decimals={convert.toNumber(token.decimals)}
          onCancel={ this.handleCancel }
          onSubmit={ this.handleAddToken }
        />
      );
    }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSubmit: (token) => {
      if (token) {
        return dispatch(tokens.actions.addToken(token))
          .then(dispatch(tokens.actions.loadTokenBalances(token)));
      }
    },
    onFetchToken: (address) => {
      return dispatch(tokens.actions.fetchTokenDetails(address));
    },
  };
}

function mapStateToProps(state, ownProps) {
  return {
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewCustomToken);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'emerald-js-ui/lib/icons3';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import ledger from 'store/ledger';

const pageSize = 5;

const Pager = ({ offset, setOffset }) => {
  const offsetStyle = {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 900,
    marginTop: '8px',
  };
  return (
    <Row>
      <Col xs={5} style={{textAlign: 'right'}}>
        <FlatButton
          disabled={offset - pageSize < 0}
          onClick={() => setOffset(offset - pageSize)}
          icon={<ArrowLeftIcon />}/>
      </Col>
      <Col xs={2} style={offsetStyle}>
        {offset}
      </Col>
      <Col xs={5}>
        <FlatButton
          onClick={() => setOffset(offset + pageSize)}
          icon={<ArrowRightIcon />}/>
      </Col>
    </Row>
  );
};

Pager.propTypes = {
};

export default connect(
  (state, ownProps) => ({
    offset: state.ledger.getIn(['hd', 'offset']),
  }),
  (dispatch, ownProps) => ({
    setOffset: (offset) => {
      dispatch(ledger.actions.getAddresses(offset, pageSize));
    },
  })
)(Pager);

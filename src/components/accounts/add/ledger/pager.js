import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { getAddresses } from 'store/ledgerActions';

const pageSize = 5;

const Render = ({ offset, setOffset }) => {
    let offsetStyle = {
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 900,
        marginTop: '8px'
    };
    return (
        <Row>
            <Col xs={5} style={{textAlign: 'right'}}>
                <FlatButton
                    disabled={offset - pageSize < 0}
                    onClick={() => setOffset(offset - pageSize)}
                    icon={<FontIcon className="fa fa-chevron-left" />}/>
            </Col>
            <Col xs={2} style={offsetStyle}>
                {offset}
            </Col>
            <Col xs={5}>
                <FlatButton
                    onClick={() => setOffset(offset + pageSize)}
                    icon={<FontIcon className="fa fa-chevron-right" />}/>
            </Col>
        </Row>
    )
};

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
        offset: state.ledger.getIn(['hd', 'offset'])
    }),
    (dispatch, ownProps) => ({
        setOffset: (offset) => {
            dispatch(getAddresses(offset, pageSize))
        }
    })
)(Render);

export default Component;
import React from 'react';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { FlatButton } from 'material-ui';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

export const CardHeadEmerald = (props) => {
    const { title, backLabel, cancel } = props;
    const style = {
        color: '#191919',
        fontSize: '22px',
        lineHeight: '24px',
        textAlign: 'left',
    };

    const flatButtonNav = {
        color: '#747474',
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '24px',
    };

    return (
        <Row middle="xs" style={{marginBottom: '60px'}}>
          <Col xs={4}>
            <FlatButton label={backLabel}
                        primary={true}
                        onClick={cancel}
                        style={flatButtonNav}
                        icon={<KeyboardArrowLeft/>}
            />
          </Col>
          <Col xs={6} style={style}>{title}</Col>
        </Row>
    );
};

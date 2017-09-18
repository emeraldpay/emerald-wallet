import React from 'react';
import Dialog from 'material-ui/Dialog';

import { Row, Col } from 'react-flexbox-grid/lib/index';
import IconButton from 'material-ui/IconButton';
import { CloseIcon } from 'elements/Icons';

import AddToken from '../add';
import TokensList from '../list';

const styles = {
    closeButton: {
        float: 'right',
    },
};

export default class TokensDialog extends React.Component {
    render() {
        const { onClose } = this.props;

        return (<Dialog modal={true}
                        open={true}
                        onRequestClose={ onClose }>

            <Row>
                <Col xs={11}>
                    <h1>About</h1>
                </Col>
                <Col xs={1}>
                    <IconButton
                        style={ styles.closeButton }
                        onTouchTap={ onClose }
                        tooltip="Close">
                        <CloseIcon />
                    </IconButton>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <TokensList />
                    <AddToken/>
                </Col>
            </Row>

        </Dialog>);
    }
}

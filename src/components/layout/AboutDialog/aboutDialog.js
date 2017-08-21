import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';

const styles = {
    closeButton: {
        float: 'right',
        color: 'green',
    },
    qr: {
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '90%',
    },
    usageText: {
        color: 'gray',
    },
    usageWarning: {
        color: 'crimson',
        fontSize: '0.9rem',
    },
    accountId: {
        overflow: 'scroll',
        backgroundColor: 'whitesmoke',
        padding: '0.1rem 0.3rem',
        display: 'inline',
        fontSize: '0.8rem', /* to better ensure fit for all screen sizes */
    },
};

const AboutDialog = ({ account, onClose }) => {
    return <Dialog
        modal={false}
        open={true}
        onRequestClose={ onClose }>
        <Row>
            <Col xs={11}>
                <h1>About</h1>
            </Col>
            <Col xs={1}>
                <FlatButton
                    icon={<FontIcon className='fa fa-close' />}
                    primary={true}
                    onTouchTap={ onClose }
                    style={styles.closeButton}
                />
            </Col>
        </Row>
        <Row>
            <Col xs={12}>
                <div style={{color: 'limegreen'}}>
                    Beta 0.4.0
                </div>
                <div style={{color: 'gray', fontWeight: '300', fontSize: '14px'}}>
                    <p style={{marginTop: 0}}>
                        Find an issue? Got a suggestion? <br/>
                        Please let us know on our <a  href='https://github.com/ethereumproject/emerald-wallet/issues'>
                        Github issues page</a>.
                    </p>
                    <p>
                        Made with ❤️&nbsp; by <strong>ETCDEV</strong> and <a href='https://github.com/ethereumproject/emerald-wallet/graphs/contributors'>many wonderful contributors</a>.
                    </p>
                </div>
                <div>
                    <FlatButton label="Source"
                                labelPosition="before"
                                href="https://github.com/ethereumproject/emerald-wallet"
                                icon={<FontIcon className="fa fa-github" />}/>
                </div>
            </Col>
        </Row>
    </Dialog>;
};

export default AboutDialog;


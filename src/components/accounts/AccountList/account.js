import React from 'react';
import PropTypes from 'prop-types';
import { CardText } from 'material-ui/Card';
import { Row, Col } from 'react-flexbox-grid/lib/index';

import IdentityIcon from 'elements/IdentityIcon';
import Card from 'elements/Card';
import Button from 'elements/Button';
import { QrCodeIcon } from 'elements/Icons';
import AddressAvatar from '../../../elements/AddressAvatar/addressAvatar';
import SecondaryMenu from '../SecondaryMenu';
import AccountBalance from '../Balance';
import TokenBalances from '../TokenBalances';

import styles from './account.scss';
import TokenUnits from '../../../lib/tokenUnits';

export default class Account extends React.Component {

    static propTypes = {
        knownTokens: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        openAccount: PropTypes.func.isRequired,
        createTx: PropTypes.func,
        showReceiveDialog: PropTypes.func,
        showFiat: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            showTokens: false,
        };
    }

    switchDetails = () => {
        this.setState((prevState) => ({
            showTokens: !prevState.showTokens,
        }));
    }

    render() {
        const { account, openAccount, createTx, showReceiveDialog, knownTokens } = this.props;
        const { showFiat } = this.props;
        const { showTokens } = this.state;

        // TODO: we convert Wei to TokenUnits here
        const balance = account.get('balance') ? new TokenUnits(account.get('balance').value(), 18) : null;

        const tokens = account.get('tokens');
        const isHardware = (acc) => acc.get('hardware', false);

        return (
            <Card>
                <CardText>
                    <Row>
                        <Col xs={3}>
                            <div className={ styles.identityIconContainer }>
                                <IdentityIcon
                                    id={ account.get('id') }
                                    onClick={ this.switchDetails }
                                    expanded={ showTokens }
                                />
                                <div style={{marginLeft: '10px'}}>
                                    {balance && <AccountBalance
                                        balance={ balance }
                                        symbol="ETC"
                                        showFiat={ showFiat }
                                    />}
                                    {!balance && 'loading...'}
                                </div>
                            </div>
                        </Col>
                        <Col xs={5}>
                            <AddressAvatar
                                addr={ account.get('id') }
                                tertiary={ account.get('description') }
                                primary={ account.get('name') }
                                onAddressClick={ openAccount }
                            />
                        </Col>
                        <Col xs={4}>
                            <div className={ styles.actionsContainer }>
                                {!isHardware(account) && <SecondaryMenu account={account}/>}
                                <Button
                                    label="Add ETC"
                                    icon={<QrCodeIcon />}
                                    onClick={ showReceiveDialog }
                                />
                                <Button
                                    style={{marginLeft: '10px'}}
                                    label="Send"
                                    onClick={createTx}
                                />
                            </div>
                        </Col>
                    </Row>
                    { showTokens &&
                    (<div>
                        <Row>
                            <Col xs={12} lg={12} md={12} sm={12}>
                                <hr className={ styles.tokensDivider } />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} lg={12} md={12} sm={12} style={{marginLeft: '50px'}}>
                                <TokenBalances balances={ tokens } />
                            </Col>
                        </Row>
                    </div>)}
                </CardText>
            </Card>);
    }
}

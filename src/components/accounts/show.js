import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import QRCode from 'qrcode.react';
import log from 'loglevel';
import { translate } from 'react-i18next';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';

const TokenRow = ({ token }) => {
    const balance = token.get('balance') ? token.get('balance').getDecimalized() : '0';

    return (
        <div><span>{balance} {token.get('symbol')}</span></div>
    );
};
TokenRow.propTypes = {
    token: PropTypes.object.isRequired,
};


const Render = translate("accounts")(({ t, account, createTx }) => {
    const value = t("show.value", {value: account.get('balance') ? account.get('balance').getEther() : '?'});
    const pending = account.get('balancePending') ? `(${account.get('balancePending').getEther()} pending)` : null;

    return (
        <Card style={cardSpace}>
            <CardHeader
                title={t("show.header", {account: account.get('name') || account.get('id')})}
                subtitle={value}
                actAsExpander={true}
                showExpandableButton={true}
            />
            <CardActions>
                <FlatButton label={t("show.send")}
                            onClick={createTx}
                            icon={<FontIcon className="fa fa-arrow-circle-o-right" />}/>
            </CardActions>
            <CardText expandable={true}>
                <Row>
                    <Col xs={8}>
                        <DescriptionList>
                            {account.get('description') && <div>
                            <DescriptionTitle>{t("show.description.title")}</DescriptionTitle>
                            <DescriptionData>{account.get('description')}</DescriptionData>
                            </div>}

                            <DescriptionTitle>{t("show.description.address")}</DescriptionTitle>
                            <DescriptionData>{account.get('id')}</DescriptionData>

                            <DescriptionTitle>{t("show.description.sentTransactions")}</DescriptionTitle>
                            <DescriptionData>{account.get('txcount') || '0'}</DescriptionData>

                            <DescriptionTitle>{t("show.description.etherBalance")}</DescriptionTitle>
                            <DescriptionData>{value} {pending}</DescriptionData>

                            <DescriptionTitle>{t("show.description.tokenBalance")}</DescriptionTitle>
                            <DescriptionData>
                                {account
                                    .get('tokens')
                                    .map((tok) =>
                                        <TokenRow token={tok} key={tok.get('address')}/>
                                )}
                            </DescriptionData>

                        </DescriptionList>
                    </Col>
                    <Col xs={4} md={2} mdOffset={2}>
                        <QRCode value={account.get('id')} />
                    </Col>
                </Row>
            </CardText>
        </Card>
    );
});

Render.propTypes = {
    account: PropTypes.object.isRequired,
    createTx: PropTypes.func.isRequired,
};

const AccountShow = connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
        createTx: () => {
            const account = ownProps.account;
            log.debug('create tx from', account.get('id'));
            dispatch(gotoScreen('create-tx', account));
        },
    })
)(Render);

export default AccountShow;

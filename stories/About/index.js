import React from 'react';
import { storiesOf } from '@storybook/react';
import {Button} from 'emerald-js-ui';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import muiThemeable from 'material-ui/styles/muiThemeable';
import theme from 'emerald-js-ui/src/theme.json';
import { Logo as EtcLogo } from 'emerald-js-ui/lib/icons';

theme.button = {};
theme.flatButton = {};




class AboutClass extends React.Component {
    render() {
        const { muiTheme, onClick } = this.props;
        const styles = {
            links: {
                color: muiTheme.palette.textColor
            }
}
        return (
            <div style={{padding: '30px', position: 'relative'}}>
                <div style={{position: 'absolute', top: '-100px', right: '-160px'}}>
                    <EtcLogo height="300px" width="300px"/>
                </div>
                <h2 style={{ color: muiTheme.palette.primary1Color, fontWeight: '200', paddingBottom: '0px', marginBottom: '5px' }}>Emerald Wallet</h2>
                <div style={{marginBottom: '20px'}}>v0.0.16</div>
                <div style={{ color: muiTheme.palette.disabledColor }}>ETCDEVTEAM: Igor Artamonov, Isaac Ardis, Constantine Kryvomaz, Yury Gagarin, Tomasz Zdybal, Shane Jonas, Richard Schumann, Darcy Reno</div>
                <div style={{paddingTop: '40px', marginBottom: '60px'}}>
                    <Button primary label="Buy us a Pizza" />
                </div>
                <div style={{paddingBottom: '5px'}}>Copyright 2018 ETCDEVTeam</div>
                <div>
                    Licensed under <a style={styles.links} href="#">MIT License</a>
                    <span style={{float: 'right', textAlign: 'right'}}>
                        <a style={styles.links} href="#">Help & Support</a>
                        <a style={{paddingLeft: '5px', ...styles.links}} href="#">About Us</a>
                    </span>
                </div>
            </div>
        )
    }
}

const About = muiThemeable()(AboutClass);

storiesOf('About', module)
  .add('default', () => (<About onClick={() => console.log('clicked')}/>));


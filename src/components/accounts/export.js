import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon'
import { rpc } from 'lib/rpc'

/**
 * Export account keys file button
 */
class ExportAccountButtonRender extends React.Component {
    constructor (props) {
        super(props)
    }

    // from http://stackoverflow.com/questions/283956/
    saveAs = (uri, filename) => {
        const link = document.createElement('a')
        if (typeof link.download === 'string') {
            document.body.appendChild(link) // Firefox requires the link to be in the body
            link.download = filename
            link.href = uri
            link.click()
            document.body.removeChild(link) // remove the link when done
        } else {
            location.replace(uri)
        }
    }

    exportKeyFile = (address) => {
        const chain = this.props.chain

        rpc.call('emerald_exportAccount', [{address}, {chain}]).then((result) => {

            const fileData = {
                filename: `${address}.json`,
                mime: 'text/plain',
                contents: result,
            }

            const blob = new Blob([fileData.contents], {type: fileData.mime})
            const url = URL.createObjectURL(blob)
            this.saveAs(url, fileData.filename)
        })
    }

    handleClick = () => {
        const address = this.props.account.get('id')
        this.exportKeyFile(address)
    }

    render () {
        return (<MenuItem
            leftIcon={<FontIcon className="fa fa-hdd-o"/>}
            primaryText='EXPORT'
            onTouchTap={this.handleClick}/>)
    }
}

ExportAccountButtonRender.propTypes = {
    account: PropTypes.object.isRequired,
}

const ExportAccountButton = connect(
    (state, ownProps) => ({
        chain: state.network.getIn(['chain', 'name'])
    }),
    null
)(ExportAccountButtonRender)

export default ExportAccountButton

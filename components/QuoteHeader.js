import React from 'react'
import PropTypes from 'prop-types'
import './Quote.scss'
import config from '../../../config'
import { getFileUrl } from '../../../common/resource'

export default class QuoteHeader extends React.Component {
  static propTypes = {
    packageName: PropTypes.string,
    salesInsurer: PropTypes.object,
  }

  constructor (props) {
    super(props)
    this.state = {
      url: null
    }
  }

  componentWillMount () {
    this.setLogo(this.props.salesInsurer)
  }

  componentWillReceiveProps (nextProps) {
    let salesInsurer = nextProps.salesInsurer
    this.setLogo(salesInsurer)
  }

  setLogo (salesInsurer) {
    if (salesInsurer) {
      const filePath = `insurers/${salesInsurer.insurerCode}/logo.png`
      let url = getFileUrl(filePath)
      this.setState({ url })
    }
  }

  render () {
    let { packageName } = this.props
    return (
      <div id='product-header'>
        <div className='product-title'>
          {packageName}
        </div>
        <div className='product-logo'>
          <img src={this.state.url} />
        </div>
      </div>
    )
  }
}

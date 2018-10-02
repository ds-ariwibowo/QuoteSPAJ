import React from 'react'
import PropTypes from 'prop-types'
import './style.scss'
import browserHistory from '../../../../../common/history'

export default class ClauseList extends React.Component {
  static propTypes = {
    proposal: PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)
  }

  gotoClause(packageCode, productCode) {
    browserHistory.push(`clause/${packageCode}/${productCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
  }

  render () {
    let { proposal } = this.props
    return (
      <div className='clause-list-main'>
        {[...proposal.mainCoverages,...proposal.riderCoverages].map((product, index) =>
          <div className='clause-item' key={'product-clause_'+index} onClick={()=>this.gotoClause(proposal.packageCode, product.productCode)}>
            {product.productName}
          </div>
        )}
      </div>
    )
  }
}

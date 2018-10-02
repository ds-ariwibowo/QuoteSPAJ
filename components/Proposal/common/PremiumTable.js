import React from 'react'
import PropTypes from 'prop-types'
import './style.scss'
import codetable from '../../../../../codetable'
import {formatNumber, t} from '../../../../../common/utils'

export default class PremiumTable extends React.Component {
  static propTypes = {
    proposal: PropTypes.object.isRequired,
  }

  render () {
    let {proposal} = this.props;
    return (
      <div className='first-year-list accordion-list'>
        <table className='first-year-table'>
          <thead>
            <tr>
              <th>{t('Product')}</th>
              <th>{t('Sum Assured')}</th>
              <th>{t('Coverage Period')}</th>
              <th>{t('Charge Period')}</th>
              <th>{t('First Year Premium')}</th>
            </tr>
          </thead>
          <tbody>
            {[...proposal.mainCoverages,...proposal.riderCoverages].map((coveragePrem, index)=>
              <tr key={'plan-first-year-premium-row_'+index}>
                <td>{coveragePrem.productName}</td>
                <td>{coveragePrem.sa ? (codetable.moneySign[proposal.moneyId]||'') + formatNumber(coveragePrem.sa) : '--'}</td>
                <td>{t(codetable.coveragePeriod[coveragePrem.coveragePeriod.periodType], coveragePrem.coveragePeriod.periodValue)}</td>
                <td>{t(codetable.chargePeriod[coveragePrem.chargePeriod.periodType], coveragePrem.chargePeriod.periodValue)}</td>
                <td>{coveragePrem.firstYearPrem ? (codetable.moneySign[proposal.moneyId]||'') + formatNumber(coveragePrem.firstYearPrem) : '--'}</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className='sum'>
          <span className='sum-title'>{t('Total')}</span>
          <span className='redcolor sum-amount'>{(codetable.moneySign[proposal.moneyId]||'')}{proposal.totalFirstYearPrem}</span>
        </div>
      </div>
    )
  }
}

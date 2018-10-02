import React from 'react'
import PropTypes from 'prop-types'
import './Quote.scss'
import {formatNumber, t} from '../../../common/utils'
import codetable from '../../../codetable'
import 'animate.css/animate.css'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class FirstYearPremiumTable extends React.Component {
  static propTypes = {
    calcPremium: PropTypes.object,
    hidden: PropTypes.bool,
    moneySign: PropTypes.string,
  }

  constructor(props) {
    super(props)
  }

  render() {
    let {calcPremium, moneySign, hidden} = this.props
    if(!calcPremium) {
      return null;
    }
    return (
      <ReactCSSTransitionGroup
        transitionName={{
          enter: 'animated',
          enterActive: 'zoomIn',
          leave: 'animated',
          leaveActive: 'zoomOut'
        }}
        transitionEnterTimeout={1000}
        transitionLeaveTimeout={500}
      >
        {hidden? null :
          <table className="first-year-table" style={hidden?{display:'none'}:{}}>
            <thead>
            <tr>
              <th width="20%">{t('Product')}</th>
              <th width="20%">{t('Sum Assured')}</th>
              <th width="20%">{t('Coverage Period')}</th>
              <th width="20%">{t('Charge Period')}</th>
              <th width="20%">{t('First Year Premium')}</th>
            </tr>
            </thead>
            <tbody>
            {calcPremium.coveragePrems.map((coveragePrem, index)=>
              <tr key={index}>
                <td>{coveragePrem.productName}{typeof coveragePrem.insuredIndex === "number"? <span className="color-red">({t('LA')}{coveragePrem.insuredIndex+1})</span> : null}</td>
                <td>{coveragePrem.sa ? moneySign + formatNumber(coveragePrem.sa) : '--'}</td>
                <td>{t(codetable.coveragePeriod[coveragePrem.coveragePeriod.periodType], coveragePrem.coveragePeriod.periodValue)}</td>
                <td>{t(codetable.chargePeriod[coveragePrem.chargePeriod.periodType], coveragePrem.chargePeriod.periodValue)}</td>
                <td>{coveragePrem.premAn ? moneySign + formatNumber(coveragePrem.premAn) : '--'}</td>
              </tr>
            )}
            </tbody>
          </table>
        }

      </ReactCSSTransitionGroup>
    )
  }
}



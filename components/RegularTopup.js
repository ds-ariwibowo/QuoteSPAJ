import React from 'react'
import PropTypes from 'prop-types'
import './Quote.scss'
import {t} from '../../../common/utils'
import FundAllocation from './FundAllocation'
import {
  FormattedNumber
} from '../../../components/Form'

const MAX_AMOUNT = 9999999999;
export default class RegularTopup extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    funds: PropTypes.array,
    maxChargeYear: PropTypes.number,
    minAmount: PropTypes.number,
    maxAmount: PropTypes.number,
    productCode: PropTypes.string,
    readOnly: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    let value = {
      investRates: [],
      regularTopup: {
        startYear: 1,
        endYear: this.props.maxChargeYear,
        premType: '2',
        amount: 0,
      },
    };
    if (this.props.value) {
      value = Object.assign(value, this.props.value);
      value.regularTopup.endYear = this.props.maxChargeYear;
    }
    this.state = { value };
  }

  componentWillReceiveProps(nextProps) {
    let value = {
      investRates: [],
      regularTopup: {
        startYear: 1,
        endYear: nextProps.maxChargeYear,
        premType: '3',
        amount: 0,
      },
    };
    if (nextProps.value) {
      value = Object.assign(value, nextProps.value);
      value.regularTopup.endYear = nextProps.maxChargeYear;
    }
    this.setState({ value });
  }

  onRegularTopupChange(pvalue) {
    let value = this.state.value;
    let regularTopup = value.regularTopup;
    regularTopup.startYear = 1;
    regularTopup.amount = parseFloat(pvalue) || 0;
    regularTopup.endYear = this.props.maxChargeYear;
    this.setState({ value }, () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  onInvestRatesChange(rateList, premType) {
    let value = this.state.value;
    value.investRates = [];
    let investRates = value.investRates;
    for (let rate of rateList) {
      rate.premType = premType;
      investRates.push(rate);
    }
    console.log('regularTopup investRates', investRates);
    this.setState({ value }, () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  render() {
    return (
      <div className="quote-form-group">
        <div className="group-header">
          <i
            className="header-i iconfont icon-money2"
          />
          <span className="header-title">{t('Regular Topup')}</span>
        </div>
        <div className="make-plan-premium">
          <table className="make-plan-premium-table">
            <tbody>
            <tr>
              <td width="50%">{t('Amount: ')}</td>
              <td width="50%">
                <FormattedNumber id="regularTopup" readOnly={this.props.readOnly}
                       value={this.state.value.regularTopup.amount}
                       onChange={value=>this.onRegularTopupChange(value)}
                       min={this.props.minAmount || 0} max={this.props.maxAmount || MAX_AMOUNT}
                       pattern="[0-9]*" className="table-input"/>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <FundAllocation readOnly={this.props.readOnly} value={this.state.value.investRates} funds={this.props.funds} onChange={(rateList)=>this.onInvestRatesChange(rateList, '3')} productCode={this.props.productCode}/>
      </div>
    )
  }
}



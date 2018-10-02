import React from 'react'
import PropTypes from 'prop-types'
import './Quote.scss'
import {t} from '../../../common/utils'
import FundAllocation from './FundAllocation'
import {
  FormattedNumber
} from '../../../components/Form'

const MAX_AMOUNT = 9999999999;
export default class SingleTopup extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    funds: PropTypes.array,
    maxCoverageYear: PropTypes.number,
    minAmount: PropTypes.number,
    maxAmount: PropTypes.number,
    productCode: PropTypes.string,
    readOnly: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    let value = {
      investRates: [],
      singleTopups: [],
    };
    if (this.props.value) {
      value = Object.assign(value, this.props.value);
    }
    this.state = { value };
  }

  componentWillReceiveProps(nextProps) {
    let value = {
      investRates: [],
      singleTopups: [],
    };
    if (nextProps.value) {
      value = Object.assign(value, nextProps.value);
    }
    this.setState({ value });
  }

  addSingleTopup() {
    let value = this.state.value;
    let singleTopups = value.singleTopups;
    singleTopups.push({ startYear: 0, endYear: 0, premType: '4', amount: 0 });
    this.setState({ value },  () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  removeSingleTopup(index) {
    let value = this.state.value;
    let singleTopups = value.singleTopups;
    singleTopups = singleTopups.splice(index, 1);
    this.setState({ value },  () => {
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
    console.log('singleTopup investRates', investRates);
    this.setState({ value }, () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  onSingleTopupStartYearChange(index, pvalue) {
    let value = this.state.value;
    let singleTopup = value.singleTopups[index];
    let startYear = parseInt(pvalue) || 0;
    singleTopup.startYear = startYear;
    singleTopup.endYear = startYear;
    this.setState({ value }, () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  onSingleTopupAmountChange(index, pvalue) {
    let value = this.state.value;
    let singleTopup = value.singleTopups[index];
    let amount = parseFloat(pvalue) || 0;
    singleTopup.amount = amount;
    this.setState({ value }, () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  render() {
    return (
      <div className="quote-form-group">
        <div className="group-header">
          <img
            className="header-i iconfont icon-money2"
          />
          <span className="header-title">{t('Single Topup')}</span>
        </div>
        <div className="make-plan-premium">
          <table className="make-plan-premium-table">
            <tbody>
            <tr>
              <th width="2%">#</th>
              <th width="32%">{t('Topup Year')}</th>
              <th width="64%">{t('Topup Amount')}</th>
              <th width="2%">
                {!this.props.readOnly && <i className="iconfont icon-add" onClick={this.addSingleTopup.bind(this)}/>}
              </th>
            </tr>
            {this.state.value.singleTopups.map((topupWithdraw,index) =>
              <tr key={'singleTopup_'+index}>
                <td>{index+1}</td>
                <td>
                  <input readOnly={this.props.readOnly} value={topupWithdraw.startYear} min="1" max={this.props.maxCoverageYear} onChange={e=>this.onSingleTopupStartYearChange(index, e.target.value)} type="number" pattern="[0-9]*" className="table-input"/>
                </td>
                <td>
                  <FormattedNumber readOnly={this.props.readOnly} value={topupWithdraw.amount} min={this.props.minAmount || 0} max={this.props.maxAmount || MAX_AMOUNT} onChange={value=>this.onSingleTopupAmountChange(index, value)} pattern="[0-9]*" className="table-input form-control"/>
                </td>
                <td>
                  {!this.props.readOnly && <i  className="iconfont icon-delete" onClick={()=>this.removeSingleTopup(index)}/>}
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
        <FundAllocation readOnly={this.props.readOnly} value={this.state.value.investRates} funds={this.props.funds} onChange={(rateList)=>this.onInvestRatesChange(rateList, '4')} productCode={this.props.productCode}/>
      </div>
    )
  }
}



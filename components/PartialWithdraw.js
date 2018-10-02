import React from 'react'
import PropTypes from 'prop-types'
import './Quote.scss'
import {t} from '../../../common/utils'
import FundAllocation from './FundAllocation'
import {
  FormattedNumber
} from '../../../components/Form'

const MAX_AMOUNT = 9999999999;
export default class PartialWithdraw extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    maxCoverageYear: PropTypes.number,
    minAmount: PropTypes.number,
    maxAmount: PropTypes.number,
    productCode: PropTypes.string,
  }

  constructor(props) {
    super(props);
    let value = {
      investRates: [],
      partialWithdraws: [],
    };
    if (this.props.value) {
      value = Object.assign(value, this.props.value);
    }
    this.state = { value };
  }

  componentWillReceiveProps(nextProps) {
    let value = {
      investRates: [],
      partialWithdraws: [],
    };
    if (nextProps.value) {
      value = Object.assign(value, nextProps.value);
    }
    this.setState({ value });
  }

  addPartialWithdraw() {
    let value = this.state.value;
    let partialWithdraws = value.partialWithdraws;
    partialWithdraws.push({ startYear: 0, endYear: 0, premType: '7', amount: 0 });
    this.setState({ value },  () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  removePartialWithdraw(index) {
    let value = this.state.value;
    let partialWithdraws = value.partialWithdraws;
    partialWithdraws = partialWithdraws.splice(index, 1);
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

  onPartialWithdrawStartYearChange(index, pvalue) {
    let value = this.state.value;
    let partialWithdraw = value.partialWithdraws[index];
    let startYear = parseInt(pvalue) || 0;
    partialWithdraw.startYear = startYear;
    this.setState({ value }, () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  onPartialWithdrawEndYearChange(index, pvalue) {
    let value = this.state.value;
    let partialWithdraw = value.partialWithdraws[index];
    let endYear = parseInt(pvalue) || 0;
    partialWithdraw.endYear = endYear;
    this.setState({ value }, () => {
      this.props.onChange && this.props.onChange(this.state.value);
    });
  }

  onPartialWithdrawAmountChange(index, pvalue) {
    let value = this.state.value;
    let partialWithdraw = value.partialWithdraws[index];
    let amount = parseFloat(pvalue) || 0;
    partialWithdraw.amount = amount;
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
          <span className="header-title">{t('Partial Withdraw')}</span>
        </div>
        <div className="make-plan-premium">
          <table className="make-plan-premium-table">
            <tbody>
            <tr>
              <th width="2%">#</th>
              <th width="44%" colSpan="2" >{t('Withdraw Year')}<br/>{t('From ~ To')}</th>
              <th width="52%">{t('Withdraw Amount')}<br/>{t('(per year)')}</th>
              <th width="2%"><i className="iconfont icon-add" onClick={this.addPartialWithdraw.bind(this)}/>
              </th>
            </tr>
            {this.state.value.partialWithdraws.map((topupWithdraw,index) =>
              <tr key={'partialWithdraw_'+index}>
                <td>{index+1}</td>
                <td>
                  <input value={topupWithdraw.startYear} onChange={e=>this.onPartialWithdrawStartYearChange(index, e.target.value)} min="1" max={this.props.maxCoverageYear} type="number" pattern="[0-9]*" className="table-input"/>
                </td>
                <td>
                  <input value={topupWithdraw.endYear} onChange={e=>this.onPartialWithdrawEndYearChange(index, e.target.value)} min="1" max={this.props.maxCoverageYear} type="number" pattern="[0-9]*" className="table-input"/>
                </td>
                <td>
                  <FormattedNumber value={topupWithdraw.amount} onChange={value=>this.onPartialWithdrawAmountChange(index, value)} min={this.props.minAmount || 0} max={this.props.maxAmount || MAX_AMOUNT} pattern="[0-9]*" className="table-input"/>
                </td>
                <td>
                  <i className="iconfont icon-delete" onClick={()=>this.removePartialWithdraw(index)}/>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
        {this.state.value.partialWithdraws.length > 0 ?
          <div className="make-plan-add-fund-error">
            {t("Tips: The excess part of the withdraw application (if any) will be skipped automatically.")}
          </div>
          : null
        }
      </div>
    )
  }
}



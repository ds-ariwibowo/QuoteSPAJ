import React from 'react'
import PropTypes from 'prop-types'
import Dialog from 'material-ui/Dialog'

import {t} from '../../../common/utils';
import './Quote.scss';

class TableRow extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    rate: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  handleCheckboxChange(e) {
    this.props.rate.checked = !this.props.rate.checked;
    if (!this.props.rate.checked) {
      this.props.rate.assignRate = 0;
    }
    this.setState({},()=>this.props.onChange && this.props.onChange(this.props.rate));
  }

  handleRateChange(e){
    let assignRate = parseInt(e.target.value);
    if (!assignRate || assignRate < 0) {
      assignRate = 0;
    }
    this.props.rate.assignRate = parseFloat((assignRate / 100).toFixed(2));
    this.setState({},()=>this.props.onChange && this.props.onChange(this.props.rate));
  }

  render() {
    return(
    <tr>
      <td><input type="checkbox" className="table-input" style={{width:'30px'}} checked={this.props.rate.checked} onChange={this.handleCheckboxChange.bind(this)}/></td>
      <td>{this.props.rate.fundCode}</td>
      <td>{this.props.rate.fundName}</td>
      <td><input type="number" pattern="[0-9]*" min="0" max="100" className="table-input" style={{width:'calc(75%)'}} value={parseInt((this.props.rate.assignRate * 100).toFixed(0))} onChange={this.handleRateChange.bind(this)} disabled={!this.props.rate.checked}/>%</td>
    </tr>
    )
  }
}

export default class FundAllocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value : this.props.value,
      addFundDialogOpen: false,
    };
    this.rateList = [];
  }

  static propTypes = {
    funds: PropTypes.array.isRequired,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    productCode: PropTypes.string,
    readOnly: PropTypes.bool,
  }

  showAddFundDiolog() {
    this.rateList = [];
    this.props.funds.map((fund,index)=> {
      let existRate = this.props.value.find((rate=>rate.fundCode===fund.fundCode));
      let rate = {
        fundCode:fund.fundCode,
        fundName: fund.fundName,
        assignRate: existRate? existRate.assignRate: 0,
        checked: !!existRate
      };
      this.rateList.push(rate);
    });
    this.setState({addFundDialogOpen: true})
  }

  handleAddFundClose() {
    this.setState({addFundDialogOpen: false})
  }

  confirmNewValue(){
    let newValue = this.getAllValidRates();
    this.props.onChange && this.props.onChange(newValue);
    this.setState({value:newValue});
    this.handleAddFundClose();
  }

  getAllValidRates() {
    let newValue = [];
    let minRate = 0.01
    if (this.props.productCode === 'AVRAIPRNLG') {
      minRate = 0.1
    }
    this.rateList.map(rate => {
      if (rate.checked && rate.assignRate >= minRate) {
        let newRate = {fundCode:rate.fundCode,assignRate:rate.assignRate};
        newValue.push(newRate);
      }
    });
    return newValue;
  }

  isAddableRates() {
    let hasChecked = false
    let minRate = this.getMinRate()
    for (let rate of this.rateList) {
      if (rate.checked && rate.assignRate < minRate) {
        return false
      } else if (rate.checked) {
        hasChecked = true
      }
    }
    if (!hasChecked) {
      return true
    }
    let newValue = this.getAllValidRates();
    if (newValue.length === 0) {
      return false;
    }
    let total = 0;
    for (let rate of newValue) {
      total += rate.assignRate;
    }
    return parseFloat(total.toFixed(2)) === 1.0;
  }

  getFundNameByCode(code) {
    for(let fund of this.props.funds) {
      if (fund.fundCode === code) {
        return fund.fundName;
      }
    }
    return '';
  }

  getMinRate() {
    let minRate = 0.01
    if (['AVRAIPRNLG', 'AIAIFELRPX'].includes(this.props.productCode)) {
      minRate = 0.1
    } else if (['AIAVASLFRP'].includes(this.props.productCode)) {
      minRate = 0.05
    }
    return minRate
  }

  render() {
    return (
      <div className="make-plan-fund">
        <Dialog open={this.state.addFundDialogOpen}
                onRequestClose={this.handleAddFundClose.bind(this)}
                contentStyle={{width:'95%', maxWidth: 'none'}} bodyStyle={{overflowY: 'auto'}}>
          <table className='make-plan-fund-table'>
            <tbody>
            <tr>
              <th width="5%">#</th>
              <th width="25%">{t('Fund Code')}</th>
              <th width="45%">{t('Fund Name')}</th>
                <th width="25%">{t('Apportion')}</th>
            </tr>
            {this.rateList.map((rate, index)=>
              <TableRow key={'fund_'+index} rate={rate} onChange={()=>this.setState({})}/>
            )}
            </tbody>
          </table>
          <div className="make-plan-add-fund-error">
            {this.isAddableRates()? '' : t('Fund Apportion should be not less than {0}, and the total apportion should be 100%!', (this.getMinRate() * 100).toFixed(0)) }
          </div>
          <div className="make-plan-fund-btns">
            <input type="button" className="btn" onClick={this.handleAddFundClose.bind(this)} value={t('Cancel')} style={{'marginRight': '10px'}} />
            <input type="button" disabled={!this.isAddableRates()} className="btn" onClick={this.confirmNewValue.bind(this)} value={t('OK')} style={{'marginLeft': '10px'}} />
          </div>
        </Dialog>
        {this.state.value.length>0?
          <table className='first-year-table'>
            <tbody>
            <tr>
              <th width="10%">#</th>
              <th width="60%">{t('Fund')}</th>
              <th width="30%">{t('Apportion')}(%)</th>
            </tr>
            {this.state.value.map((rate,index)=>
              <tr key={'rate_'+index}>
                <td>{index+1}</td>
                <td>{rate.fundCode + ' - ' + this.getFundNameByCode(rate.fundCode)}</td>
                <td>{parseInt((rate.assignRate * 100).toFixed(0))}</td>
              </tr>
            )}
            </tbody>
          </table>
          : null
        }
        {!this.props.readOnly &&
        <div className="add-fund" onClick={this.showAddFundDiolog.bind(this)}>
          {this.state.value.length > 0 ? <i className="iconfont icon-edit"/> : <i className="iconfont icon-add"/>}
          <span>{this.state.value.length > 0 ? t('Edit Fund') : t('Add Fund')}</span>
        </div>
        }
      </div>
    )
  }

}



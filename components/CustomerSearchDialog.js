import React from 'react'
import PropTypes from 'prop-types'
import './Quote.scss'
import Dialog from 'material-ui/Dialog'
import SearchBar from '../../../components/SearchBar'
import {t, getAgeByBirthday } from '../../../common/utils'

export default class CustomerSearchDialog extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onSearchClick: PropTypes.func,
    onItemClick: PropTypes.func,
    onRequestClose: PropTypes.func,
    customers: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = {
      contactSearch: ''
    }
  }

  scrollToAlpha(alpha) {
    let obj = document.getElementById(alpha);
    obj && obj.scrollIntoView();
  }

  render() {
    let {open, onItemClick, onSearchClick, onRequestClose, customers} = this.props
    return (
      <Dialog open={open}
              onRequestClose={()=>onRequestClose && onRequestClose()}
              contentStyle={{width:'90%', maxWidth: 'none'}} bodyStyle={{top: 0}}>
        <SearchBar value={this.state.contactSearch} placeholder={t("Name/Telephone")}
                   lang={{cancel: t('Cancel'), confirm: t('Confirm')}}
                   onChange={text=>this.setState({contactSearch:text})}
                   onSubmit={()=>onSearchClick && onSearchClick(this.state.contactSearch)}
                   onCancel={()=>this.setState({contactSearch:''},()=>onSearchClick && onSearchClick(this.state.contactSearch))}
                   onClear={()=>this.setState({contactSearch:''},()=>onSearchClick && onSearchClick(this.state.contactSearch))}/>
        <ul id="personal-customer-main">
          {customers? ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((alpha,index)=>
            {return (customers[alpha] && customers[alpha].length>0)?
              <li className="personal-customer-item" key={alpha}>
                <div className="personal-customer-item-title" id={alpha}>{alpha}</div>
                <div className="personal-customer-item-content">
                  {customers[alpha].map((customer,index)=>
                    <p key={alpha+index} onClick={()=>onItemClick && onItemClick(customer)}>
                      {customer.name}
                      <span className="sp_old">{customer.birthday? (getAgeByBirthday(customer.birthday) + t(' Years Old')): customer.age !== null? (customer.age + t(' Years Old')) : null}</span>
                    </p>
                  )}
                </div>
              </li> : null}
          ) : null}
          <ul id="customer-filter">
            {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((alpha,index)=> {
              return (!customers || (customers[alpha] && customers[alpha].length > 0)) ?
                <li key={alpha} onClick={()=>this.scrollToAlpha(alpha)}>{alpha}</li> : null}
            )}
          </ul>
        </ul>
      </Dialog>
    )
  }
}


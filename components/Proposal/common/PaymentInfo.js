import React from 'react'
import PropTypes from 'prop-types'
import './style.scss'
import {t} from '../../../../../common/utils'

function getAddressLabel(data, level, value) {
  let label = ''
  for (let province of data) {
    if (province.value === value.province) {
      label += province.label
      if (level > 1) {
        let cities = province.children || []
        for (let city of cities) {
          if (city.value === value.city) {
            label += '-' + city.label
            if (level > 2) {
              let regions = city.children || []
              for (let region of regions) {
                if (region.value === value.region) {
                  label += '-' + region.label
                  break
                }
              }
            }
            break
          }
        }
      }
      break
    }
  }
  return label
}

function getBankName (bankData, bankCode) {
  for (let bank of bankData.bankInfo) {
    if(bankCode === bank.bankCode) {
      return bank.bankName
    }
  }
  return ''
}

export default class PaymentInfo extends React.Component {
  static propTypes = {
    payerAccount: PropTypes.object.isRequired,
    payerName: PropTypes.string.isRequired,
    CompanyComponents: PropTypes.object.isRequired,
  }

  render() {
    let {payerAccount, payerName, CompanyComponents} = this.props
    return (
      <div className='check-list'>
        <div className='item'>
          <span className='label'>{t('Payment Method: ')}</span>
          <span className='value'>{t('Debit Card')}</span>
        </div>
        <div className='item'>
          <span className='label'>{t('Account Name: ')}</span>
          <span className='value'>
            {payerName}
          </span>
        </div>
        <div className='item'>
          <span className='label'>{t('Bank Account: ')}</span>
          <span className='value'>
            {payerAccount.bankAccount.bankAccount}
          </span>
        </div>
        <div className='item'>
          <span className='label'>{t('Bank Name: ')}</span>
          <span className='value'>
            {getBankName(CompanyComponents.BankData, payerAccount.bankAccount.bankCode)}
          </span>
        </div>
        <div className='item'>
          <span className='label'>{t('Bank of City: ')}</span>
          <span className='value'>
            {getAddressLabel(CompanyComponents.BankAddressData, 2, {
              province : payerAccount.bankAccount.bankAccountProvince,
              city: payerAccount.bankAccount.bankAccountCity,
            })}
          </span>
        </div>
      </div>
    )
  }
}

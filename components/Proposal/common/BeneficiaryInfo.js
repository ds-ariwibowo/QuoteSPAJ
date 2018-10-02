import React from 'react'
import PropTypes from 'prop-types'
import './style.scss'
import {t} from '../../../../../common/utils'

function getOptionLabel(options, value) {
  if (!options || !value) {
    return ''
  }
  for (let option of options) {
    if (value == option.value) {
      return option.label
    }
  }
  return ''
}

export default class BeneficiaryInfo extends React.Component {
  static propTypes = {
    person: PropTypes.object.isRequired,
    CompanyComponents: PropTypes.object,
  }

  render() {
    const NATIONALITIES = {
      '156': t('INDONESIA'),
      '-1': t('Others'),
    }
    let {person, CompanyComponents} = this.props
    return (
      <div className='check-list'>
        <div className='item'>
          <span className='label'>{t("Is Insured's: ")}</span>
            <span className='value'>
              {getOptionLabel(CompanyComponents? CompanyComponents.BeneficiaryInsuredRelations : [], person.relToInsured)}
            </span>
        </div>
        <div className='item'>
          <span className='label'>{t('Name: ')}</span>
          <span className='value'>
            {person.name}
          </span>
        </div>

        <div className='item'>
          <span className='label'>{t('Share Rate: ')}</span>
            <span className='value'>
              {parseInt((person.shareRate*100).toFixed(0))}%
            </span>
        </div>

        <div className='item'>
          <span className='label'>{t('Nationality: ')}</span>
            <span className='value'>
              {NATIONALITIES[person.nationality]}
            </span>
        </div>

        <div className='item'>
          <span className='label'>{t('ID Type: ')}</span>
          <span className='value'>
            {getOptionLabel(CompanyComponents? CompanyComponents.CertiTypes : [], person.certiType)}
          </span>
        </div>

        <div className='item'>
          <span className='label'>{t('ID Number: ')}</span>
          <span className='value'>
            {person.certiCode}
          </span>
        </div>

        <div className='item'>
          <span className='label'>{t('ID Validity Period: ')}</span>
            <span className='value'>
              {person.certiEndDate || t('Long Term')}
            </span>
        </div>

        <div className='item'>
          <span className='label'>{t('Birthday: ')}</span>
            <span className='value'>
              {person.birthday}
            </span>
        </div>

        <div className='item'>
          <span className='label'>{t('Gender: ')}</span>
            <span className='value'>
              {person.gender === 'M' ? t('Male') : t('Female')}
            </span>
        </div>

        <div className='item'>
          <span className='label'>{t('Mobile Number: ')}</span>
            <span className='value'>
              {person.mobile}
            </span>
        </div>
      </div>
    )
  }
}

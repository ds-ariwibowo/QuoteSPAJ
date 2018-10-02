import React from 'react'
import PropTypes from 'prop-types'
import './style.scss'
import {transNumber, t} from '../../../../../common/utils'

function getAddressLabel(data, level, value) {
  if (!data || data.length === 0 || !value) {
    return value
  }
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

export default class PersonInfo extends React.Component {
  static propTypes = {
    person: PropTypes.object.isRequired,
    CompanyComponents: PropTypes.object,
  }

  render () {
    const NATIONALITIES = {
      '156': t('INDONESIA'),
      '-1': t('Others'),
    }
    let {person, CompanyComponents} = this.props
    let personProperties = [
      <div className='item' key='name'>
        <span className='label'>{t('Name: ')}</span>
        <span className='value'>
          {person.name}
        </span>
      </div>,

      <div className='item' key='nationality'>
        <span className='label'>{t('Nationality: ')}</span>
            <span className='value'>
              {NATIONALITIES[person.nationality]}
            </span>
      </div>,

      <div className='item' key='certiType'>
        <span className='label'>{t('ID Type: ')}</span>
        <span className='value'>
          {getOptionLabel(CompanyComponents? CompanyComponents.CertiTypes : [], person.certiType)}
        </span>
      </div>,

      <div className='item' key='certiCode'>
        <span className='label'>{t('ID Number: ')}</span>
        <span className='value'>
          {person.certiCode}
        </span>
      </div>,

      <div className='item' key='certiEndDate'>
        <span className='label'>{t('ID Validity Period: ')}</span>
        <span className='value'>
          {person.certiEndDate || t('Long Term')}
        </span>
      </div>,

      <div className='item' key='birthday'>
        <span className='label'>{t('Birthday: ')}</span>
        <span className='value'>
          {person.birthday}
        </span>
      </div>,

      <div className='item' key='gender'>
        <span className='label'>{t('Gender: ')}</span>
        <span className='value'>
          {person.gender==='M' ? t('Male') : t('Female')}
        </span>
      </div>,

      <div className='item' key='age'>
        <span className='label'>{t('Age: ')}</span>
        <span className='value'>
          {person.age}
        </span>
      </div>
    ]
    if (person.marriageStatus) {
      personProperties.push(
        <div className='item' key='marriageStatus'>
          <span className='label'>{t('Marriage Status')}</span>
            <span className='value'>
              {getOptionLabel(CompanyComponents? CompanyComponents.MarriageStatuses : [], person.marriageStatus)}
            </span>
        </div>
      )
    }
    personProperties.push(...[
      <div className='item' key='mobile'>
        <span className='label'>{t('Mobile Number: ')}</span>
        <span className='value'>
          {person.mobile}
        </span>
      </div>,

      <div className='item' key='email'>
        <span className='label'>{t('Email: ')}</span>
        <span className='value'>
          {person.email}
        </span>
      </div>,

      <div className='item' key='addresses'>
        <span className='label'>{t('Address')}</span>
        <span className='value'>
          {getAddressLabel(CompanyComponents? CompanyComponents.AddressData : [], 3, person.addresses[0])}
        </span>
      </div>,

      <div className='item' key='address'>
        <span className='label'></span>
        <span className='value'>
          {person.addresses[0].address}
        </span>
      </div>,

      <div className='item' key='postCode'>
        <span className='label'>{t('Post Code: ')}</span>
        <span className='value'>
          {person.addresses[0].postCode}
        </span>
      </div>
    ])
    if (person.jobCateId) {
      personProperties.push(
        <div className='item' key='jobCate'>
          <span className='label'>{t('Occupation Class: ')}</span>
          <span className='value'>
            {t('Class {0}', person.nationality == '156'? transNumber(person.jobCateId) : person.jobCateId)}
          </span>
        </div>
      )
    }
    personProperties.push(...[
      <div className='item' key='workplace'>
        <span className='label'>{'Company Name: '}</span>
        <span className='value'>
          {person.extraProperties && person.extraProperties.workplace}
        </span>
      </div>
    ])
    if (person.height) {
      personProperties.push(
        <div className='item' key='height'>
          <span className='label'>{t('Height: ')}</span>
          <span className='value'>
            {person.height}{t('cm')}
          </span>
        </div>
      )
    }
    if (person.weight) {
      personProperties.push(
        <div className='item' key='weight'>
          <span className='label'>{t('Weight: ')}</span>
          <span className='value'>
            {person.weight}{t('kg')}
          </span>
        </div>
      )
    }
    if (person.income) {
      personProperties.push(
        <div className='item' key='income'>
          <span className='label'>{t('Income (yearly): ')}</span>
          <span className='value'>
            {person.income}
          </span>
        </div>
      )
    }
    return (
      <div className='check-list'>
        {person.laPhRela
          && <div className='item'>
            <span className='label'>{t("Is Policyholder's: ")}</span>
            <span className='value'>
              {getOptionLabel(CompanyComponents? CompanyComponents.InsuredProposerRelations : [], person.laPhRela)}
            </span>
          </div>
          }
        {person.laPhRela && person.laPhRela == 1 ? null : personProperties}
      </div>
    )
  }
}

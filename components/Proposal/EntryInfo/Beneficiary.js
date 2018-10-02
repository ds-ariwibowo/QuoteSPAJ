import React from 'react'
import PropTypes from 'prop-types'
import 'weui'
import 'react-weui/build/packages/react-weui.css'
import './EntryInfo.scss'

import {
  FormGroup,
  FormInput,
  FormSelect,
  FormDate,
  FormSwitch,
  FormRadio,
} from '../../../../../components/Form'
import companies from '../../../../../companies'
import {
  getToday,
  getBirthdayFromToday,
  verifyIDCard,
  getAgeFromIDCard,
  getBirthFromIDCard,
  getGenderFromIDCard,
  getAgeByBirthday,
  t
} from '../../../../../common/utils'
import { Tip } from '../../../../../components/Popup'

export default class Beneficiary extends React.Component {
  static propTypes = {
    index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.func,
    CompanyComponents: PropTypes.object
  }

  constructor (props) {
    super(props)
  }

  onCertiCodeInputBlur (index, value) {
    const beneficiary = this.props.model
    let certiType = beneficiary.certiType
    let nationality = beneficiary.nationality
    if (certiType == 1 && nationality == '156' && value) {
      if (!verifyIDCard(value)) {
        this.refs.tip.show(t('Please input correct ID number of!'))
      } else {
        let age = getAgeFromIDCard(value)
        let birth = getBirthFromIDCard(value)
        let gender = getGenderFromIDCard(value)
        beneficiary.age = age
        beneficiary.birthday = birth
        beneficiary.gender = gender
        this.props.onChange(index, beneficiary)
      }
    }
  }
  onBeneficiaryPropertyChange (index, property, value, type) {
    if (type === 'int') value = parseInt(value) || 0
    if (type === 'float') value = parseFloat(value) || 0

    const beneficiary = this.props.model

    beneficiary[property] = value

    this.props.onChange(index, beneficiary)
  }

  onBirthdayChange(index, value) {
    let age = getAgeByBirthday(value)
    const beneficiary = this.props.model
    beneficiary.birthday = value
    beneficiary.age = age
    this.props.onChange(index, beneficiary)
  }

  onShareRateChange (index, value) {
    let rate = parseInt(value) || 0;
    rate = parseFloat((rate / 100).toFixed(2))
    const beneficiary = this.props.model
    beneficiary.shareRate = rate
    this.props.onChange(index, beneficiary)
  }

  toggleCertiEndDate (index, on) {
    const beneficiary = this.props.model
    if (!on) {
      beneficiary.certiEndDate = getToday()
    } else {
      beneficiary.certiEndDate = null
    }
    this.props.onChange(index, beneficiary)
  }

  render () {
    const NATION_OPTIONS = [
      { value: 156, label: t('INDONESIA') },
      { value: -1, label: t('Others') }
    ]
    const GENDER_OPTIONS = [
      { value: 'M', label: t('Male') },
      { value: 'F', label: t('Female') },
    ]
    const { uniqueKey, index, CompanyComponents } = this.props

    return (
      <FormGroup
        title={t('Beneficiary') + (index + 1)}
        iconfont="icon-person"
        buttonTitle={t('Delete')}
        onButtonClick={() => this.props.delete(index)}
      >
        <Tip ref="tip" />
        <FormInput
          id={`name_${uniqueKey}`}
          label={t('Name: ')}
          required
          maxLength={50}
          value={this.props.model.name}
          onChange={value =>
            this.onBeneficiaryPropertyChange(index, 'name', value)}
        />
        <FormSelect
          id={`relationship_${uniqueKey}`}
          label={t("Is Insured's: ")}
          blankOption={t('Please Select')}
          required
          options={
            CompanyComponents
              ? CompanyComponents.BeneficiaryInsuredRelations
              : []
          }
          value={this.props.model.relToInsured}
          onChange={value =>
            this.onBeneficiaryPropertyChange(index, 'relToInsured', value)}
        />
        <FormInput
          id={`percent_${uniqueKey}`}
          label={t('Share Rate (%): ')}
          required
          type='number'
          pattern='[0-9]*'
          min={0}
          max={999}
          value={parseInt((this.props.model.shareRate*100).toFixed(0))}
          onChange={value =>
            this.onShareRateChange(index, value)}
        />
        <FormSelect
          id={`nationality_${uniqueKey}`}
          label={t('Nationality: ')}
          required
          options={NATION_OPTIONS}
          value={this.props.model.nationality}
          onChange={value =>
            this.onBeneficiaryPropertyChange(index, 'nationality', value)}
        />
        <FormSelect
          id={`certiType_${uniqueKey}`}
          required
          label={t('ID Type: ')}
          options={CompanyComponents ? CompanyComponents.CertiTypes : []}
          value={this.props.model.certiType}
          onChange={value =>
            this.onBeneficiaryPropertyChange(index, 'certiType', value)}
        />
        <FormInput
          id={`certiCode_${uniqueKey}`}
          label={t('ID Number: ')}
          required
          maxLength={50}
          value={this.props.model.certiCode}
          onChange={value =>
            this.onBeneficiaryPropertyChange(index, 'certiCode', value)}
          onBlur={value => this.onCertiCodeInputBlur(index, value)}
        />
        <FormSwitch
          id={`longTerm_${uniqueKey}`}
          label={t('ID Validity Period: ')}
          desc={t('Long Term')}
          required
          value={!this.props.model.certiEndDate}
          onChange={on => this.toggleCertiEndDate(index, on)}
        />
        {this.props.model.certiEndDate
          ? <FormDate
            id={`certiEndDate_${uniqueKey}`}
            label={t('Expire At: ')}
            required
            minDate={getToday()}
            maxDate={getBirthdayFromToday(-100)}
            value={this.props.model.certiEndDate}
            onChange={value =>
                this.onBeneficiaryPropertyChange(index, 'certiEndDate', value)}
            />
          : null}
        <FormDate
          id={`birthday_${uniqueKey}`}
          label={t('Birthday: ')}
          required
          value={this.props.model.birthday}
          onChange={value =>
            this.onBirthdayChange(index, value)}
        />
        <FormRadio
          id={`gender_${uniqueKey}`}
          label={t('Gender: ')}
          required
          options={GENDER_OPTIONS}
          value={this.props.model.gender}
          onChange={value =>
            this.onBeneficiaryPropertyChange(index, 'gender', value)}
        />
        <FormInput
          id={`mobile_${uniqueKey}`}
          label={t('Mobile Number: ')}
          required
          maxLength={20}
          type='tel'
          value={this.props.model.mobile}
          onChange={value =>
            this.onBeneficiaryPropertyChange(index, 'mobile', value)}
        />
      </FormGroup>
    )
  }
}


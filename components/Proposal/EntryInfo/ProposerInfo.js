import React from 'react'
import browserHistory from '../../../../../common/history'
import { Alert, Confirm } from '../../../../../components/Dialog'
import { Tip } from '../../../../../components/Popup'
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
  FormTextarea,
} from '../../../../../components/Form'
import companies from '../../../../../companies'
import {
  deepClone,
  getToday,
  getBirthdayFromToday,
  verifyIDCard,
  getBirthFromIDCard,
  getGenderFromIDCard,
  t
} from '../../../../../common/utils'

const REG = {
  email:/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  mobile:/^1[34578]\d{9}$/,
  postCode:/^[1-9][0-9]{5}$/,
}

export default class ProposerInfo extends React.Component {
  state = {
    dialog: {
      title: null,
      message: null,
      show: false,
    },
    proposer: {
      name: '',
      age: 18,
      birthday: null,
      gender: 'M',
      jobCateId: null,
      jobCateCode: '',
      certiType: 1,
      certiCode: '',
      certiBeginDate: null,
      certiEndDate: null,
      mobile: '',
      email: '',
      nationality: 156,
      marriageStatus: '1',
      height: null,
      weight: null,
      income: null,
      addresses: [
        {
          province: '',
          city: '',
          region: '',
          address: '',
          postCode: '',
        },
      ],
      extraProperties: {
        workplace: '',
      },
      declaration: null,
    },
    salesCompanyCode: null,
  }

  componentWillMount () {
    this.loadData()
  }

  loadData = () => {
    if (this.props.proposal) {
      let proposer = deepClone(this.props.proposal.proposer)
      let salesCompanyCode = this.props.proposal.salesCompanyCode
      this.setState({ proposer, salesCompanyCode })
    }
  }

  prevStep = () => {
    browserHistory.goBack()
  }

  nextStep = () => {
    let errors = this.validateProposerInputs()
    if (errors.length > 0) {
      this.showDialog(errors)
      return
    }
    if (!this.props.proposal) {
      this.showDialog(t('Failed to fetch proposal'))
      return
    }
    const { packageCode, actionType, quotationCode, proposalCode } = this.props.params
    let proposal = this.props.proposal
    proposal.proposer = this.state.proposer
    for (let insured of proposal.insureds) {
      let oriId = insured.id
      if (insured.laPhRela == 1) {
        Object.assign(insured, this.state.proposer)
      }
      insured.id = oriId
    }
    // save model to store
    this.props.actions.setProposal(proposal)
    let url = `/quote/${packageCode}/${actionType}/insuredInfo`
    if (quotationCode && proposalCode) {
      url += '/' + quotationCode + '/' + proposalCode
    }
    url += '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE')
    browserHistory.push(url)
  }

  onProposerPropertyChange (property, value, type) {
    if (type === 'int') value = parseInt(value) || 0
    if (type === 'float') value = parseFloat(value) || 0

    const proposer = this.state.proposer

    if (property === 'addresses') {
      const address = proposer.addresses[0]
      proposer.addresses = [Object.assign(address, value)]
    } else if (property === 'extraProperties') {
      proposer.extraProperties = Object.assign(proposer.extraProperties, value)
    } else if (property === 'jobCate') {
      proposer.jobCateId = value.jobCateId
      proposer.jobCateCode = value.jobCateCode
    } else {
      proposer[property] = value
    }

    this.setState({ proposer })
  }

  toggleCertiEndDate (on) {
    let proposer = this.state.proposer
    if (!on) {
      proposer.certiEndDate = getToday()
    } else {
      proposer.certiEndDate = null
    }
    this.setState({ proposer })
  }

  showDialog (message, title = t('Error')) {
    this.setState({
      dialog: {
        title,
        message,
        show: true,
      },
    })
  }

  hideDialog () {
    this.setState({
      dialog: {
        show: false,
      },
    })
  }

  onCertiCodeInputBlur (value) {
    let { certiCode, certiType , nationality} = this.state.proposer

    if (certiType == 1 && nationality == '156' && value) {
      if (!verifyIDCard(value)) {
        this.refs.tip.show(t('Please input correct ID number of {0}!', t('Policyholder')))
      } else{
        const birthday = this.state.proposer.birthday
        const gender = this.state.proposer.gender
        const IDBirthday = getBirthFromIDCard(certiCode)
        const IDGender = getGenderFromIDCard(certiCode)
        if (birthday != IDBirthday || gender != IDGender) {
          this.refs.tip.show(
            t('The ID number of {0} does not match birthday and gender of quote, please back to quote page!', t('Policyholder'))
          )
        }
      }
    }
  }

  validateProposerInputs () {
    const CompanyComponents = companies[this.state.salesCompanyCode]
    let errors = []
    let phName = this.state.proposer.name
    if (!phName || phName.trim().length === 0) {
      errors.push(
        <h3 key='phName'>
          {t('Please input name of {0}!', t('Policyholder'))}
        </h3>
      )
    }
    let certiCode = this.state.proposer.certiCode
    let certiType = this.state.proposer.certiType
    let nationality = this.state.proposer.nationality
    if (!certiCode) {
      errors.push(
        <h3 key='certiCode'>
          {t('Please input ID number of {0}!', t('Policyholder'))}
        </h3>
      )
    } else if (certiType == 1 && nationality == '156') {
      if (!verifyIDCard(certiCode)) {
        errors.push(
          <h3 key='certiCode'>
            {t('Please input correct ID number of {0}!', t('Policyholder'))}
          </h3>
        )
      } else {
        const birthday = this.state.proposer.birthday
        const gender = this.state.proposer.gender
        const IDBirthday = getBirthFromIDCard(certiCode)
        const IDGender = getGenderFromIDCard(certiCode)
        if (birthday != IDBirthday || gender != IDGender) {
          errors.push(
            <h3 key='certiCode'>
              {t('The ID number of {0} does not match birthday and gender of quote, please back to quote page!', t('Policyholder'))}
            </h3>
          )
        }
      }
    }
    if (CompanyComponents && CompanyComponents.MarriageStatuses && CompanyComponents.MarriageStatuses.length > 0) {
      let marriageStatus = this.state.proposer.marriageStatus
      if (!marriageStatus) {
        errors.push(
          <h3 key='phMarriageStatus'>
            {t('Please select marriage status of {0}!', t('Policyholder'))}
          </h3>
        )
      }
    }
    let phMobile = this.state.proposer.mobile
    if (!REG.mobile.test(phMobile) && nationality == '156') {
      errors.push(
        <h3 key='phMobile'>
          {t('Please input correct mobile number of {0}!', t('Policyholder'))}
        </h3>
      )
    } else if (!phMobile || phMobile.trim().length === 0) {
      errors.push(
        <h3 key='phMobile'>
          {t('Please input correct mobile number of {0}!', t('Policyholder'))}
        </h3>
      )
    }
    let phEmail = this.state.proposer.email
    if (!REG.email.test(phEmail)) {
      errors.push(
        <h3 key='phEmail'>
          {t('Please input correct email of {0}!', t('Policyholder'))}
        </h3>
      )
    }
    if (CompanyComponents && CompanyComponents.FormAddress) {
      let { city } = this.state.proposer.addresses[0]
      if (!city) {
        errors.push(
          <h3 key='phRegion'>
            {t('Please input city of {0}!', t('Policyholder'))}
          </h3>
        )
      }
    }
    let phAddress = this.state.proposer.addresses[0].address
    if (!phAddress || phAddress.trim().length < 6) {
      errors.push(
        <h3 key='phAddress'>
          {t('Please input correct address of {0}, address should no less than 6 characters!', t('Policyholder'))}
        </h3>
      )
    }
    let phPostCode = this.state.proposer.addresses[0].postCode
    if (!REG.postCode.test(phPostCode) && nationality == '156') {
      errors.push(
        <h3 key='phPostCode'>
          {t('Please input correct post code of {0}!', t('Policyholder'))}
        </h3>
      )
    } else if (!phPostCode || phPostCode.trim().length === 0) {
      errors.push(
        <h3 key='phPostCode'>
          {t('Please input correct post code of {0}!', t('Policyholder'))}
        </h3>
      )
    }
    if (CompanyComponents && CompanyComponents.NeedWorkplace) {
      let phWorkplace = this.state.proposer.extraProperties.workplace
      if (!phWorkplace || phWorkplace.trim().length < 6) {
        errors.push(
          <h3 key='phWorkplace'>
            {t('Please input correct company name of {0}, company name should no less than 6 characters!', t('Policyholder'))}
          </h3>
        )
      }
    }
    if (CompanyComponents && CompanyComponents.NeedHeightAndWeight) {
      let height = this.state.proposer.height
      if (!height) {
        errors.push(
          <h3 key='phHeight'>
            {t('Please input height of {0}!', t('Policyholder'))}
          </h3>
        )
      }
      let weight = this.state.proposer.weight
      if (!weight) {
        errors.push(
          <h3 key='phWeight'>
            {t('Please input weight of {0}!', t('Policyholder'))}
          </h3>
        )
      }
    }
    if (CompanyComponents && CompanyComponents.NeedIncomeAndSource) {
      let income = this.state.proposer.income
      if (!income) {
        errors.push(
          <h3 key='phIncome'>
            {t('Please input income of {0}!', t('Policyholder'))}
          </h3>
        )
      }
    }
    return errors
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
    const CompanyComponents = companies[this.state.salesCompanyCode]

    return (
      <section id='page-content' className='scrollable-block'>
        <Alert
          title={this.state.dialog.title}
          open={this.state.dialog.show}
          message={this.state.dialog.message}
          onRequestClose={this.hideDialog.bind(this)}
        />
        <Tip ref="tip" />
        <FormGroup title={t('Policyholder')} iconfont="icon-person">
          <FormInput
            id='name'
            label={t('Name: ')}
            required
            maxLength={50}
            value={this.state.proposer.name}
            onChange={value => this.onProposerPropertyChange('name', value)}
          />
          <FormSelect
            id='nationality'
            label={t('Nationality: ')}
            required
            options={NATION_OPTIONS}
            value={this.state.proposer.nationality}
            onChange={value =>
              this.onProposerPropertyChange('nationality', value)}
          />
          <FormSelect
            id='certiType'
            label={t('ID Type: ')}
            required
            options={CompanyComponents ? CompanyComponents.CertiTypes : []}
            value={this.state.proposer.certiType}
            onChange={value =>
              this.onProposerPropertyChange('certiType', value)}
          />
          <FormInput
            id='certiCode'
            label={t('ID Number: ')}
            required
            maxLength={50}
            value={this.state.proposer.certiCode}
            onChange={value =>
              this.onProposerPropertyChange('certiCode', value)}
            onBlur={value => this.onCertiCodeInputBlur(value)}
          />
          <FormSwitch
            id='longTerm'
            label={t('ID Validity Period: ')}
            desc={t('Long Term')}
            required
            value={!this.state.proposer.certiEndDate}
            onChange={on => this.toggleCertiEndDate(on)}
          />
          {this.state.proposer.certiEndDate
            ? <FormDate
              id='certiEndDate'
              label={t('Expire At: ')}
              required
              minDate={getToday()}
              maxDate={getBirthdayFromToday(-100)}
              value={this.state.proposer.certiEndDate}
              onChange={value =>
                  this.onProposerPropertyChange('certiEndDate', value)}
              />
            : null}
          <FormDate
            id='birthday'
            label={t('Birthday: ')}
            readOnly
            required
            value={this.state.proposer.birthday}
          />
          <FormRadio
            id='gender'
            label={t('Gender: ')}
            options={GENDER_OPTIONS}
            readOnly
            required
            value={this.state.proposer.gender}
          />
          {CompanyComponents && CompanyComponents.MarriageStatuses && CompanyComponents.MarriageStatuses.length > 0 ?
            <FormSelect
              id='marriageStatus'
              label={t('Marriage Status')}
              required
              blankOption={t('Please Select')}
              options={CompanyComponents.MarriageStatuses}
              value={this.state.proposer.marriageStatus}
              onChange={value =>
              this.onProposerPropertyChange('marriageStatus', value)}
            />
            : null}
          <FormInput
            id='mobile'
            label={t('Mobile Number: ')}
            required
            type='tel'
            maxLength={20}
            value={this.state.proposer.mobile}
            onChange={value => this.onProposerPropertyChange('mobile', value)}
          />
          <FormInput
            id='email'
            label={t('Email: ')}
            required
            maxLength={50}
            type='email'
            value={this.state.proposer.email}
            onChange={value => this.onProposerPropertyChange('email', value)}
          />
          {CompanyComponents && CompanyComponents.FormAddress
            ? <CompanyComponents.FormAddress
              id='addresses'
              label={t('City')}
              required
              value={this.state.proposer.addresses[0]}
              onChange={value =>
                  this.onProposerPropertyChange('addresses', value)}
              />
            : null}
          <FormTextarea
            id='address'
            label={t('Address')}
            required
            maxLength={200}
            value={this.state.proposer.addresses[0].address}
            onChange={value =>
              this.onProposerPropertyChange('addresses', { address: value })}
          />
          <FormInput
            id='postCode'
            label={t('Post Code: ')}
            required
            maxLength={6}
            value={this.state.proposer.addresses[0].postCode}
            type='number'
            pattern='[0-9]*'
            onChange={value =>
              this.onProposerPropertyChange('addresses', { postCode: value })}
          />
          {CompanyComponents && CompanyComponents.FormJob
            ? <CompanyComponents.FormJob
              id='jobCate'
              label={t('Occupation: ')}
              required
              readOnly
              value={{
                jobCateId: this.state.proposer.jobCateId,
                jobCateCode: this.state.proposer.jobCateCode,
              }}
              />
            : null}
          {CompanyComponents && CompanyComponents.NeedWorkplace
            ? <FormInput
              id='workplace'
              label={'Company Name: '}
              required
              maxLength={50}
              value={this.state.proposer.extraProperties.workplace}
              onChange={value =>
                this.onProposerPropertyChange('extraProperties', {
                  workplace: value,
                })}
              />
            : null
          }
          {CompanyComponents && CompanyComponents.NeedHeightAndWeight ?
            [
              <FormInput
                key='height'
                id='height'
                label={t('Height (cm): ')}
                required
                maxLength={3}
                value={this.state.proposer.height}
                type='number'
                pattern='[0-9]*'
                onChange={value =>
                  this.onProposerPropertyChange('height', value, 'int')}
              />,
              <FormInput
                key='weight'
                id='weight'
                label={t('Weight (kg): ')}
                required
                maxLength={3}
                value={this.state.proposer.weight}
                type='number'
                pattern='[0-9]*'
                onChange={value =>
                  this.onProposerPropertyChange('weight', value, 'int')}
              />,
            ] : null
          }
          {CompanyComponents && CompanyComponents.NeedIncomeAndSource ?
            [
              <FormInput
                key='income'
                id='income'
                label={t('Income (yearly): ')}
                required
                maxLength={10}
                value={this.state.proposer.income}
                type='number'
                pattern='[0-9]*'
                onChange={value =>
                  this.onProposerPropertyChange('income', value, 'int')}
              />
            ] : null
          }
          <div className='action-footer'>
            <button className='bottom-button prev' onClick={this.prevStep}>
              {t('Prev')}
            </button>
            <button className='bottom-button next' onClick={this.nextStep}>
              {t('Next')}
            </button>
          </div>
        </FormGroup>
      </section>
    )
  }
}



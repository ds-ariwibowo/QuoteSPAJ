import React from 'react'
import browserHistory from '../../../../../common/history'
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

import { Alert, Confirm } from '../../../../../components/Dialog'
import { Tip } from '../../../../../components/Popup'
import Beneficiary from './Beneficiary'
import companies from '../../../../../companies'

import {
  deepClone,
  getToday,
  getTomorrow,
  getBirthdayFromToday,
  verifyIDCard,
  getAgeFromIDCard,
  getBirthFromIDCard,
  getGenderFromIDCard,
  t
} from '../../../../../common/utils'

const REG = {
  email:/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  mobile:/^1[34578]\d{9}$/,
  postCode:/^[1-9][0-9]{5}$/,
}

const beneficiaryModel = {
  insuredId: null,
  birthday: null,
  id: '',
  name: '',
  age: 0,
  gender: 'M',
  jobCateId: null,
  jobCateCode: '',
  certiType: 1,
  certiCode: '',
  certiBeginDate: null,
  certiEndDate: null,
  mobile: '',
  email: '',
  nationality: '156',
  marriageStatus: '',
  declaration: null,
  shareRate: 0,
  relToInsured: 0,
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
}

export default class InsuredInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dialog: {
        title: null,
        message: null,
        show: false,
      },
      insureds: [
        {
          id: '0',
          name: '',
          birthday: null,
          age: 0,
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
          marriageStatus: null,
          laPhRela: null,
          height: null,
          weight: null,
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
          beneficiaries: []
        },
        {
          id: '1',
          name: '',
          birthday: null,
          age: 0,
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
          marriageStatus: null,
          laPhRela: null,
          height: null,
          weight: null,
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
          beneficiaries: []
        },
      ],
      salesCompanyCode: null,
    }
  }

  componentWillMount () {
    this.loadData()
  }

  loadData = () => {
    if (this.props.proposal) {
      let insureds = deepClone(this.props.proposal.insureds)
      for (let insured of insureds) {
        insured.beneficiaries = this.props.proposal.beneficiaries.filter(bene => bene.insuredId == insured.id)
      }
      let salesCompanyCode = this.props.proposal.salesCompanyCode
      this.setState({ insureds, salesCompanyCode })
    }
  }

  prevStep = () => {
    browserHistory.goBack()
  }

  nextStep = () => {
    let errors = []
    for (let i=0; i<this.state.insureds.length; i++) {
      errors.push(...this.validateInsuredInputs(i))
    }
    if (errors.length > 0) {
      this.showDialog(errors)
      return
    }
    if (!this.props.proposal) {
      this.showDialog(t('Failed to fetch proposal'))
      return
    }
    let proposalCode = this.props.params.proposalCode
    if (proposalCode && proposalCode !== '0') {
      // check saved proposal status
      this.props.actions.getProposal(proposalCode, (error, proposal) => {
        if (error) {
          this.showDialog(t('Failed to fetch proposal'))
          return
        }
        if (['31', '79', '82'].includes(proposal.proposalStatus)) {
          this.saveProposal()
        } else {
          const PROPOSAL_STATUS = {
            "31": t('Waiting for Underwriting'), // generated or none underwriting
            "79": t('Underwriting Pass'), // underwriting passed
            "82": t('Underwriting Failed'), // underwriting failed, can retry underwriting
            "80": t('Accepted'), // accept or waiting for payment
            "87": t('Payment Failed'), // payment failed, can retry issue
            "85": t('Issued'), // issued
            "88": t('Invalid'), // deleted or invalid
            "89": t('Waiting for Payment Result'), // waiting for payment response, usually for online payment callback
            "90": t('Payed'), // payed but not issued, usually error happens on online payment callback, can retry issue
            "91": t('Issue Failed') // issued failed, can retry issue
          }
          this.showDialog(t('The proposal status is [{0}], cannot perform this operation!', PROPOSAL_STATUS[proposal.proposalStatus]))
        }
      })
    } else {
      this.saveProposal()
    }
  }

  saveProposal () {
    const { packageCode, actionType } = this.props.params
    let insureds = this.state.insureds
    let beneficiaries = []
    for (let insured of insureds) {
      beneficiaries.push(...insured.beneficiaries)
    }
    let proposal = this.props.proposal
    proposal.insureds = insureds
    proposal.beneficiaries = beneficiaries
    let proposalCode = this.props.params.proposalCode
    if (proposalCode && proposalCode !== '0') {
      proposal.proposalCode = proposalCode
    } else if (proposal.proposalCode && ['31', '79', '82'].includes(proposal.proposalStatus)) {
      // has saved once
    } else {
      proposal.proposalCode = null
    }
    proposal.proposalStatus = '31'
    proposal.inforceDate = getTomorrow()
    proposal.submitDate = getToday()
    this.props.actions.setProposal(proposal)
    let saveProposalRequest = {
      proposal,
      msg: sessionStorage.getItem('SALES_APP_MSG'),
      sign: sessionStorage.getItem('SALES_APP_SIGN'),
      tenantCode: sessionStorage.getItem('SALES_APP_TENANT_CODE'),
    }
    this.props.actions.saveProposal(saveProposalRequest, (error, proposalCode) => {
      if (error) {
        this.showDialog(t('Failed to save proposal'))
        return
      }
      let quotationCode = this.props.params.quotationCode
      if (!quotationCode) {
        quotationCode = '0'
      }
    
      const CompanyComponents = companies[this.state.salesCompanyCode]
      if (CompanyComponents && CompanyComponents.ProposerQuestionnaire) {
        browserHistory.push(
          `/quote/${packageCode}/${actionType}/proposerQuestionnaire/${quotationCode}/${proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE')
        )
      } else if (CompanyComponents && CompanyComponents.InsuredQuestionnaire) {
        browserHistory.push(
          `/quote/${packageCode}/${actionType}/insuredQuestionnaire1/${quotationCode}/${proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE')
        )
      } else {
        saveProposalRequest.proposal.proposalCode = proposalCode
        this.underwriteProposal(saveProposalRequest, (proposal) => {
          browserHistory.push(
            `/quote/${packageCode}/${actionType}/payment/${quotationCode}/${proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE')
          )
        })
      }
    })
  }

  underwriteProposal(saveProposalRequest, callback) {
    this.props.actions.underwriteProposal(saveProposalRequest, (error, proposal) => {
      if (error) {
        this.showDialog(t('Failed to underwrite proposal') + error)
        return
      }
      callback && callback(proposal)
    })
  }

  
  onInsuredPropertyChange (index, property, value, type) {
    if (type === 'int') value = parseInt(value) || 0
    if (type === 'float') value = parseFloat(value) || 0

    let insureds = this.state.insureds
    let insured = insureds[index]

    if (property === 'addresses') {
      const address = insured.addresses[0]
      insured.addresses = [Object.assign(address, value)]
    } else if (property === 'extraProperties') {
      insured.extraProperties = Object.assign(insured.extraProperties, value)
    } else if (property === 'jobCate') {
      insured.jobCateId = value.jobCateId
      insured.jobCateCode = value.jobCateCode
    } else {
      insured[property] = value
    }

    this.setState({ insureds })
  }

  validateInsuredInputs (index = 0) {
    const CompanyComponents = companies[this.state.salesCompanyCode]
    let errors = []
    let phName = this.state.insureds[index].name
    if (!phName || phName.trim().length === 0) {
      errors.push(
        <h3 key={'insuredName_'+index}>
          {t('Please input name of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    }
    let certiCode = this.state.insureds[index].certiCode
    let certiType = this.state.insureds[index].certiType
    let nationality = this.state.insureds[index].nationality
    if (!certiCode) {
      errors.push(
        <h3 key={'insuredCertiCode_'+index}>
          {t('Please input ID number of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    } else if (certiType == 1 && nationality == '156') {
      if (!verifyIDCard(certiCode)) {
        errors.push(
          <h3 key={'insuredCertiCode_'+index}>
            {t('Please input correct ID number of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
          </h3>
        )
      } else {
        const birthday = this.state.insureds[index].birthday
        const gender = this.state.insureds[index].gender
        const IDBirthday = getBirthFromIDCard(certiCode)
        const IDGender = getGenderFromIDCard(certiCode)
        if (birthday != IDBirthday || gender != IDGender) {
          errors.push(
            <h3 key={'insuredCertiCode_'+index}>
              {t('The ID number of {0} does not match birthday and gender of quote, please back to quote page!', index === 1? t('2nd Insured') : t('Insured'))}
            </h3>
          )
        }
      }
    }
    if (CompanyComponents && CompanyComponents.MarriageStatuses && CompanyComponents.MarriageStatuses.length > 0) {
      let marriageStatus = this.state.insureds[index].marriageStatus
      if (!marriageStatus) {
        errors.push(
          <h3 key={'insuredMarriageStatus_'+index}>
            {t('Please select marriage status of {0}!', index === 1 ? t('2nd Insured') : t('Insured'))}
          </h3>
        )
      }
    }
    let phMobile = this.state.insureds[index].mobile
    if (!REG.mobile.test(phMobile) && nationality == '156') {
      errors.push(
        <h3 key={'insuredMobile_'+index}>
          {t('Please input correct mobile number of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    } else if (!phMobile || phMobile.trim().length === 0) {
      errors.push(
        <h3 key={'insuredMobile_'+index}>
          {t('Please input correct mobile number of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    }
    let phEmail = this.state.insureds[index].email
    if (!REG.email.test(phEmail)) {
      errors.push(
        <h3 key={'insuredEmail_'+index}>
          {t('Please input correct email of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    }
    if (CompanyComponents && CompanyComponents.FormAddress) {
      let {city} = this.state.insureds[index].addresses[0]
      if (!city) {
        errors.push(
          <h3 key={'insuredRegion_'+index}>
            {t('Please input city of {0}!', index === 1 ? t('2nd Insured') : t('Insured'))}
          </h3>
        )
      }
    }
    let phAddress = this.state.insureds[index].addresses[0].address
    if (!phAddress || phAddress.trim().length < 6) {
      errors.push(
        <h3 key={'insuredAddress_'+index}>
          {t('Please input correct address of {0}, address should no less than 6 characters!', index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    }
    let phPostCode = this.state.insureds[index].addresses[0].postCode
    if (!REG.postCode.test(phPostCode) && nationality == '156') {
      errors.push(
        <h3 key={'insuredPostCode_'+index}>
          {t('Please input correct post code of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    } else if (!phPostCode || phPostCode.trim().length === 0) {
      errors.push(
        <h3 key={'insuredPostCode_'+index}>
          {t('Please input correct post code of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    }
    if (CompanyComponents && CompanyComponents.NeedWorkplace) {
      let phWorkplace = this.state.insureds[index].extraProperties.workplace
      if (!phWorkplace || phWorkplace.trim().length < 6) {
        errors.push(
          <h3 key='phWorkplace'>
            {t('Please input correct company name of {0}, company name should no less than 6 characters!', index === 1? t('2nd Insured') : t('Insured'))}
          </h3>
        )
      }
    }
    if (CompanyComponents && CompanyComponents.NeedHeightAndWeight) {
      let height = this.state.insureds[index].height
      if (!height) {
        errors.push(
          <h3 key={'insuredHeight_'+index}>
            {t('Please input height of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
          </h3>
        )
      }
      let weight = this.state.insureds[index].weight
      if (!weight) {
        errors.push(
          <h3 key={'insuredWeight_'+index}>
            {t('Please input weight of {0}!', index === 1? t('2nd Insured') : t('Insured'))}
          </h3>
        )
      }
    }
    errors.push(...this.validateBeneInputs(index))
    return errors
  }

 
  validateBeneInputs (index = 0) {
    let benef = this.state.insureds[index].beneficiaries
    let errors = []
    let totalRate = 0
    benef.forEach((item, index) => {
      let name = item.name
      if (!name || name.trim().length === 0) {
        errors.push(
          <h3 key={`beneName_${index}`}>
            {t('Please input name of {0}!', t('Beneficiary') + (index+1))}
          </h3>
        )
      }
      let relToInsured = item.relToInsured
      if (!relToInsured) {
        errors.push(
          <h3 key={`beneRelToInsured_${index}`}>
            {t('Please select relation to insured of {0}!', t('Beneficiary') + (index+1))}
          </h3>
        )
      }
      let certiCode = item.certiCode
      let certiType = item.certiType
      let nationality = item.nationality
      if (!certiCode) {
        errors.push(
          <h3 key={'beneCertiCode_'+index}>
            {t('Please input ID number of {0}!', t('Beneficiary') + (index+1))}
          </h3>
        )
      } else if (certiType == 1 && nationality == '156') {
        if (!verifyIDCard(certiCode)) {
          errors.push(
            <h3 key={'beneCertiCode_'+index}>
              {t('Please input correct ID number of {0}!', t('Beneficiary') + (index+1))}
            </h3>
          )
        } else {
          const birthday = item.birthday
          const gender = item.gender
          const IDBirthday = getBirthFromIDCard(certiCode)
          const IDGender = getGenderFromIDCard(certiCode)
          if (birthday != IDBirthday || gender != IDGender) {
            errors.push(
              <h3 key={'beneCertiCode_'+index}>
                {t('The ID Number of {0} does not match birthday and gender!', t('Beneficiary') + (index+1))}
              </h3>
            )
          }
        }
      }
      let birthday = item.birthday
      if (!birthday) {
        errors.push(
          <h3 key={`beneBirthday_${index}`}>
            {t('Please select birthday of Beneficiary{0}!', index + 1)}
          </h3>
        )
      }
      let shareRate = item.shareRate
      if (!shareRate || shareRate > 1 || shareRate <= 0) {
        errors.push(
          <h3 key={`beneShareRate_${index}`}>
            {t('Please input correct share rate of Beneficiary{0}!', index + 1)}
          </h3>
        )
      }
      let mobile = item.mobile
      if (!REG.mobile.test(mobile) && nationality == '156') {
        errors.push(
          <h3 key={`beneMobile_${index}`}>
            {t('Please input correct mobile number of {0}!', t('Beneficiary') + (index+1))}
          </h3>
        )
      } else if (!mobile || mobile.trim().length === 0) {
        errors.push(
          <h3 key={`beneMobile_${index}`}>
            {t('Please input correct mobile number of {0}!', t('Beneficiary') + (index+1))}
          </h3>
        )
      }
      totalRate += parseFloat(shareRate)
    })
    if (benef.length > 0 && parseFloat(totalRate.toFixed(2)) != 1) {
      errors.push(
        <h3 key={`totalBeneShareRate_${index}`}>
          {t("Total beneficiaries' share rates of {0} should be 100!", index === 1? t('2nd Insured') : t('Insured'))}
        </h3>
      )
    }
    return errors
  }

  // TOAST
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

  
  onCertiCodeInputBlur (index, value) {
    let { certiType, birthday, gender, nationality } = this.state.insureds[index]
    if (certiType == 1 && nationality == '156' && value) {
      if (!verifyIDCard(value)) {
        this.refs.tip.show(t('Please input correct ID number of {0}!', index === 1? t('2nd Insured') : t('Insured')))
      } else {
        let IDBirthday = getBirthFromIDCard(value)
        let IDGender = getGenderFromIDCard(value)
        if (birthday != IDBirthday || gender != IDGender) {
          this.refs.tip.show(
              t('The ID number of {0} does not match birthday and gender of quote, please back to quote page!', index === 1? t('2nd Insured') : t('Insured'))
          )
        }
      }
    }
  }

  
  addBenef = (insuredKey, value) => {
    let insureds = this.state.insureds

    const beneficiary = deepClone(beneficiaryModel)

    insureds[insuredKey].beneficiaries.push(
      Object.assign(beneficiary, {
        insuredId: insureds[insuredKey].id,
      })
    )
    this.setState({ insureds })
  }
  
  delBenef = (selfKey, insuredKey) => {
    let insureds = this.state.insureds
    insureds[insuredKey].beneficiaries.splice(selfKey, 1)
    this.setState({ insureds })
  }

  clearBenef = (insuredKey, value) => {
    let insureds = this.state.insureds
    insureds[insuredKey].beneficiaries = []
    this.setState({ insureds })
  }

  
  genBenefView = insuredKey => {
    let insured = this.state.insureds[insuredKey]
    const beneficiariesView = []
    for (let i = 0; i < insured.beneficiaries.length; i++) {
      beneficiariesView.push(
        <Beneficiary
          model={insured.beneficiaries[i]}
          index={i}
          uniqueKey={`Beneficiary_${insuredKey}_${i}`}
          delete={() => this.delBenef(i, insuredKey)}
          key={`Beneficiary_${insuredKey}_${i}`}
          onChange={(beneIndex, beneficiary) => {
            let insureds = this.state.insureds
            insureds[insuredKey][beneIndex] = beneficiary
            this.setState({ insureds })
          }}
          CompanyComponents={companies[this.state.salesCompanyCode]}
        />
      )
    }

    return beneficiariesView
  }

  genPersonalView = (insured, index) => {
    const CompanyComponents = companies[this.state.salesCompanyCode]
    return (
      <FormGroup
        key={`FormGroup_${index}`}
        title={index === 1 ? t('2nd Insured') : t('Insured')}
        iconfont="icon-person"
      >
        <FormInput
          id={`name_${index}`}
          label={t('Name: ')}
          required
          readOnly
          maxLength={50}
          value={insured.name}
        />
        <FormSelect
          id={`laPhRela_${index}`}
          label={t("Is Policyholder's: ")}
          readOnly
          required
          options={[{ value: 1, label: t('Self')}]}
          value={insured.laPhRela}
        />
        <FormSwitch
          id={`hasbene_${index}`}
          label={t('Beneficiary: ')}
          desc={t('Legal')}
          required
          value={insured.beneficiaries.length === 0}
          readOnly={!CompanyComponents || !CompanyComponents.BeneficiaryInsuredRelations || CompanyComponents.BeneficiaryInsuredRelations.length === 0}
          onChange={value => {
            if (value) {
              this.clearBenef(index, value)
            } else {
              this.addBenef(index, value)
            }
          }}
        />
        {insured.beneficiaries.length > 0 ? this.genBenefView(index) : null}
        {insured.beneficiaries.length > 0
          ? <div className='add-rider' onClick={() => this.addBenef(index)}>
            <i className="iconfont icon-add" />
            <span>{t('Add Beneficiary')}</span>
          </div>
          : null
        }
      </FormGroup>
    )
  }

  toggleCertiEndDate (index, on) {
    let insureds = this.state.insureds
    let insured = insureds[index]
    if (!on) {
      insured.certiEndDate = getToday()
    } else {
      insured.certiEndDate = null
    }
    this.setState({ insureds })
  }

  genInsuredView = (insured, index) => {
    const NATION_OPTIONS = [
      { value: 156, label: t('CHINA') },
      { value: -1, label: t('Others') }
    ]
    const GENDER_OPTIONS = [
      { value: 'M', label: t('Male') },
      { value: 'F', label: t('Female') },
    ]
    const CompanyComponents = companies[this.state.salesCompanyCode]
    return (
      <FormGroup
        key={`FormGroup_${index}`}
        title={index === 1 ? t('2nd Insured') : t('Insured')}
        iconfont="icon-person"
      >
        <FormInput
          id={`name_${index}`}
          label={t('Name: ')}
          required
          maxLength={50}
          value={insured.name}
          onChange={value =>
            this.onInsuredPropertyChange(index, 'name', value)}
        />
        <FormSelect
          id={`laPhRela_${index}`}
          label={t("Is Policyholder's: ")}
          blankOption={t('Please Select')}
          readOnly
          required
          options={CompanyComponents? CompanyComponents.InsuredProposerRelations : []}
          value={insured.laPhRela}
        />
        <FormSelect
          id={`nationality_${index}`}
          label={t('Nationality: ')}
          required
          options={NATION_OPTIONS}
          value={insured.nationality}
          onChange={value =>
            this.onInsuredPropertyChange(index, 'nationality', value)}
        />
        <FormSelect
          id={`certiType_${index}`}
          label={t('ID Type: ')}
          required
          options={CompanyComponents ? CompanyComponents.CertiTypes : []}
          value={insured.certiType}
          onChange={value =>
            this.onInsuredPropertyChange(index, 'certiType', value)}
        />
        <FormInput
          id={`certiCode_${index}`}
          label={t('ID Number: ')}
          required
          maxLength={50}
          value={insured.certiCode}
          onChange={value =>
            this.onInsuredPropertyChange(index, 'certiCode', value)}
          onBlur={value => this.onCertiCodeInputBlur(index, value)}
        />
        <FormSwitch
          id={`longTerm_${index}`}
          label={t('ID Validity Period: ')}
          desc={t('Long Term')}
          required
          value={!insured.certiEndDate}
          onChange={on => this.toggleCertiEndDate(index, on)}
        />
        {insured.certiEndDate
          ? <FormDate
            id={`certiEndDate_${index}`}
            label={t('Expire At: ')}
            required
            value={insured.certiEndDate}
            minDate={getToday()}
            maxDate={getBirthdayFromToday(-100)}
            onChange={value =>
              this.onInsuredPropertyChange(index, 'certiEndDate', value)}
          />
          : null
        }
        <FormDate
          id={`birthday_${index}`}
          label={t('Birthday: ')}
          required
          readOnly
          value={insured.birthday}
        />
        <FormRadio
          id={`gender_${index}`}
          label={t('Gender: ')}
          required
          readOnly
          options={GENDER_OPTIONS}
          value={insured.gender}
        />
        {CompanyComponents && CompanyComponents.MarriageStatuses && CompanyComponents.MarriageStatuses.length > 0 ?
           <FormSelect
            id={`marriageStatus_${index}`}
            label={t('Marriage Status')}
            required
            blankOption={t('Please Select')}
            options={CompanyComponents.MarriageStatuses}
            value={insured.marriageStatus}
            onChange={value =>
            this.onInsuredPropertyChange(index, 'marriageStatus', value)}
            />
          : null}
        <FormInput
          id={`mobile_${index}`}
          label={t('Mobile Number: ')}
          required
          type='tel'
          maxLength={20}
          value={insured.mobile}
          onChange={value =>
            this.onInsuredPropertyChange(index, 'mobile', value)}
        />
        <FormInput
          id={`email_${index}`}
          label={t('Email: ')}
          required
          maxLength={50}
          type='email'
          value={insured.email}
          onChange={value =>
            this.onInsuredPropertyChange(index, 'email', value)}
        />
        {CompanyComponents && CompanyComponents.FormAddress
          ? <CompanyComponents.FormAddress
            id={`addresses_${index}`}
            label={t('City')}
            required
            value={insured.addresses[0]}
            onChange={value =>
                this.onInsuredPropertyChange(index, 'addresses', value)}
            />
          : null}
        <FormTextarea
          id={`address_${index}`}
          label={t('Address')}
          maxLength={200}
          required
          value={insured.addresses[0].address}
          onChange={value =>
            this.onInsuredPropertyChange(index, 'addresses', {
              address: value,
            })}
        />
        <FormInput
          id={`postCode_${index}`}
          label={t('Post Code: ')}
          required
          type='number'
          pattern='[0-9]*'
          maxLength={6}
          value={insured.addresses[0].postCode}
          onChange={value =>
            this.onInsuredPropertyChange(index, 'addresses', {
              postCode: value,
            })}
        />
        {CompanyComponents && CompanyComponents.FormJob
          ? <CompanyComponents.FormJob
            id={`jobCate_${index}`}
            label={t('Occupation: ')}
            required
            readOnly
            value={{
              jobCateId: insured.jobCateId,
              jobCateCode: insured.jobCateCode,
            }}
            />
          : null}
        {CompanyComponents && CompanyComponents.NeedWorkplace
          ? <FormInput
            id={`workplace_${index}`}
            label={'Company Name: '}
            required
            maxLength={50}
            value={insured.extraProperties.workplace}
            onChange={value =>
                this.onInsuredPropertyChange(index, 'extraProperties', {
                  workplace: value,
                })}
          />
          : null}
        {CompanyComponents && CompanyComponents.NeedHeightAndWeight?
          [
            <FormInput
              key={`height_${index}`}
              id={`height_${index}`}
              label={t('Height (cm): ')}
              required
              maxLength={3}
              value={insured.height}
              type='number'
              pattern='[0-9]*'
              onChange={value =>
                  this.onInsuredPropertyChange(index, 'height', value, 'int')}
            />,
            <FormInput
              key={`weight_${index}`}
              id={`weight_${index}`}
              label={t('Weight (kg): ')}
              required
              maxLength={3}
              value={insured.weight}
              type='number'
              pattern='[0-9]*'
              onChange={value =>
                  this.onInsuredPropertyChange(index, 'weight', value, 'int')}
            />,
          ] : null
        }
        <FormSwitch
          id={`hasbene_${index}`}
          label={t('Beneficiary: ')}
          desc={t('Legal')}
          value={insured.beneficiaries.length === 0}
          readOnly={!CompanyComponents || !CompanyComponents.BeneficiaryInsuredRelations || CompanyComponents.BeneficiaryInsuredRelations.length === 0}
          onChange={value => {
            if (value) {
              this.clearBenef(index, value)
            } else {
              this.addBenef(index, value)
            }
          }}
        />
        {insured.beneficiaries.length > 0 ? this.genBenefView(index) : null}
        {insured.beneficiaries.length > 0
          ? <div className='add-rider' onClick={() => this.addBenef(index)}>
            <i className="iconfont icon-add" />
            <span>{t('Add Beneficiary')}</span>
          </div>
          : null
        }
      </FormGroup>
    )
  }

  render () {
    let mainContent = []
    this.state.insureds.forEach((insured, index) => {
      if (insured.laPhRela == 1) {
        mainContent.push(this.genPersonalView(insured, index))
      } else {
        mainContent.push(this.genInsuredView(insured, index))
      }
    })

    return (
      <section id='page-content' className='scrollable-block'>
        <Tip ref="tip" />
        <Alert
          title={this.state.dialog.title}
          open={this.state.dialog.show}
          message={this.state.dialog.message}
          onRequestClose={this.hideDialog.bind(this)}
        />
        {mainContent}
        <div className='action-footer'>
          <button className='bottom-button prev' onClick={this.prevStep}>
            {t('Prev')}
          </button>
          <button className='bottom-button next' onClick={this.nextStep}>
            {t('Next')}
          </button>
        </div>
      </section>
    )
  }
}



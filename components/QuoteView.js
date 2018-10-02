import React from 'react'
import PropTypes from 'prop-types'
import browserHistory from '../../../common/history'
import { Alert, Confirm } from '../../../components/Dialog'
import QuoteHeader from './QuoteHeader'
import {
  FormGroup,
  FormInput,
  FormSelect,
  FormRadio,
  FormDate,
  FormText,
  FormSwitch,
  FormBirthdayOrAge,
} from '../../../components/Form'
import {Tip} from '../../../components/Popup'
import {
  formatNumber,
  t,
  setHtmlTitle,
  lang,
  getAgeByBirthday,
  getBirthdayFromToday,
  getToday,
  getTomorrow,
  getDateFromToday,
  deepClone,
} from '../../../common/utils'
import codetable from '../../../codetable'
import FirstYearPremiumTable from './FirstYearPremiumTable'
import RiderListDialog from './RiderListDialog'
import CustomerSearchDialog from './CustomerSearchDialog'
import FundAllocation from './FundAllocation'
import 'animate.css/animate.css'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import companies from '../../../companies'
import SingleTopup from './SingleTopup'
import RegularTopup from './RegularTopup'
import PartialWithdraw from './PartialWithdraw'
import { configShare, getUrlWithParams} from '../../../common/share'
import config from '../../../config'


const DEFAULT_JOB_CATE_LIST = [1, 2, 3, 4]
const MIN_PH_AGE = 18
const MAX_AGE = 106
const MAX_AMOUNT = 9999999999
const DEFAULT_NATIONALITY = '156'

function fireOnChange(target) {
  if (!target) {
    return
  }
  if(document.createEventObject) {
    target.fireEvent("onchange");
  } else {
    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("change", true, true);
    target.dispatchEvent(evt);
  }
}

export default class QuoteView extends React.Component {
  constructor (props) {
    super(props)
    this.actionType = this.props.params.actionType
    this.isProposal = this.actionType === 'doProposal'
    this.riderItemIndex = 10
    this.insuredModel = null
    this.insuredItemIndex = 1
    this.state = {
      deletedRiderIndex: null,
      removeRiderDialogOpen: false,
      addRiderDialogOpen: false,
      calcPremiumTableOpen: true,
      fromContactListOpen: false,
      fromContactListSearched: false,
      insuredIndex: 0,
      dialog: {
        title: null,
        message: null,
        show: false,
      },
      plan: {
        langCode: '011',
        packageId: null,
        packageCode: null,
        totalFirstYearPrem: 0,
        annualPrem: 0,
        proposalStatus: 31,
        inforceDate: getTomorrow(),
        submitDate: getToday(),
        moneyId: 1,
        insureds: [
          {
            id: '',
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
            nationality: '',
            marriageStatus: '',
            laPhRela: 0,
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
            limits: {
              minAge: null,
              maxAge: null,
              age: [],
              gender: [],
              jobCateList: [],
              ageRange: [],
            },
          },
        ],
        proposer: {
          name: '',
          birthday: null,
          gender: 'M',
          age: null,
          jobCateId: null,
          jobCateCode: '',
          certiType: 1,
          certiCode: '',
          certiBeginDate: null,
          certiEndDate: null,
          mobile: '',
          email: '',
          nationality: '',
          marriageStatus: '',
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
          limits: {
            minAge: null,
            maxAge: null,
            age: [],
            gender: [],
            jobCateList: [],
          },
        },
        beneficiaries: [],
        mainCoverages: [
          {
            paymentFreq: "1",
            unitFlag: 6,
            sa: 0,
            chargePeriod: {
              periodType: 1, 
              periodValue: 1,
            },
            coveragePeriod: {
              periodType: 1, 
              periodValue: 0,
            },
            insuredIds: ['0'],
            limits: {
              isMain: true,
              chargePeriod: [],
              coveragePeriod: [],
              payPeriod: [],
              endPeriod: [], 
              payEnsure: [],  
              benefitlevel: [],
              amount: [],// SA / unit
			  prem: [],
              isPackageProduct: false, // 
              attachCompulsory: false, // 
              pointToSecInsured: false, // 
              pointToPH: false, // 
              isWaiver: false, // 
              minAge: null, 
              maxAge: null, 
              gender: [], 
              isAnnuityProduct: false, // 
              isIlpProduct: false, // 
              singleTopupPermit: false, // 
              regularTopupPermit: false, // 
              partialWithdrawPermit: false, // 
              smokingIndi: false, // 
              jobIndi: false, // 
              socialInsureIndi: false, // 
              waiverChargeYearAdjustment: 0, 
              jobCateList: [], 
              incrementIndex: 1, 
              funds: [], 
              targetAthRateList: [], 
              ageRange: {}, 
              paymentFreqs: [], 
              familyType: false,
              ally: false,
              regPartWithdrMinAmount: 0,
              regPartWithdrMaxAmount: MAX_AMOUNT,
              topupStartYear: 1,
              partialWithdrawStartYear: 1,
              regPartWitdrStartYear: 1,
              isUDRider: false,
            },
          },
        ],
        riderCoverages: [],
        showAdvice: 'Y',
        advice: '',
        payerAccounts: [
          {
            paymentMethod: 3,
            bankAccount: null,
          },
        ],
      },
    }
  }

  componentWillMount () {
    this.setLang()
    let salesPackageCode = this.props.params.packageCode
    if (!this.props.plan || salesPackageCode !== this.props.plan.packageCode) {
      this.props.actions.resetPage()
    }
    this.loadProducer(() => {
      setHtmlTitle()
      this.loadPage()
    })
  }

  setLang() {
    let langCode = this.props.location.query.lang
    if (langCode) {
      sessionStorage.setItem('SALES_APP_LANGUAGE', langCode)
    }
    if (sessionStorage.getItem('SALES_APP_LANGUAGE')) {
      lang(sessionStorage.getItem('SALES_APP_LANGUAGE'))
      this.setState({})
    } else if (config.defaultLanguage) {
      lang(config.defaultLanguage)
      this.setState({})
    }
  }

  loadProducer (callback) {
    let tenantCode = this.props.location.query.tenantCode
    if (!tenantCode && !sessionStorage.getItem('SALES_APP_TENANT_CODE')) {
      this.showDialog(t('No tenantCode is the passed parameter'))
      return
    } else if (
      tenantCode &&
      tenantCode !== sessionStorage.getItem('SALES_APP_TENANT_CODE')
    ) {
      // tenantCode changes clear old session
      sessionStorage.removeItem('SALES_APP_PRODUCER')
      sessionStorage.removeItem('SALES_APP_MSG')
      sessionStorage.removeItem('SALES_APP_SIGN')
      sessionStorage.setItem('SALES_APP_TENANT_CODE', tenantCode)
    } else {
      tenantCode = sessionStorage.getItem('SALES_APP_TENANT_CODE')
    }
    let msg = this.props.location.query.msg
    if (msg) {
      msg = msg.replace(/ /g, '+')
    }
    let sign = this.props.location.query.sign
    if ((msg && !sign) || (!msg && sign)) {
      this.showDialog(t('Producer without authentication signature'))
      return
    }
    if (
      !msg &&
      !sign &&
      !sessionStorage.getItem('SALES_APP_MSG') &&
      !sessionStorage.getItem('SALES_APP_SIGN')
    ) {
      this.showDialog(t('No producer information'))
      return
    } else if (
      (msg && msg !== sessionStorage.getItem('SALES_APP_MSG')) ||
      (sign && sign !== sessionStorage.getItem('SALES_APP_SIGN'))
    ) {
      // msg or sign changes clear old session
      sessionStorage.removeItem('SALES_APP_PRODUCER')
      sessionStorage.removeItem('SALES_APP_MSG')
      sessionStorage.removeItem('SALES_APP_SIGN')
      sessionStorage.setItem('SALES_APP_MSG', msg)
      sessionStorage.setItem('SALES_APP_SIGN', sign)
    } else {
      msg = sessionStorage.getItem('SALES_APP_MSG')
      sign = sessionStorage.getItem('SALES_APP_SIGN')
    }
    if (!msg || !sign) {
      this.showDialog(t('No producer information'))
      return
    }
    let producerInSession = sessionStorage.getItem('SALES_APP_PRODUCER')
    if (producerInSession) {
      let producer = JSON.parse(producerInSession)
      this.props.actions.setProducer(producer)
      callback && callback(producer)
      return
    }
    let producerRequest = {
      msg: sessionStorage.getItem('SALES_APP_MSG'),
      sign: sessionStorage.getItem('SALES_APP_SIGN'),
      tenantCode: sessionStorage.getItem('SALES_APP_TENANT_CODE'),
    }
    this.props.actions.getProducer(producerRequest, (error, producer) => {
      if (error) {
        this.showDialog(t('Failed to fetch user'))
        return
      }
      callback && callback(producer)
    })
  }

  getNewItemIndex() {
    let newIndex = this.riderItemIndex
    for (let coverage of this.state.plan.riderCoverages) {
      if (coverage.itemId > newIndex) {
        newIndex = coverage.itemId
      }
    }
    this.riderItemIndex = newIndex + 1
    return this.riderItemIndex
  }

  getNewInsuredId() {
    let newIndex = this.insuredItemIndex
    for (let insured of this.state.plan.insureds) {
      if (parseInt(insured.id) > newIndex) {
        newIndex = parseInt(insured.id)
      }
    }
    this.insuredItemIndex = newIndex + 1
    return this.insuredItemIndex.toString()
  }

  shareConfig(planInitData) {
    let currentLocation = getUrlWithParams(window.location.href)
    configShare(currentLocation, planInitData.packageName,
      t('Quote'), planInitData.packageCode, planInitData.salesInsurer
        .insurerCode)
  }

  loadPage () {
    let salesPackageCode = this.props.params.packageCode
    if (this.props.plan && salesPackageCode == this.props.plan.packageCode) {
      this.shareConfig(this.props.planInitialData)
      // from back button
      let plan = this.props.plan
      if (
        this.isProposal &&
        this.props.proposal &&
        salesPackageCode == this.props.proposal.packageCode
      ) {
        plan = this.mergeProposal(this.props.proposal, this.props.plan)
      }
      console.log(plan)
      this.setState({ plan })
    } else {
      let proposalCode = this.props.params.proposalCode
      let quotationCode = this.props.params.quotationCode
      if (proposalCode && proposalCode !== '0') {
        // from saved proposal
        this.props.actions.getProposal(proposalCode, (error, proposal) => {
          if (error) {
            this.showDialog(t('Failed to fetch proposal'))
            return
          }
          this.loadProductsMetadata(proposal.packageCode, proposal)
        })
      } else if (quotationCode && quotationCode !== '0') {
        // from saved plan
        this.props.actions.getPlan(quotationCode, (error, plan) => {
          if (error) {
            this.showDialog(t('Failed to fetch plan'))
            return
          }
          this.loadProductsMetadata(plan.packageCode, plan)
        })
      } else {
        // new quote or proposal
        this.loadProductsMetadata(salesPackageCode)
      }
    }
  }

  loadProductsMetadata(salesPackageCode, proposal = null) {
    let params = {
      msg: sessionStorage.getItem('SALES_APP_MSG'),
      sign: sessionStorage.getItem('SALES_APP_SIGN'),
      tenantCode: sessionStorage.getItem('SALES_APP_TENANT_CODE'),
      salesPackageCode,
    }
    if (proposal) {
      let productCodeList = [...proposal.mainCoverages, ...proposal.riderCoverages].map(product => product.productCode)
      params.productCodes = productCodeList.join(',')
    }
    this.props.actions.getPlanInitialData(params, (error, planInitData) => {
      if (error) {
        this.showDialog(t('Failed to fetch plan initial data'))
        return
      }
      this.shareConfig(planInitData)
      let plan = this.initPlanByData(planInitData)
      if (proposal) {
        plan = this.mergeProposal(proposal, plan)
      }
      console.log(plan)
      this.setState({ plan }, () => {
        // initial all dropdowns after set plan to state
        setTimeout(() => this.resetSelectValues(), 50)
      })
    })
  }

  mergeProposal (proposal, plan) {
    proposal.proposer.limits = plan.proposer.limits
    for (let pinsured of proposal.insureds) {
      for (let insured of plan.insureds) {
        if (pinsured.id == insured.id) {
          pinsured.limits = insured.limits
          break
        }
      }
    }
    proposal.mainCoverages[0].limits = plan.mainCoverages[0].limits
    for (let prider of proposal.riderCoverages) {
      for (let rider of plan.riderCoverages) {
        if (prider.productCode == rider.productCode) {
          prider.limits = rider.limits
          break
        }
      }
    }
    return proposal
  }

  initPlanByData (planInitData) {
    let plan = {
      langCode: '011',
      packageCode: planInitData.packageCode,
      packageName: planInitData.packageName,
      showAdvice: 'Y',
      advice: planInitData.suggestReason,
      totalFirstYearPrem: 0,
      annualPrem: 0,
      proposalStatus: 31,
      inforceDate: getTomorrow(),
      submitDate: getToday(),
      moneyId: planInitData.planList
        ? planInitData.planList[0].moneyId
        : null,
      beneficiaries: [],
      payerAccounts: [
        {
          paymentMethod: 3,
          bankAccount: null,
        },
      ],
      salesCompanyCode: planInitData.salesInsurer.insurerCode,
      salesChannelCode: sessionStorage.getItem("SALES_APP_TENANT_CODE"),
      producer: JSON.parse(sessionStorage.getItem("SALES_APP_PRODUCER")),
    }
    let insured = {
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
      nationality: DEFAULT_NATIONALITY,
      marriageStatus: '',
      laPhRela: 0,
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
      limits: {
        minAge: null,
        maxAge: null,
        age: [],
        gender: [],
        jobCateList: [],
        ageRange: [],
      },
    }
    let ph = {
      name: '',
      age: null,
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
      nationality: DEFAULT_NATIONALITY,
      marriageStatus: '',
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
      limits: {
        minAge: null,
        maxAge: null,
        age: [],
        gender: [],
        jobCateList: [],
      },
    }
    let secInsured = {
      id: '1',
      name: '',
      age: 0,
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
      nationality: DEFAULT_NATIONALITY,
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
      limits: {
        minAge: null,
        maxAge: null,
        age: [],
        gender: [],
        jobCateList: [],
        ageRange: [],
      },
    }
    let mainCoverages = []
    let riderCoverages = []
    let masterIndex = 1
    if (planInitData.planList) {
      for (let [
        index,
        product,
      ] of planInitData.planList.entries()) {
        let coverage = this.initCoverageAndLimitsByUnitFlag(product, ph)
        if (product.insType === '1') {
          if (mainCoverages.length === 0) {
            coverage.itemId = masterIndex
            mainCoverages.push(coverage)
          } else {
            console.error('Multiple main product is not supported yet', product)
          }
        } else {
          riderCoverages.push(coverage)
        }
      }
    }
    for (let [index, coverage] of riderCoverages.entries()) {
      coverage.masterItemId = masterIndex
      coverage.itemId = this.getNewItemIndex()
    }
    // init roles age and gender after limits set;
    this.initRolesLimitsByCoverages(
      [...mainCoverages, ...riderCoverages],
      insured,
      secInsured,
      ph
    )
    let insureds = []
    insureds.push(insured)
    if (this.shouldHave2ndInsured(planInitData.planList)) {
      insureds.push(secInsured)
    }
    if (this.isProposal || this.shouldHavePh(planInitData.planList) || this.showProposerAlways(planInitData)) {
      ph.age = MIN_PH_AGE
    }
    plan.insureds = insureds
    plan.proposer = ph
    plan.mainCoverages = mainCoverages
    plan.riderCoverages = riderCoverages
    // set producer's serviceAgentCode in the company of this product if he has
    if (plan.producer && plan.producer.agentInfoMap && plan.producer.agentInfoMap[plan.salesCompanyCode]) {
      plan.serviceAgentCode = plan.producer.agentInfoMap[plan.salesCompanyCode][0].agentCode
    }
    this.insuredModel = deepClone(insured)
    return plan
  }

  initRolesLimitsByCoverages (coverages, insured, secInsured, ph) {
    for (let coverage of coverages) {
      if (coverage.limits.pointToPH) {
        if (
          coverage.limits.smokingIndi === '2' ||
          coverage.limits.smokingIndi === 'Y'
        ) {
          ph.smoking = 'N'
          ph.limits.smokingType = '2'
        } else if (coverage.limits.smokingIndi === '1') {
          ph.smoking = '1'
          ph.limits.smokingType = '1'
        }
        if (coverage.limits.socialInsureIndi) {
          ph.socialInsuranceIndi = 'Y'
        }
        if (coverage.limits.jobIndi) {
          ph.jobCateId = 1
          if (
            ph.limits.jobCateList.length === 0 &&
            coverage.limits.jobCateList.length > 0
          ) {
            ph.limits.jobCateList = coverage.limits.jobCateList
          } else {
            ph.limits.jobCateList = ph.limits.jobCateList.filter(jobCateId =>
              coverage.limits.jobCateList.includes(jobCateId)
            )
          }
        }
        if (
          typeof coverage.limits.minAge === 'number' &&
          (typeof ph.limits.minAge !== 'number' ||
            ph.limits.minAge < coverage.limits.minAge)
        ) {
          ph.limits.minAge = coverage.limits.minAge
        }
        if (
          typeof coverage.limits.maxAge === 'number' &&
          (typeof !ph.limits.maxAge !== 'number' ||
            ph.limits.maxAge > coverage.limits.maxAge)
        ) {
          ph.limits.maxAge = coverage.limits.maxAge
        }
        // ph.limits.gender.push(...coverage.limits.gender); // currently no product should limit policyholder's gander
      } else if (coverage.limits.pointToSecInsured) {
        if (coverage.limits.ageRange) {
          secInsured.limits.ageRange.push(coverage.limits.ageRange)
        }
        if (
          coverage.limits.smokingIndi === '2' ||
          coverage.limits.smokingIndi === 'Y'
        ) {
          secInsured.smoking = 'N'
          secInsured.limits.smokingType = '2'
        } else if (coverage.limits.smokingIndi === '1') {
          secInsured.smoking = '1'
          secInsured.limits.smokingType = '1'
        }
        if (coverage.limits.socialInsureIndi) {
          secInsured.socialInsuranceIndi = 'Y'
        }
        if (coverage.limits.jobIndi) {
          secInsured.jobCateId = 1
          if (
            secInsured.limits.jobCateList.length === 0 &&
            coverage.limits.jobCateList.length > 0
          ) {
            secInsured.limits.jobCateList = coverage.limits.jobCateList
          } else {
            secInsured.limits.jobCateList = secInsured.limits.jobCateList.filter(
              jobCateId => coverage.limits.jobCateList.includes(jobCateId)
            )
          }
        }
        if (
          typeof coverage.limits.minAge === 'number' &&
          (typeof secInsured.limits.minAge !== 'number' ||
            secInsured.limits.minAge < coverage.limits.minAge)
        ) {
          secInsured.limits.minAge = coverage.limits.minAge
        }
        if (
          typeof coverage.limits.maxAge === 'number' &&
          (typeof !secInsured.limits.maxAge !== 'number' ||
            secInsured.limits.maxAge > coverage.limits.maxAge)
        ) {
          secInsured.limits.maxAge = coverage.limits.maxAge
        }
        secInsured.limits.gender.push(...coverage.limits.gender)
      } else {
        if (coverage.limits.ageRange) {
          insured.limits.ageRange.push(coverage.limits.ageRange)
        }
        if (
          coverage.limits.smokingIndi === '2' ||
          coverage.limits.smokingIndi === 'Y'
        ) {
          insured.smoking = 'N'
          insured.limits.smokingType = '2'
        } else if (coverage.limits.smokingIndi === '1') {
          insured.smoking = '1'
          insured.limits.smokingType = '1'
        }
        if (coverage.limits.socialInsureIndi) {
          insured.socialInsuranceIndi = 'Y'
        }
        if (coverage.limits.jobIndi) {
          insured.jobCateId = 1
          if (
            insured.limits.jobCateList.length === 0 &&
            coverage.limits.jobCateList.length > 0
          ) {
            insured.limits.jobCateList = coverage.limits.jobCateList
          } else {
            insured.limits.jobCateList = insured.limits.jobCateList.filter(
              jobCateId => coverage.limits.jobCateList.includes(jobCateId)
            )
          }
        }
        if (
          typeof coverage.limits.minAge === 'number' &&
          (typeof insured.limits.minAge !== 'number' ||
            insured.limits.minAge < coverage.limits.minAge)
        ) {
          insured.limits.minAge = coverage.limits.minAge
        }
        if (
          typeof coverage.limits.maxAge === 'number' &&
          (typeof insured.limits.maxAge !== 'number' ||
            insured.limits.maxAge > coverage.limits.maxAge)
        ) {
          insured.limits.maxAge = coverage.limits.maxAge
        }
        insured.limits.gender.push(...coverage.limits.gender)
      }
    }
    if (typeof insured.limits.minAge !== 'number') {
      insured.limits.minAge = 0
    }
    if (typeof insured.limits.maxAge !== 'number') {
      insured.limits.maxAge = MAX_AGE
    }
    for (let i = insured.limits.minAge; i <= insured.limits.maxAge; i++) {
      insured.limits.age.push(i)
    }
    if (typeof secInsured.limits.minAge !== 'number') {
      secInsured.limits.minAge = 0
    }
    if (typeof secInsured.limits.maxAge !== 'number') {
      secInsured.limits.maxAge = MAX_AGE
    }
    for (let i = secInsured.limits.minAge; i <= secInsured.limits.maxAge; i++) {
      secInsured.limits.age.push(i)
    }
  }

  initCoverageAndLimitsByUnitFlag (product, ph) {
    let coverage = {
      productName: product.salesProductName,
      productCode: product.salesProductCode,
      productId: product.salesProductId,
      unitFlag: product.unitFlag,
      paymentFreq: product.paymentFreqs && product.paymentFreqs.length > 0? product.paymentFreqs[0] : 1,
      limits: {
        isMain: product.insType === '1',
        chargePeriod: [],
        coveragePeriod: [],
        payPeriod: [],
        endPeriod: [],
        payEnsure: [],
        benefitlevel: [],
        amount: [],
        prem: [],
        isPackageProduct: false,
        attachCompulsory: false,
        pointToSecInsured: false,
        pointToPH: false,
        isWaiver: false,
        minAge: null,
        maxAge: null,
        gender: [],
        isIlpProduct: false,
        isAnnuityProduct: false,
        singleTopupPermit: false,
        regularTopupPermit: false,
        partialWithdrawPermit: false,
        smokingIndi: false,
        jobIndi: false,
        socialInsureIndi: false,
        waiverChargeYearAdjustment: 0,
        jobCateList: [],
        incrementIndex: 1,
        funds: product.funds,
        targetAthRateList: [],
        ageRange: product.ageRange,
        paymentFreqs: product.paymentFreqs? product.paymentFreqs : [],
        familyType: product.familyType === "1",
        ally: product.ally === "1",
        regPartWithdrMinAmount: product.regPartWithdrMinAmount? product.regPartWithdrMinAmount : 0,
        regPartWithdrMaxAmount: product.regPartWithdrMaxAmount? product.regPartWithdrMaxAmount : MAX_AMOUNT,
        topupStartYear: product.topupStartYear? product.topupStartYear : 1,
        partialWithdrawStartYear: product.partialWithdrawStartYear? product.partialWithdrawStartYear : 1,
        regPartWitdrStartYear: product.regPartWitdrStartYear? product.regPartWitdrStartYear : 1,
        isUDRider: product.isUDRider === "Y",
      },
    }
    if (product.pointToSecInsured === 'Y') {
      coverage.insuredIds = ['1']
      coverage.limits.pointToSecInsured = true
    } else if (product.pointToPH === 'Y') {
      coverage.limits.pointToPH = true
      coverage.insuredIds = ['-1']
    } else {
      coverage.insuredIds = ['0']
    }
    if (product.isAnnuityProduct === 'Y') {
      coverage.limits.isAnnuityProduct = true
    }
    if (product.isPackageProduct === 'Y') {
      coverage.limits.isPackageProduct = true
    }
    if (product.attachCompulsory === '1' || product.attachCompulsory === 'Y') {
      coverage.limits.attachCompulsory = true
    }
    if (product.smokingIndi !== 'N' && product.smokingIndi !== '0') {
      coverage.limits.smokingIndi = product.smokingIndi
    }
    if (product.jobIndi === 'Y') {
      coverage.limits.jobIndi = true
      coverage.limits.jobCateList = product.jobCateList || []
    }
    if (product.socialInsureIndi === 'Y') {
      coverage.limits.socialInsureIndi = true
    }
    if (product.isWaiver === 'Y') {
      let waiverChargeYearAdjustment = product.waiverChargeYearAdjustment
      if (typeof waiverChargeYearAdjustment !== 'number') {
        waiverChargeYearAdjustment = -1
      }
      coverage.limits.waiverChargeYearAdjustment = waiverChargeYearAdjustment
    }
    if (product.incrementIndex) {
      coverage.limits.incrementIndex = product.incrementIndex
    }
    if (product.targetAthRateList) {
      coverage.limits.targetAthRateList = product.targetAthRateList
    }
    if (product.ageLimitList) {
      product.ageLimitList.map(ageLimit => {
        if (
          typeof ageLimit.minPhAge === 'number' &&
          typeof ageLimit.maxPhAge === 'number'
        ) {
          let phAgeLimit = {
            minInsdAge: ageLimit.minInsdAge,
            maxInsdAge: ageLimit.maxInsdAge,
            gender: ageLimit.gender,
            minPhAge: ageLimit.minPhAge,
            maxPhAge: ageLimit.maxPhAge,
            chargePeriod: ageLimit.chargePeriod,
            chargeYear: ageLimit.chargeYear,
            waiverChargeYearAdjustment:
              coverage.limits.waiverChargeYearAdjustment,
          }
          if (product.pointToPH === 'Y') {
            phAgeLimit.pointToPH = true
          } else if (product.pointToSecInsured === 'Y') {
            phAgeLimit.pointToSecInsured = false
          }
          ph.limits.age.push(phAgeLimit)
        }
        if (
          typeof ageLimit.minInsdAge === 'number' &&
          (typeof coverage.limits.minAge !== 'number' ||
            ageLimit.minInsdAge < coverage.limits.minAge)
        ) {
          coverage.limits.minAge = ageLimit.minInsdAge
        }
        if (
          typeof ageLimit.maxInsdAge === 'number' &&
          (typeof coverage.limits.maxAge !== 'number' ||
            ageLimit.maxInsdAge > coverage.limits.maxAge)
        ) {
          coverage.limits.maxAge = ageLimit.maxInsdAge
        }
        coverage.limits.gender.push({
          minAge: ageLimit.minInsdAge || 0,
          maxAge: ageLimit.maxInsdAge || MAX_AGE,
          gender: ageLimit.gender,
        })

        let chargePeriodLimit = this.getChargePeriodLimit(
          coverage.limits.chargePeriod,
          {
            periodType: ageLimit.chargePeriod,
            periodValue: ageLimit.chargeYear,
            gender: ageLimit.gender,
          }
        )
        if (chargePeriodLimit) {
          if (
            typeof ageLimit.minInsdAge === 'number' &&
            (typeof chargePeriodLimit.minAge !== 'number' ||
              ageLimit.minInsdAge < chargePeriodLimit.minAge)
          ) {
            chargePeriodLimit.minAge = ageLimit.minInsdAge
          }
          if (
            typeof ageLimit.maxInsdAge === 'number' &&
            (typeof chargePeriodLimit.maxAge !== 'number' ||
              ageLimit.maxInsdAge > chargePeriodLimit.maxAge)
          ) {
            chargePeriodLimit.maxAge = ageLimit.maxInsdAge
          }
        } else {
          chargePeriodLimit = {
            periodType: ageLimit.chargePeriod,
            periodValue: ageLimit.chargeYear,
            minAge: ageLimit.minInsdAge,
            maxAge: ageLimit.maxInsdAge,
            gender: ageLimit.gender,
          }
          coverage.limits.chargePeriod.push(chargePeriodLimit)
        }

        // coverage has inner charge limit with sub inner age limit
        let coveragePeriodLimit = this.getCoveragePeriodLimit(
          coverage.limits.coveragePeriod,
          {
            periodType: ageLimit.coveragePeriod,
            periodValue: ageLimit.coverageYear,
          }
        )
        if (coveragePeriodLimit) {
          let innerChargePeriodLimit = this.getChargePeriodLimit(
            coveragePeriodLimit.chargePeriod,
            {
              periodType: ageLimit.chargePeriod,
              periodValue: ageLimit.chargeYear,
              gender: ageLimit.gender,
            }
          )
          if (!innerChargePeriodLimit) {
            coveragePeriodLimit.chargePeriod.push({
              periodType: ageLimit.chargePeriod,
              periodValue: ageLimit.chargeYear,
              minAge: ageLimit.minInsdAge,
              maxAge: ageLimit.maxInsdAge,
              gender: ageLimit.gender,
            })
          } else {
            if (
              typeof ageLimit.minInsdAge === 'number' &&
              (typeof innerChargePeriodLimit.minAge !== 'number' ||
              ageLimit.minInsdAge < innerChargePeriodLimit.minAge)
            ) {
              innerChargePeriodLimit.minAge = ageLimit.minInsdAge
            }
            if (
              typeof ageLimit.maxInsdAge === 'number' &&
              (typeof innerChargePeriodLimit.maxAge !== 'number' ||
              ageLimit.maxInsdAge > innerChargePeriodLimit.maxAge)
            ) {
              innerChargePeriodLimit.maxAge = ageLimit.maxInsdAge
            }
          }
        } else {
          coveragePeriodLimit = {
            periodType: ageLimit.coveragePeriod,
            periodValue: ageLimit.coverageYear,
            chargePeriod: [
              {
                periodType: ageLimit.chargePeriod,
                periodValue: ageLimit.chargeYear,
                minAge: ageLimit.minInsdAge,
                maxAge: ageLimit.maxInsdAge,
                gender: ageLimit.gender,
              },
            ],
          }
          coverage.limits.coveragePeriod.push(coveragePeriodLimit)
        }

        // pay has inner covergage limit with sub inner charge limit with sub sub inner age limit
        let payPeriodLimit = this.getPayPeriodLimit(coverage.limits.payPeriod, {
          periodType: ageLimit.payPeriod,
          periodValue: ageLimit.payYear,
        })
        if (payPeriodLimit) {
          let innerCoveragePeriodLimit = this.getCoveragePeriodLimit(
            payPeriodLimit.coveragePeriod,
            {
              periodType: ageLimit.coveragePeriod,
              periodValue: ageLimit.coverageYear,
            }
          )
          if (!innerCoveragePeriodLimit) {
            payPeriodLimit.coveragePeriod.push({
              periodType: ageLimit.coveragePeriod,
              periodValue: ageLimit.coverageYear,
              chargePeriod: [
                {
                  periodType: ageLimit.chargePeriod,
                  periodValue: ageLimit.chargeYear,
                  minAge: ageLimit.minInsdAge,
                  maxAge: ageLimit.maxInsdAge,
                  gender: ageLimit.gender,
                },
              ],
            })
          } else {
            let subInnerChargePeriodLimit = this.getChargePeriodLimit(
              innerCoveragePeriodLimit.chargePeriod,
              {
                periodType: ageLimit.chargePeriod,
                periodValue: ageLimit.chargeYear,
                gender: ageLimit.gender,
              }
            )
            if (!subInnerChargePeriodLimit) {
              innerCoveragePeriodLimit.chargePeriod.push({
                periodType: ageLimit.chargePeriod,
                periodValue: ageLimit.chargeYear,
                minAge: ageLimit.minInsdAge,
                maxAge: ageLimit.maxInsdAge,
                gender: ageLimit.gender,
              })
            } else {
              if (
                typeof ageLimit.minInsdAge === 'number' &&
                (typeof subInnerChargePeriodLimit.minAge !== 'number' ||
                ageLimit.minInsdAge < subInnerChargePeriodLimit.minAge)
              ) {
                subInnerChargePeriodLimit.minAge = ageLimit.minInsdAge
              }
              if (
                typeof ageLimit.maxInsdAge === 'number' &&
                (typeof subInnerChargePeriodLimit.maxAge !== 'number' ||
                ageLimit.maxInsdAge > subInnerChargePeriodLimit.maxAge)
              ) {
                subInnerChargePeriodLimit.maxAge = ageLimit.maxInsdAge
              }
            }
          }
        } else {
          payPeriodLimit = {
            periodType: ageLimit.payPeriod,
            periodValue: ageLimit.payYear,
            coveragePeriod: [
              {
                periodType: ageLimit.coveragePeriod,
                periodValue: ageLimit.coverageYear,
                chargePeriod: [
                  {
                    periodType: ageLimit.chargePeriod,
                    periodValue: ageLimit.chargeYear,
                    minAge: ageLimit.minInsdAge,
                    maxAge: ageLimit.maxInsdAge,
                    gender: ageLimit.gender,
                  },
                ],
              },
            ],
          }
          coverage.limits.payPeriod.push(payPeriodLimit)
        }
        // end has inner pay limit with sub inner covergage limit with sub inner charge limit with sub sub inner age limit
        let endPeriodLimit = this.getEndPeriodLimit(coverage.limits.endPeriod, {
          periodType: ageLimit.endPeriod,
          periodValue: ageLimit.endYear,
        })
        if (endPeriodLimit) {
          let innerPayPeriodLimit = this.getPayPeriodLimit(
            endPeriodLimit.payPeriod,
            {
              periodType: ageLimit.payPeriod,
              periodValue: ageLimit.payYear,
            }
          )
          if (!innerPayPeriodLimit) {
            endPeriodLimit.payPeriod.push({
              periodType: ageLimit.payPeriod,
              periodValue: ageLimit.payYear,
              coveragePeriod: [
                {
                  periodType: ageLimit.coveragePeriod,
                  periodValue: ageLimit.coverageYear,
                  chargePeriod: [
                    {
                      periodType: ageLimit.chargePeriod,
                      periodValue: ageLimit.chargeYear,
                      minAge: ageLimit.minInsdAge,
                      maxAge: ageLimit.maxInsdAge,
                      gender: ageLimit.gender,
                    },
                  ]
                }
              ]
            })
          } else {
            let innerCoveragePeriodLimit = this.getCoveragePeriodLimit(
              innerPayPeriodLimit.coveragePeriod,
              {
                periodType: ageLimit.coveragePeriod,
                periodValue: ageLimit.coverageYear,
              }
            )
            if (!innerCoveragePeriodLimit) {
              innerPayPeriodLimit.coveragePeriod.push({
                periodType: ageLimit.coveragePeriod,
                periodValue: ageLimit.coverageYear,
                chargePeriod: [
                  {
                    periodType: ageLimit.chargePeriod,
                    periodValue: ageLimit.chargeYear,
                    minAge: ageLimit.minInsdAge,
                    maxAge: ageLimit.maxInsdAge,
                    gender: ageLimit.gender,
                  },
                ],
              })
            } else {
              let subInnerChargePeriodLimit = this.getChargePeriodLimit(
                innerCoveragePeriodLimit.chargePeriod,
                {
                  periodType: ageLimit.chargePeriod,
                  periodValue: ageLimit.chargeYear,
                  gender: ageLimit.gender,
                }
              )
              if (!subInnerChargePeriodLimit) {
                innerCoveragePeriodLimit.chargePeriod.push({
                  periodType: ageLimit.chargePeriod,
                  periodValue: ageLimit.chargeYear,
                  minAge: ageLimit.minInsdAge,
                  maxAge: ageLimit.maxInsdAge,
                  gender: ageLimit.gender,
                })
              } else {
                if (
                  typeof ageLimit.minInsdAge === 'number' &&
                  (typeof subInnerChargePeriodLimit.minAge !== 'number' ||
                  ageLimit.minInsdAge < subInnerChargePeriodLimit.minAge)
                ) {
                  subInnerChargePeriodLimit.minAge = ageLimit.minInsdAge
                }
                if (
                  typeof ageLimit.maxInsdAge === 'number' &&
                  (typeof subInnerChargePeriodLimit.maxAge !== 'number' ||
                  ageLimit.maxInsdAge > subInnerChargePeriodLimit.maxAge)
                ) {
                  subInnerChargePeriodLimit.maxAge = ageLimit.maxInsdAge
                }
              }
            }
          }
        } else {
          endPeriodLimit = {
            periodType: ageLimit.endPeriod,
            periodValue: ageLimit.endYear,
            payPeriod : [
              {
                periodType: ageLimit.payPeriod,
                periodValue: ageLimit.payYear,
                coveragePeriod: [
                  {
                    periodType: ageLimit.coveragePeriod,
                    periodValue: ageLimit.coverageYear,
                    chargePeriod: [
                      {
                        periodType: ageLimit.chargePeriod,
                        periodValue: ageLimit.chargeYear,
                        minAge: ageLimit.minInsdAge,
                        maxAge: ageLimit.maxInsdAge,
                        gender: ageLimit.gender,
                      },
                    ],
                  },
                ]
              }
            ]
          }
          coverage.limits.endPeriod.push(endPeriodLimit)
        }
        let payEnsureLimit = this.getPayEnsureLimit(coverage.limits.payEnsure, {
          payEnsure: ageLimit.payEnsure || 0,
        })
        if (payEnsureLimit) {
          let innerPayPeriodLimit = this.getPayPeriodLimit(
            payEnsureLimit.payPeriod,
            {
              periodType: ageLimit.payPeriod,
              periodValue: ageLimit.payYear,
            }
          )
          if (!innerPayPeriodLimit) {
            payEnsureLimit.payPeriod.push({
              periodType: ageLimit.payPeriod,
              periodValue: ageLimit.payYear,
              coveragePeriod: [
                {
                  periodType: ageLimit.coveragePeriod,
                  periodValue: ageLimit.coverageYear,
                  chargePeriod: [
                    {
                      periodType: ageLimit.chargePeriod,
                      periodValue: ageLimit.chargeYear,
                      minAge: ageLimit.minInsdAge,
                      maxAge: ageLimit.maxInsdAge,
                      gender: ageLimit.gender,
                    },
                  ]
                }
              ]
            })
          } else {
            let innerCoveragePeriodLimit = this.getCoveragePeriodLimit(
              innerPayPeriodLimit.coveragePeriod,
              {
                periodType: ageLimit.coveragePeriod,
                periodValue: ageLimit.coverageYear,
              }
            )
            if (!innerCoveragePeriodLimit) {
              innerPayPeriodLimit.coveragePeriod.push({
                periodType: ageLimit.coveragePeriod,
                periodValue: ageLimit.coverageYear,
                chargePeriod: [
                  {
                    periodType: ageLimit.chargePeriod,
                    periodValue: ageLimit.chargeYear,
                    minAge: ageLimit.minInsdAge,
                    maxAge: ageLimit.maxInsdAge,
                    gender: ageLimit.gender,
                  },
                ],
              })
            } else {
              let subInnerChargePeriodLimit = this.getChargePeriodLimit(
                innerCoveragePeriodLimit.chargePeriod,
                {
                  periodType: ageLimit.chargePeriod,
                  periodValue: ageLimit.chargeYear,
                  gender: ageLimit.gender,
                }
              )
              if (!subInnerChargePeriodLimit) {
                innerCoveragePeriodLimit.chargePeriod.push({
                  periodType: ageLimit.chargePeriod,
                  periodValue: ageLimit.chargeYear,
                  minAge: ageLimit.minInsdAge,
                  maxAge: ageLimit.maxInsdAge,
                  gender: ageLimit.gender,
                })
              } else {
                if (
                  typeof ageLimit.minInsdAge === 'number' &&
                  (typeof subInnerChargePeriodLimit.minAge !== 'number' ||
                  ageLimit.minInsdAge < subInnerChargePeriodLimit.minAge)
                ) {
                  subInnerChargePeriodLimit.minAge = ageLimit.minInsdAge
                }
                if (
                  typeof ageLimit.maxInsdAge === 'number' &&
                  (typeof subInnerChargePeriodLimit.maxAge !== 'number' ||
                  ageLimit.maxInsdAge > subInnerChargePeriodLimit.maxAge)
                ) {
                  subInnerChargePeriodLimit.maxAge = ageLimit.maxInsdAge
                }
              }
            }
          }
        } else {
          payEnsureLimit = {
            payEnsure: ageLimit.payEnsure || 0,
            payPeriod : [
              {
                periodType: ageLimit.payPeriod,
                periodValue: ageLimit.payYear,
                coveragePeriod: [
                  {
                    periodType: ageLimit.coveragePeriod,
                    periodValue: ageLimit.coverageYear,
                    chargePeriod: [
                      {
                        periodType: ageLimit.chargePeriod,
                        periodValue: ageLimit.chargeYear,
                        minAge: ageLimit.minInsdAge,
                        maxAge: ageLimit.maxInsdAge,
                        gender: ageLimit.gender,
                      },
                    ],
                  },
                ]
              }
            ]
          }
          coverage.limits.payEnsure.push(payEnsureLimit)
        }
      })
      coverage.limits.chargePeriod.sort(this.periodSortDescComparator)
      coverage.limits.coveragePeriod.sort(this.periodSortDescComparator)
      coverage.limits.payPeriod.sort(this.periodSortAscComparator)
      coverage.limits.endPeriod.sort(this.periodSortAscComparator)
    }
    if (product.amountLimitList) {
      coverage.limits.amount = [...product.amountLimitList]
    }
    if (product.premLimitList) {
      coverage.limits.prem = [...product.premLimitList]
    }
    if (product.benefitLevelList) {
      coverage.limits.benefitlevel = [...product.benefitLevelList].sort((a, b) => {
        if (a.benefitLevel < b.benefitLevel) {
          return -1
        }
        if (a.benefitLevel > b.benefitLevel) {
          return 1
        }
        return 0
      })
    }
    if (product.isWaiver === 'Y') {
      coverage.limits.isWaiver = true
    } else if (product.unitFlag == '6') {
      coverage.sa =
        coverage.limits.amount.length > 0
          ? coverage.limits.amount[0].minAmount
          : 0
      coverage.chargePeriod = {
        periodType:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodValue
            : 1,
      }
      coverage.coveragePeriod = {
        periodType:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodValue
            : 0,
      }
      if (product.isAnnuityProduct === 'Y') {
        coverage.payPeriod = {
          periodType: coverage.limits.payPeriod.length > 0
            ? coverage.limits.payPeriod[0].periodType
            : 0,
          periodValue: coverage.limits.payPeriod.length > 0
            ? coverage.limits.payPeriod[0].periodValue
            : 0,
        }
        coverage.endPeriod = {
          periodType: coverage.limits.endPeriod.length > 0
            ? coverage.limits.endPeriod[0].periodType
            : 0,
          periodValue: coverage.limits.endPeriod.length > 0
            ? coverage.limits.endPeriod[0].periodValue
            : 0,
        }
        coverage.extraProperties = coverage.extraProperties? coverage.extraProperties : {}
        coverage.extraProperties['pay_ensure'] = coverage.limits.payEnsure.length > 0? coverage.limits.payEnsure[0].payEnsure : 0
      }
      coverage.unit = 1
    } else if (['7', '10'].includes(""+product.unitFlag)) {
      coverage.premium =
        coverage.limits.prem.length > 0
          ? coverage.limits.prem[0].minInitialPrem
          : 0
      coverage.chargePeriod = {
        periodType:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodValue
            : 1,
      }
      coverage.coveragePeriod = {
        periodType:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodValue
            : 0,
      }
      if (product.isAnnuityProduct === 'Y') {
        coverage.payPeriod = {
          periodType:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodValue
              : 0,
        }
        coverage.endPeriod = {
          periodType:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodValue
              : 0,
        }
        coverage.extraProperties = coverage.extraProperties? coverage.extraProperties : {}
        coverage.extraProperties['pay_ensure'] = coverage.limits.payEnsure.length > 0? coverage.limits.payEnsure[0].payEnsure : 0
      }
      coverage.unit = 1
    } else if (product.unitFlag == '1') {
      coverage.unit =
        coverage.limits.amount.length > 0
          ? coverage.limits.amount[0].minAmount < 1
            ? 1
            : coverage.limits.amount[0].minAmount
          : 1
      coverage.chargePeriod = {
        periodType:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodValue
            : 1,
      }
      coverage.coveragePeriod = {
        periodType:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodValue
            : 0,
      }
      if (product.isAnnuityProduct === 'Y') {
        coverage.payPeriod = {
          periodType:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodValue
              : 0,
        }
        coverage.endPeriod = {
          periodType:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodValue
              : 0,
        }
        coverage.extraProperties = coverage.extraProperties? coverage.extraProperties : {}
        coverage.extraProperties['pay_ensure'] = coverage.limits.payEnsure.length > 0? coverage.limits.payEnsure[0].payEnsure : 0
      }
    } else if (product.unitFlag == '3') {
      coverage.unit =
        coverage.limits.amount.length > 0
          ? coverage.limits.amount[0].minAmount < 1
            ? 1
            : coverage.limits.amount[0].minAmount
          : 1
      coverage.benefitlevel =
        coverage.limits.benefitlevel.length > 0
          ? coverage.limits.benefitlevel[0].benefitLevel
          : '1'
      coverage.chargePeriod = {
        periodType:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodValue
            : 1,
      }
      coverage.coveragePeriod = {
        periodType:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodValue
            : 0,
      }
      if (product.isAnnuityProduct === 'Y') {
        coverage.payPeriod = {
          periodType:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodValue
              : 0,
        }
        coverage.endPeriod = {
          periodType:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodValue
              : 0,
        }
        coverage.extraProperties = coverage.extraProperties? coverage.extraProperties : {}
        coverage.extraProperties['pay_ensure'] = coverage.limits.payEnsure.length > 0? coverage.limits.payEnsure[0].payEnsure : 0
      }
    } else if (product.unitFlag == '4') {
      coverage.unit = 1
      coverage.benefitlevel =
        coverage.limits.benefitlevel.length > 0
          ? coverage.limits.benefitlevel[0].benefitLevel
          : '1'
      coverage.chargePeriod = {
        periodType:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodValue
            : 1,
      }
      coverage.coveragePeriod = {
        periodType:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodValue
            : 0,
      }
      if (product.isAnnuityProduct === 'Y') {
        coverage.payPeriod = {
          periodType:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodValue
              : 0,
        }
        coverage.endPeriod = {
          periodType:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodValue
              : 0,
        }
        coverage.extraProperties = coverage.extraProperties? coverage.extraProperties : {}
        coverage.extraProperties['pay_ensure'] = coverage.limits.payEnsure.length > 0? coverage.limits.payEnsure[0].payEnsure : 0
      }
    } else if (product.unitFlag == '0') {
      coverage.unit = 1
      coverage.sa =
        coverage.limits.amount.length > 0
          ? coverage.limits.amount[0].minAmount
          : 0
      coverage.premium =
        coverage.limits.prem.length > 0
          ? coverage.limits.prem[0].minInitialPrem
          : 0
      coverage.chargePeriod = {
        periodType:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodValue
            : 1,
      }
      coverage.coveragePeriod = {
        periodType:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodValue
            : 0,
      }
      if (product.isAnnuityProduct === 'Y') {
        coverage.payPeriod = {
          periodType:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodValue
              : 0,
        }
        coverage.endPeriod = {
          periodType:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodValue
              : 0,
        }
        coverage.extraProperties = coverage.extraProperties? coverage.extraProperties : {}
        coverage.extraProperties['pay_ensure'] = coverage.limits.payEnsure.length > 0? coverage.limits.payEnsure[0].payEnsure : 0
      }
    } else if (product.unitFlag == '9') {
      coverage.sa = 0
      coverage.unit = 1
      coverage.chargePeriod = {
        periodType:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.chargePeriod.length > 0
            ? coverage.limits.chargePeriod[0].periodValue
            : 1,
      }
      coverage.coveragePeriod = {
        periodType:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodType
            : 1,
        periodValue:
          coverage.limits.coveragePeriod.length > 0
            ? coverage.limits.coveragePeriod[0].periodValue
            : 0,
      }
      if (product.isAnnuityProduct === 'Y') {
        coverage.payPeriod = {
          periodType:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.payPeriod.length > 0
              ? coverage.limits.payPeriod[0].periodValue
              : 0,
        }
        coverage.endPeriod = {
          periodType:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodType
              : 0,
          periodValue:
            coverage.limits.endPeriod.length > 0
              ? coverage.limits.endPeriod[0].periodValue
              : 0,
        }
        coverage.extraProperties = coverage.extraProperties? coverage.extraProperties : {}
        coverage.extraProperties['pay_ensure'] = coverage.limits.payEnsure.length > 0? coverage.limits.payEnsure[0].payEnsure : 0
      }
    } else {
      console.error('Not supported unitFlag', product)
    }
    // init ILP
    if (product.insType === '1' && product.isIlpProduct === 'Y') {
      coverage.limits.isIlpProduct = true
      coverage.investRates = []
      coverage.topupWithdraws = []
      if (product.regularTopupPermit === 'Y') {
        coverage.limits.regularTopupPermit = true
        let regularTopup = {
          startYear: 1,
          endYear: coverage.chargePeriod.periodValue,
          premType: '3',
          amount: 0,
        }
        coverage.topupWithdraws.push(regularTopup)
      }
      if (product.singleTopupPermit === 'Y') {
        coverage.limits.singleTopupPermit = true
      }
      if (product.partialWithdrawPermit === 'Y') {
        coverage.limits.partialWithdrawPermit = true
      }
    }
    this.addProductFactorSpecial(coverage, product)
    return coverage
  }

  addProductFactorSpecial(coverage, product) {
    if (coverage.productCode === 'ATCHIRP') {
      coverage.extraProperties = coverage.extraProperties? coverage.extraProperties : {}
      coverage.extraProperties['Indo_TwoYears_Flag'] = '0'
    }
  }

  getPayPeriodLimit (payPeriodLimitList, payPeriod) {
    for (let payPeriodLimit of payPeriodLimitList) {
      if (
        payPeriodLimit.periodType === payPeriod.periodType &&
        payPeriodLimit.periodValue === payPeriod.periodValue
      ) {
        return payPeriodLimit
      }
    }
    return null
  }

  getEndPeriodLimit (endPeriodLimitList, endPeriod) {
    for (let endPeriodLimit of endPeriodLimitList) {
      if (
        endPeriodLimit.periodType === endPeriod.periodType &&
        endPeriodLimit.periodValue === endPeriod.periodValue
      ) {
        return endPeriodLimit
      }
    }
    return null
  }

  getPayEnsureLimit(payEnsureLimitList, payEnsure) {
    for (let payEnsureLimit of payEnsureLimitList) {
      if (payEnsureLimit.payEnsure === payEnsure.payEnsure) {
        return payEnsureLimit
      }
    }
    return null
  }

  getCoveragePeriodLimit (coveragePeriodLimitList, coveragePeriod) {
    for (let coveragePeriodLimit of coveragePeriodLimitList) {
      if (
        coveragePeriodLimit.periodType === coveragePeriod.periodType &&
        coveragePeriodLimit.periodValue === coveragePeriod.periodValue
      ) {
        return coveragePeriodLimit
      }
    }
    return null
  }

  getChargePeriodLimit (chargePeriodLimitList, chargePeriod) {
    for (let chargePeriodLimit of chargePeriodLimitList) {
      if (
        chargePeriodLimit.periodType === chargePeriod.periodType &&
        chargePeriodLimit.periodValue === chargePeriod.periodValue &&
        chargePeriodLimit.gender === chargePeriod.gender
      ) {
        return chargePeriodLimit
      }
    }
    return null
  }

  shouldHavePh (productList = []) {
    for (let product of productList) {
      if (product.pointToPH === 'Y') {
        return true
      }
    }
    return false
  }

  shouldHave2ndInsured (productList = []) {
    for (let product of productList) {
      if (product.pointToSecInsured === 'Y') {
        return true
      }
    }
    return false
  }

  resetSelectValues () {
    // fire ages change to reset select values
    let insured = this.state.plan.insureds[0]
    if (!insured.limits.age.includes(insured.age)) {
      let defaultAge = insured.limits.age[0]
      insured.age = defaultAge
    }
    this.onMainInsuredAgeChange({birthday: insured.birthday, age: insured.age})
    if (this.state.plan.insureds.length > 1) {
      let secInsured = this.state.plan.insureds[1]
      if (!secInsured.limits.age.includes(secInsured.age)) {
        let defaultAge = secInsured.limits.age[0]
        secInsured.age = defaultAge
      }
      this.onSecInsuredAgeChange({birthday: secInsured.birthday, age:secInsured.age})
    }
  }

  getCoveragePointToInsuredIndex(coverage) {
    for (let i = 0; i < this.state.plan.insureds.length; i++) {
      if (coverage.insuredIds && this.state.plan.insureds[i].id == coverage.insuredIds[0]) {
        return i
      }
    }
    return 0
  }

  chargePeriodFilter (chargePeriod, coverage) {
    // filter by limits minAge and maxAge
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
        ? this.state.plan.insureds[1].age
        : this.state.plan.insureds[insuredIndex].age
    let gender = coverage.limits.pointToPH
      ? this.state.plan.proposer.gender
      : coverage.limits.pointToSecInsured
        ? this.state.plan.insureds[1].gender
        : this.state.plan.insureds[insuredIndex].gender
    return (
      (typeof chargePeriod.minAge !== 'number' || chargePeriod.minAge <= age) &&
      (typeof chargePeriod.maxAge !== 'number' || chargePeriod.maxAge >= age) &&
      (!chargePeriod.gender ||
        chargePeriod.gender === 'N' ||
        chargePeriod.gender === gender)
    )
  }

  chargePeriodFilterByMainCoverage (chargePeriod, coverage) {
    if (chargePeriod.periodType === 2 && chargePeriod.periodValue === 1) {
      return true // one year don't applly this rule
    }
    let mainCoverage = this.state.plan.mainCoverages[0]
    let mainChargePeriod = mainCoverage.chargePeriod
    let isPackageProduct = coverage.limits.isPackageProduct
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let coverageChargeYear = 0
    if (chargePeriod.periodType === 2) {
      coverageChargeYear = chargePeriod.periodValue
    } else if (chargePeriod.periodType === 3) {
      let age = coverage.limits.pointToPH
        ? this.state.plan.proposer.age
        : coverage.limits.pointToSecInsured
          ? this.state.plan.insureds[1].age
          : this.state.plan.insureds[insuredIndex].age
      coverageChargeYear = chargePeriod.periodValue - age
    }
    let mainChargeYear = 0
    if (mainChargePeriod.periodType === 2) {
      mainChargeYear = mainChargePeriod.periodValue
    } else if (mainChargePeriod.periodType === 3) {
      let age = coverage.limits.pointToSecInsured? this.state.plan.insureds[0].age : this.state.plan.insureds[insuredIndex].age
      mainChargeYear = mainChargePeriod.periodValue - age
    }
    if (
      isPackageProduct &&
      this.existingSamePeriod(mainChargePeriod, coverage.limits.chargePeriod)
    ) {
      return coverageChargeYear == mainChargeYear
    } else {
      // special case that AVRIST's product allow rider higher than main
      if (['AVRIST'].includes(this.state.plan.salesCompanyCode)) {
        return true;
      }
      return coverageChargeYear <= mainChargeYear
    }
  }

  coveragePeriodFilter (coveragePeriod, coverage) {
    // filter by inner chargePeriod limit then filter by sub inner chargePeriodFilter by age
    for (let chargePeriodLimit of coveragePeriod.chargePeriod) {
      if (
        chargePeriodLimit.periodType === coverage.chargePeriod.periodType &&
        chargePeriodLimit.periodValue === coverage.chargePeriod.periodValue &&
        this.chargePeriodFilter(chargePeriodLimit, coverage)
      ) {
        return true
      }
    }
    return false
  }

  coveragePeriodFilterByMainCoverage (coveragePeriod, coverage) {
    if (['9', '10'].includes(""+coverage.unitFlag) && coverage.limits.coveragePeriod.length <= 1) {
      // rider has only one choice
      return true
    }
    let mainCoverage = this.state.plan.mainCoverages[0]
    let mainCoveragePerioid = mainCoverage.coveragePeriod
    let isPackageProduct = coverage.limits.isPackageProduct
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let coverageCoverageYear = 999
    if (coveragePeriod.periodType === 2) {
      coverageCoverageYear = coveragePeriod.periodValue
    } else if (coveragePeriod.periodType === 3) {
      let age = coverage.limits.pointToPH
        ? this.state.plan.proposer.age
        : coverage.limits.pointToSecInsured
          ? this.state.plan.insureds[1].age
          : this.state.plan.insureds[insuredIndex].age
      coverageCoverageYear = coveragePeriod.periodValue - age
    }
    let mainCoverageYear = 999
    if (mainCoveragePerioid.periodType === 2) {
      mainCoverageYear = mainCoveragePerioid.periodValue
    } else if (mainCoveragePerioid.periodType === 3) {
      let age = coverage.limits.pointToSecInsured? this.state.plan.insureds[0].age : this.state.plan.insureds[insuredIndex].age
      mainCoverageYear = mainCoveragePerioid.periodValue - age
    }
    if (
      isPackageProduct &&
      this.existingSamePeriod(
        mainCoveragePerioid,
        coverage.limits.coveragePeriod
      )
    ) {
      return coverageCoverageYear == mainCoverageYear
    } else {
      return coverageCoverageYear <= mainCoverageYear
    }
  }

  existingSamePeriod (mainPerioid, perioidLimit) {
    for (let period of perioidLimit) {
      if (
        mainPerioid.periodType === period.periodType &&
        mainPerioid.periodValue === period.periodValue
      ) {
        return true
      }
    }
    return false
  }

  payPeriodFilter (payPeriod, coverage) {
    // filter by inner coveragePeriod limit then filter by sub inner coveragePeriodFilter and by sub sub...
    for (let coveragePeriodLimit of payPeriod.coveragePeriod) {
      if (
        coveragePeriodLimit.periodType === coverage.coveragePeriod.periodType &&
        coveragePeriodLimit.periodValue ===
          coverage.coveragePeriod.periodValue &&
        this.coveragePeriodFilter(coveragePeriodLimit, coverage)
      ) {
        return true
      }
    }
    return false
  }

  payPeriodFilterByMainCoverage (payPeriod, coverage) {
    let mainCoverage = this.state.plan.mainCoverages[0]
    if (!mainCoverage.isAnnuityProduct) {
      return true
    }
    let mainPayPeriod = mainCoverage.payPeriod
    let isPackageProduct = coverage.limits.isPackageProduct
    if (
      isPackageProduct &&
      this.existingSamePeriod(
        mainPayPeriod,
        coverage.limits.payPeriod
      )
    ) {
      return payPeriod.periodType === mainPayPeriod.periodType && payPeriod.periodValue === mainPayPeriod.periodValue
    } else if (!isPackageProduct) {
      return true
    } else {
      return false
    }
  }

  endPeriodFilter (endPeriod, coverage) {
    // filter by inner payPeriod then filter by sub inner coveragePeriod limit then filter by sub inner coveragePeriodFilter and by sub sub...
    for (let payPeriodLimit of endPeriod.payPeriod) {
      if (
        payPeriodLimit.periodType === coverage.payPeriod.periodType &&
        payPeriodLimit.periodValue ===
        coverage.payPeriod.periodValue &&
        this.payPeriodFilter(payPeriodLimit, coverage)
      ) {
        return true
      }
    }
    return false
  }

  payEnsureFilter(payEnsure, coverage) {
    // filter by inner payPeriod then filter by sub inner coveragePeriod limit then filter by sub inner coveragePeriodFilter and by sub sub...
    for (let payPeriodLimit of payEnsure.payPeriod) {
      if (
        payPeriodLimit.periodType === coverage.payPeriod.periodType &&
        payPeriodLimit.periodValue ===
        coverage.payPeriod.periodValue &&
        this.payPeriodFilter(payPeriodLimit, coverage)
      ) {
        return true
      }
    }
    return false
  }

  periodSortDescComparator (a, b) {
    if (a.periodType > b.periodType) {
      return -1
    }
    if (a.periodType < b.periodType) {
      return 1
    }
    if (a.periodValue > b.periodValue) {
      return -1
    }
    if (a.periodValue < b.periodValue) {
      return 1
    }
    return 0
  }

  periodSortAscComparator (a, b) {
    if (a.periodType < b.periodType) {
      return -1
    }
    if (a.periodType > b.periodType) {
      return 1
    }
    if (a.periodValue < b.periodValue) {
      return -1
    }
    if (a.periodValue > b.periodValue) {
      return 1
    }
    return 0
  }

  getMinPremium (coverage, resetValuesBetweenMinMax) {
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
        ? this.state.plan.insureds[1].age
        : this.state.plan.insureds[insuredIndex].age
    let chargePeriod = coverage.chargePeriod
    let mainCoverage = this.state.plan.mainCoverages[0]
    let chargeType = mainCoverage.paymentFreq
    if (chargePeriod.periodType == 1 || mainCoverage.chargePeriod.periodType == 1) { // single premium
      chargeType = 5
    }
    for (let premLimit of coverage.limits.prem) {
      if (
        (!premLimit.chargePeriod ||
        (chargePeriod.periodType === premLimit.chargePeriod && chargePeriod.periodValue === premLimit.chargeYear)) &&
        premLimit.minAge <= age &&
        premLimit.maxAge >= age &&
        // (!premLimit.chargeType || premLimit.chargeType == "0" || chargeType == premLimit.chargeType)
        (!premLimit.chargeType || premLimit.chargeType == "0" || "1" === premLimit.chargeType)
      ) {
        let minValue = premLimit.minInitialPrem < coverage.limits.incrementIndex? coverage.limits.incrementIndex : premLimit.minInitialPrem
        if (
          resetValuesBetweenMinMax &&
          ['0', '7', '10'].includes(""+coverage.unitFlag) &&
          coverage.premium < minValue
        ) {
          // reset min premium value of coverage
          coverage.premium = minValue
          console.log('reset min premium', minValue)
          this.forceUpdate()
        }
        return premLimit.minInitialPrem
      }
    }
    return 0
  }

  getMaxPremium (coverage, resetValuesBetweenMinMax) {
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
        ? this.state.plan.insureds[1].age
        : this.state.plan.insureds[insuredIndex].age
    let chargePeriod = coverage.chargePeriod
    let mainCoverage = this.state.plan.mainCoverages[0]
    let chargeType = mainCoverage.paymentFreq
    if (chargePeriod.periodType == 1 || mainCoverage.chargePeriod.periodType == 1) { // single premium
      chargeType = 5
    }
    for (let premLimit of coverage.limits.prem) {
      if (
        (!premLimit.chargePeriod ||
        (chargePeriod.periodType === premLimit.chargePeriod && chargePeriod.periodValue === premLimit.chargeYear)) &&
        premLimit.minAge <= age &&
        premLimit.maxAge >= age &&
        // (!premLimit.chargeType || premLimit.chargeType == "0" || chargeType == premLimit.chargeType)
      (!premLimit.chargeType || premLimit.chargeType == "0" || "1" === premLimit.chargeType)
      ) {
        if (
          resetValuesBetweenMinMax &&
          ['0', '7', '10'].includes(""+coverage.unitFlag) &&
          coverage.premium > premLimit.maxInitialPrem
        ) {
          // reset max premium value of coverage
          coverage.premium = premLimit.maxInitialPrem
          console.log('reset max premium', premLimit.maxInitialPrem)
          this.forceUpdate()
        }
        return premLimit.maxInitialPrem
      }
    }
    return MAX_AMOUNT
  }

  getMinSaOrUnitByAge (coverage, resetValuesBetweenMinMax) {
    let minValueSelf = this.gtMinSaOrUnitOfSelf(coverage, resetValuesBetweenMinMax)
    let minValueRelation = this.getMinSaOrUnitOfRelation(coverage, resetValuesBetweenMinMax)
    let minSpecialValue = this.getMinSaSpecial(coverage, resetValuesBetweenMinMax)
    let minVale = minValueSelf
    minVale = minVale > minValueRelation ? minVale : minValueRelation
    minVale = minVale > minSpecialValue ? minVale : minSpecialValue
    return minVale
  }
  
  getMinSaSpecial(coverage, resetValuesBetweenMinMax) {
    if (['AVRAIPRNLG', 'AIAIFELRPX'].includes(coverage.productCode)) {
      let premium = this.state.plan.mainCoverages[0].premium
      let minValue = parseFloat((premium * 5).toFixed(2))
      if (resetValuesBetweenMinMax && coverage.sa < minValue) {
        coverage.sa = minValue
        console.log('reset min sa', minValue)
        this.forceUpdate()
      }
      return minValue
    }
    return 0
  }

  gtMinSaOrUnitOfSelf(coverage, resetValuesBetweenMinMax) {
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
      ? this.state.plan.insureds[1].age
      : this.state.plan.insureds[insuredIndex].age
    let jobClass = coverage.limits.pointToPH
      ? this.state.plan.proposer.jobCateId
      : coverage.limits.pointToSecInsured
      ? this.state.plan.insureds[1].jobCateId
      : this.state.plan.insureds[insuredIndex].jobCateId
    for (let amountLimit of coverage.limits.amount) {
      let jobClassMatch = true
      if (coverage.limits.jobIndi && amountLimit.jobClass && amountLimit.jobClass != jobClass) {
        jobClassMatch = false
      }
      if (amountLimit.minAge <= age && amountLimit.maxAge >= age && jobClassMatch) {
        let minValue = amountLimit.minAmount < coverage.limits.incrementIndex? coverage.limits.incrementIndex : amountLimit.minAmount
        if (
          resetValuesBetweenMinMax &&
          ['0', '6'].includes(""+coverage.unitFlag) &&
          !coverage.limits.isWaiver &&
          coverage.sa < minValue
        ) {
          // reset min sa value of coverage
          coverage.sa = minValue
          console.log('reset min sa', minValue)
          this.forceUpdate()
        } else if (
          resetValuesBetweenMinMax &&
          ['1', '3'].includes(""+coverage.unitFlag) &&
          coverage.unit < amountLimit.minAmount
        ) {
          // reset min unit value of coverage
          let minValue = amountLimit.minAmount < coverage.limits.incrementIndex? coverage.limits.incrementIndex : amountLimit.minAmount
          coverage.unit = minValue
          console.log('reset min unit', minValue)
          this.forceUpdate()
        }
        return amountLimit.minAmount
      }
    }
    return 0
  }

  getMinSaOrUnitOfRelation(coverage, resetValuesBetweenMinMax) {
    if (!coverage.limits.targetAthRateList || coverage.limits.targetAthRateList.length === 0) {
      return 0
    }
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
      ? this.state.plan.insureds[1].age
      : this.state.plan.insureds[insuredIndex].age
    let parentCoverageMap = {}
    let minValue = 0
    for (let targetAthRate of coverage.limits.targetAthRateList) {
      if (targetAthRate.mastLimitUnit !== "1") {
        continue // not for sa
      }
      if (typeof targetAthRate.minAthAge==="number" && typeof targetAthRate.maxAthAge==="number"
        && !(age >= targetAthRate.minAthAge && age <= targetAthRate.maxAthAge)) {
        continue // not in age range
      }
      let parentCoverage = parentCoverageMap[targetAthRate.targetAttachedId]
      if (!parentCoverage) {
        for (let coverage of this.state.plan.mainCoverages) {
          if (coverage.productId === targetAthRate.targetAttachedId) {
            parentCoverageMap[targetAthRate.targetAttachedId] = coverage
            parentCoverage = coverage
            break
          }
        }
        for (let coverage of this.state.plan.riderCoverages) {
          if (coverage.productId === targetAthRate.targetAttachedId) {
            parentCoverageMap[coverage.productId] = coverage
            parentCoverage = coverage
            break
          }
        }
      }
      if (!parentCoverage) {
        continue
      }
      let minSa = targetAthRate.minAthAmt
      let minSaOfMasterRate = parseFloat((parentCoverage.sa * targetAthRate.minAthRate).toFixed(2))
      minSa = minSa > minSaOfMasterRate? minSa : minSaOfMasterRate
      minValue = minValue > minSa? minValue : minSa
    }
    if (
      resetValuesBetweenMinMax &&
      ['0', '6'].includes(""+coverage.unitFlag) &&
      !coverage.limits.isWaiver &&
      coverage.sa < minValue
    ) {
      // reset min sa value of coverage
      coverage.sa = minValue
      console.log('reset min sa', minValue)
      this.forceUpdate()
    }
    return minValue
  }

  getMaxSaOrUnitByAge (coverage, resetValuesBetweenMinMax) {
    let maxValueSelf = this.getMaxSaOrUnitOfSelf(coverage, resetValuesBetweenMinMax)
    let maxValueRelation = this.getMaxSaOrUnitOfRelation(coverage, resetValuesBetweenMinMax)
    return maxValueSelf < maxValueRelation? maxValueSelf : maxValueRelation
  }

  getMaxSaOrUnitOfSelf(coverage, resetValuesBetweenMinMax) {
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
      ? this.state.plan.insureds[1].age
      : this.state.plan.insureds[insuredIndex].age
    for (let amountLimit of coverage.limits.amount) {
      if (amountLimit.minAge <= age && amountLimit.maxAge >= age) {
        if (
          resetValuesBetweenMinMax &&
          ['0', '6'].includes(""+coverage.unitFlag) &&
          !coverage.limits.isWaiver &&
          coverage.sa > amountLimit.maxAmount
        ) {
          // reset max sa value of coverage
          coverage.sa = amountLimit.maxAmount
          console.log('reset max sa', amountLimit.maxAmount)
          this.forceUpdate()
        } else if (
          resetValuesBetweenMinMax &&
          ['1', '3'].includes(""+coverage.unitFlag) &&
          coverage.unit > amountLimit.maxAmount
        ) {
          // reset max unit value of coverage
          coverage.unit = amountLimit.maxAmount
          console.log('reset max unit', amountLimit.maxAmount)
          this.forceUpdate()
        }
        return amountLimit.maxAmount
      }
    }
    return MAX_AMOUNT
  }

  getMaxSaOrUnitOfRelation(coverage, resetValuesBetweenMinMax) {
    if (!coverage.limits.targetAthRateList || coverage.limits.targetAthRateList.length === 0) {
      return MAX_AMOUNT
    }
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
      ? this.state.plan.insureds[1].age
      : this.state.plan.insureds[insuredIndex].age
    let parentCoverageMap = {}
    let maxValue = MAX_AMOUNT
    for (let targetAthRate of coverage.limits.targetAthRateList) {
      if (targetAthRate.mastLimitUnit !== "1") {
        continue // not for sa
      }
      if (typeof targetAthRate.minAthAge==="number" && typeof targetAthRate.maxAthAge==="number"
        && !(age >= targetAthRate.minAthAge && age <= targetAthRate.maxAthAge)) {
        continue // not in age range
      }
      let parentCoverage = parentCoverageMap[targetAthRate.targetAttachedId]
      if (!parentCoverage) {
        for (let coverage of this.state.plan.mainCoverages) {
          if (coverage.productId === targetAthRate.targetAttachedId) {
            parentCoverageMap[targetAthRate.targetAttachedId] = coverage
            parentCoverage = coverage
            break
          }
        }
        for (let coverage of this.state.plan.riderCoverages) {
          if (coverage.productId === targetAthRate.targetAttachedId) {
            parentCoverageMap[coverage.productId] = coverage
            parentCoverage = coverage
            break
          }
        }
      }
      if (!parentCoverage) {
        continue
      }
      let maxSa = targetAthRate.maxAthAmt
      let maxSaOfMasterRate = parseFloat((parentCoverage.sa * targetAthRate.maxAthRate).toFixed(2))
      maxSa = maxSa < maxSaOfMasterRate? maxSa : maxSaOfMasterRate
      maxValue = maxValue < maxSa? maxValue : maxSa
    }
    if (
      resetValuesBetweenMinMax &&
      ['0', '6'].includes(""+coverage.unitFlag) &&
      !coverage.limits.isWaiver &&
      coverage.sa > maxValue
    ) {
      // reset min sa value of coverage
      coverage.sa = maxValue
      console.log('reset max sa', maxValue)
      this.forceUpdate()
    }
    return maxValue
  }

  onInsuredPropertyChange (insuredIndex, property, value, type) {
    let plan = this.state.plan
    if (type === 'int') {
      value = parseInt(value) || 0
    } else if (type === 'float') {
      value = parseFloat(value) || 0
    }
    plan.insureds[insuredIndex][property] = value
    this.setState({ plan })
  }

  onInsuredAgeChange(insuredIndex, value) {
    let plan = this.state.plan
    plan.insureds[insuredIndex].birthday = value.birthday
    plan.insureds[insuredIndex].age = value.age
    this.setState({ plan })
  }

  onInsuredJobChange (index, value) {
    let plan = this.state.plan
    plan.insureds[index].jobCateId = value.jobCateId
    plan.insureds[index].jobCateCode = value.jobCateCode
    this.setState({ plan })
  }

  onMainInsuredRelationChange (value) {
    let plan = this.state.plan
    let quotationCode = this.props.params.quotationCode
    let isFromSavedQuotation = quotationCode && quotationCode !== '0'
    if (isFromSavedQuotation && value == 1) {
      if (plan.proposer.birthday !== plan.insureds[0].birthday || plan.proposer.gender !==  plan.insureds[0].gender) {
        this.showDialog(t("The insured and policyholder are not same person!"))
        return
      }
    }
    if (value == 1) {
      // validate ph age if is self
      let birthday = plan.proposer.birthday
      let age = plan.proposer.age
      if (!plan.insureds[0].limits.age.includes(age)) {
        this.showDialog(t("The age of selected customer doesn't meet current insurance conditions, please adjust inputs or pick another one."))
        return
      }
      plan.insureds[0].laPhRela = value
      this.onMainInsuredAgeChange({birthday, age})
    } else {
      plan.insureds[0].laPhRela = value
      this.setState({ plan })
    }
  }

  onMainInsuredAgeChange (value) {
    let plan = this.state.plan
    let birthday = value.birthday
    let age = value.age
    plan.insureds[0].birthday = birthday
    plan.insureds[0].age = age
    let genderOptions = this.getInsuredGenderOptions(0, age)
    if (genderOptions.length === 1) {
      plan.insureds[0].gender = genderOptions[0].value
    }
    this.setState({ plan }, () => {
      this.resetValuesBetweenMinMax(this.state.plan)
      fireOnChange(document.getElementById('mainChargePeriod'))
    })
  }

  onMainInsuredBirthdayChange (value) {
    let plan = this.state.plan
    plan.insureds[0].birthday = value
    let age = getAgeByBirthday(value)
    this.onMainInsuredAgeChange({birthday: value, age})
  }

  onMainInsuredGenderChange (value) {
    let plan = this.state.plan
    plan.insureds[0].gender = value
    this.setState({ plan }, () => {
      fireOnChange(document.getElementById('mainChargePeriod'))
    })
  }

  onMainInsuredJobChange (value) {
    let plan = this.state.plan
    plan.insureds[0].jobCateId = value.jobCateId
    plan.insureds[0].jobCateCode = value.jobCateCode
    this.setState({ plan })
  }

  resetValuesBetweenMinMax (plan) {
    for (let mainCoverage of plan.mainCoverages) {
      if (['1', '3', '0', '6'].includes(""+mainCoverage.unitFlag)) {
        this.getMinSaOrUnitByAge(mainCoverage, true)
        this.getMaxSaOrUnitByAge(mainCoverage, true)
      }
      if (['0', '7', '10'].includes(""+mainCoverage.unitFlag)) {
        this.getMinPremium(mainCoverage, true)
        this.getMaxPremium(mainCoverage, true)
      }
    }
    for (let riderCoverage of plan.riderCoverages) {
      if (
        ['0', '6'].includes(""+riderCoverage.unitFlag) &&
        !riderCoverage.limits.isWaiver
      ) {
        let amountEqaulMast = false
        for (let targetAthRate of riderCoverage.limits.targetAthRateList) {
          if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
            && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '1') {
            amountEqaulMast = true
            riderCoverage.sa = plan.mainCoverages[0].sa
            this.forceUpdate()
            break
          }
          if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
            && typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
            amountEqaulMast = true
            let sa = parseFloat((plan.mainCoverages[0].sa * targetAthRate.minAthRate).toFixed(0))
            if (typeof targetAthRate.minAthAmt === 'number' && sa < targetAthRate.minAthAmt) {
              sa = targetAthRate.minAthAmt
            } else if (typeof targetAthRate.maxAthAmt === 'number' && sa > targetAthRate.maxAthAmt) {
              sa = targetAthRate.maxAthAmt
            }
            riderCoverage.sa = sa
            this.forceUpdate()
            break
          }
        }
        if (!amountEqaulMast) {
          this.getMinSaOrUnitByAge(riderCoverage, true)
          this.getMaxSaOrUnitByAge(riderCoverage, true)
        }
      }
      if (['0', '7', '10'].includes(""+riderCoverage.unitFlag)) {
        let amountEqaulMast = false
        for (let targetAthRate of riderCoverage.limits.targetAthRateList) {
          if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
            && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '3') {
            amountEqaulMast = true
            riderCoverage.premium = plan.mainCoverages[0].premium
            this.forceUpdate()
            break
          }
          if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
            && typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
            amountEqaulMast = true
            let premium = parseFloat((plan.mainCoverages[0].premium * targetAthRate.minAthRate).toFixed(0))
            if (typeof targetAthRate.minAthAmt === 'number' && sa < targetAthRate.minAthAmt) {
              premium = targetAthRate.minAthAmt
            } else if (typeof targetAthRate.maxAthAmt === 'number' && sa > targetAthRate.maxAthAmt) {
              premium = targetAthRate.maxAthAmt
            }
            riderCoverage.premium = premium
            this.forceUpdate()
            break
          }
        }
        if (!amountEqaulMast) {
          this.getMinPremium(riderCoverage, true)
          this.getMaxPremium(riderCoverage, true)
        }
      }
      if (['1', '3'].includes(""+riderCoverage.unitFlag)) {
        let amountEqaulMast = false
        for (let targetAthRate of riderCoverage.limits.targetAthRateList) {
          if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
            && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '2') {
            amountEqaulMast = true
            riderCoverage.unit = plan.mainCoverages[0].unit
            this.forceUpdate()
            break
          }
          if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
            && typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
            amountEqaulMast = true
            let unit = parseInt((plan.mainCoverages[0].unit * targetAthRate.minAthRate).toFixed(0))
            if (typeof targetAthRate.minAthAmt === 'number' && sa < targetAthRate.minAthAmt) {
              unit = targetAthRate.minAthAmt
            } else if (typeof targetAthRate.maxAthAmt === 'number' && sa > targetAthRate.maxAthAmt) {
              unit = targetAthRate.maxAthAmt
            }
            riderCoverage.unit = unit
            this.forceUpdate()
            break
          }
        }
        if (!amountEqaulMast) {
          this.getMinSaOrUnitByAge(riderCoverage, true)
          this.getMaxSaOrUnitByAge(riderCoverage, true)
        }
      }
      if (riderCoverage.benefitlevel) {
        for (let targetAthRate of riderCoverage.limits.targetAthRateList) {
          if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
            && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '4') {
            riderCoverage.benefitlevel = plan.mainCoverages[0].benefitlevel
            this.forceUpdate()
            break
          }
        }
      }
    }
  }

  onSecInsuredRelationChange (value) {
    let plan = this.state.plan
    let quotationCode = this.props.params.quotationCode
    let isFromSavedQuotation = quotationCode && quotationCode !== '0'
    if (isFromSavedQuotation && value == 1) {
      if (plan.proposer.birthday !== plan.insureds[1].birthday || plan.proposer.gender !==  plan.insureds[1].gender) {
        this.showDialog(t("The insured and policyholder are not same person!"))
        return
      }
    } else if (value == 1) {
      // validate ph age if is self
      let birthday = plan.proposer.birthday
      let age = plan.proposer.age
      if (!plan.insureds[1].limits.age.includes(age)) {
        this.showDialog(t("The age of selected customer doesn't meet current insurance conditions, please adjust inputs or pick another one."))
        return
      }
      plan.insureds[1].laPhRela = value
      this.onSecInsuredAgeChange({birthday, age})
    } else {
      plan.insureds[1].laPhRela = value
      this.setState({ plan })
    }
  }

  onSecInsuredAgeChange (value) {
    let plan = this.state.plan
    let birthday = value.birthday
    let age = value.age
    plan.insureds[1].birthday = birthday
    plan.insureds[1].age = age
    let genderOptions = this.getInsuredGenderOptions(1, age)
    if (genderOptions.length === 1) {
      plan.insureds[1].gender = genderOptions[1].value
    }
    this.setState({ plan }, () => {
      this.resetValuesBetweenMinMax(this.state.plan)
      // fire rider's chargePeriod change;
      for (let i = 0; i < plan.riderCoverages.length; i++) {
        if (plan.riderCoverages[i].limits.pointToSecInsured) {
          fireOnChange(document.getElementById('riderChargePeriod' + i))
        }
      }
    })
  }

  onSecInsuredBirthdayChange (value) {
    let plan = this.state.plan
    plan.insureds[1].birthday = value
    let age = getAgeByBirthday(value)
    this.onSecInsuredAgeChange({birthday: value, age})
  }

  onSecInsuredGenderChange (value) {
    let plan = this.state.plan
    plan.insureds[1].gender = value
    this.setState({ plan }, () => {
      // fire rider's chargePeriod change;
      for (let i = 0; i < plan.riderCoverages.length; i++) {
        if (plan.riderCoverages[i].limits.pointToSecInsured) {
          fireOnChange(document.getElementById('riderChargePeriod' + i))
        }
      }
    })
  }

  onSecInsuredJobChange (value) {
    let plan = this.state.plan
    plan.insureds[1].jobCateId = value.jobCateId
    plan.insureds[1].jobCateCode = value.jobCateCode
    this.setState({ plan })
  }

  onPhPropertyChange (property, value, type) {
    let plan = this.state.plan
    if (type === 'int') {
      value = parseInt(value) || 0
    } else if (type === 'float') {
      value = parseFloat(value) || 0
    }
    plan.proposer[property] = value
    this.setState({ plan })
  }

  onPhAgeChange (value) {
    let plan = this.state.plan
    plan.proposer.birthday = value.birthday
    plan.proposer.age = value.age
    this.setState({ plan }, () => {
      this.resetValuesBetweenMinMax(this.state.plan)
      // fire rider's chargePeriod change;
      for (let i = 0; i < plan.riderCoverages.length; i++) {
        if (plan.riderCoverages[i].limits.pointToPH) {
          fireOnChange(document.getElementById('riderChargePeriod' + i))
        }
      }
    })
  }

  onPhBirthdayChange (value) {
    let plan = this.state.plan
    plan.proposer.birthday = value
    let age = getAgeByBirthday(value)
    if (plan.insureds[0].laPhRela == 1) {
      this.onMainInsuredAgeChange({birthday: value, age})
    }
    if (plan.insureds.length > 1 && plan.insureds[1].laPhRela == 1) {
      this.onSecInsuredAgeChange({birthday: value, age})
    }
    this.onPhAgeChange({birthday: value, age})
  }

  onPhJobChange (value) {
    let plan = this.state.plan
    plan.proposer.jobCateId = value.jobCateId
    plan.proposer.jobCateCode = value.jobCateCode
    if (plan.insureds[0].laPhRela == 1) {
      plan.insureds[0].jobCateId = value.jobCateId
      plan.insureds[0].jobCateId = value.jobCateCode
    } else {
      if (plan.insureds.length > 1 && plan.insureds[1].laPhRela == 1) {
        plan.insureds[1].jobCateId = value.jobCateId
        plan.insureds[1].jobCateId = value.jobCateCode
      }
    }
    this.setState({ plan })
  }

  onMainCoverageChargePeriodChange (value) {
    let plan = this.state.plan
    plan.mainCoverages[0].chargePeriod = this.generatePeriod(value)
    console.log('mainChargePeriod', plan.mainCoverages[0].chargePeriod)
    this.setState({ plan: plan }, () => {
      fireOnChange(document.getElementById('phAge'))
      // fire main's coveragePeriod change and rider's chargePeriod change;
      fireOnChange(document.getElementById('mainCoveragePeriod'))
      fireOnChange(document.getElementById('regularTopup'))
      for (let i = 0; i < plan.riderCoverages.length; i++) {
        fireOnChange(document.getElementById('riderChargePeriod' + i))
      }
      // wait for all above changes completed
      if (plan.mainCoverages[0].chargePeriod.periodType === 1) {
        setTimeout(() => {
          // remove all waivers when chargeType = 1;
          for (let i = 0; i < plan.riderCoverages.length; i++) {
            if (plan.riderCoverages[i].limits.isWaiver) {
              this.removeRider(i)
            }
          }
        }, 50)
      } else if (!["AVRIST"].includes(plan.salesCompanyCode)) {
        // remove rider case
        let mainChargeYear = plan.mainCoverages[0].chargePeriod.periodValue
        for (let i = 0; i < plan.riderCoverages.length; i++) {
          if (plan.riderCoverages[i].limits.isWaiver && plan.riderCoverages[i].limits.chargePeriod) {
            let existLessChargeYear = false
            for (let chargePeriod of plan.riderCoverages[i].limits.chargePeriod) {
              if (chargePeriod.periodValue < mainChargeYear) {
                existLessChargeYear = true
                break
              }
            }
            if (!existLessChargeYear) {
              setTimeout(() => {
                this.removeRider(i)
              }, 50)
            }
          }
        }
      }
    })
  }

  generatePeriod (value) {
    let tokenizer = value.split('-')
    let period = {
      periodType: parseInt(tokenizer[0]),
      periodValue: parseInt(tokenizer[1]),
    }
    return period
  }

  removeRider (index) {
    let plan = this.state.plan
    let rider = plan.riderCoverages[index]
    // prevent remove because of depended by other
    for (let product of this.props.planList) {
      if (product.dependPrdtList) {
        for (let prodRelation of product.dependPrdtList) {
          if (prodRelation.productBId == rider.productId) {
            this.showDialog(product.salesProductName + t(' depends on this rider, please remove it first'))
            return
          }
        }
      }
    }
    // get coexist riders
    let coexistRiderIds = []
    for (let product of this.props.planList) {
      if (product.coexistPrdtList) {
        for (let prodRelation of product.coexistPrdtList) {
          if (prodRelation.productAId == rider.productId) {
            if (!coexistRiderIds.includes(prodRelation.productBId)) {
              coexistRiderIds.push(prodRelation.productBId)
            }
          }
        }
      }
    }
    // remove rider and set new data to store
    let planInitialData = Object.assign({}, this.props.planInitialData)
    planInitialData.planList = planInitialData.planList.filter(product => {
      for (let riderId of [rider.productId, ...coexistRiderIds]) {
        if (product.salesProductId == riderId) {
          return false
        }
      }
      return true
    })
    console.log(planInitialData.planList)
    this.props.actions.setPlanInitialData(planInitialData)
    plan.riderCoverages = plan.riderCoverages.filter(riderCoverage => {
      for (let riderId of [rider.productId, ...coexistRiderIds]) {
        if (riderCoverage.productId == riderId) {
          return false
        }
      }
      return true
    })
    plan = this.getPlanAfterRiderCoveragesChange(plan, planInitialData)
    // console.log(plan)
    this.setState({ plan })
  }

  onMainCoverageCoveragePeriodChange (value) {
    let plan = this.state.plan
    plan.mainCoverages[0].coveragePeriod = this.generatePeriod(value)
    console.log('mainCoveragePeriod', plan.mainCoverages[0].coveragePeriod)
    this.setState({ plan }, () => {
      // fire main's payPeriod change and rider's chargePeriod change;
      fireOnChange(document.getElementById('mainPayPeriod'))
      for (let i = 0; i < plan.riderCoverages.length; i++) {
        fireOnChange(document.getElementById('riderCoveragePeriod' + i))
      }
    })
  }

  onMainCoveragePayPeriodChange (value) {
    let plan = this.state.plan
    plan.mainCoverages[0].payPeriod = this.generatePeriod(value)
    console.log('mainPayPeriod', plan.mainCoverages[0].payPeriod)
    this.setState({ plan }, () => {
      fireOnChange(document.getElementById('mainEndPeriod'))
      fireOnChange(document.getElementById('mainPayEnsure'))
    })
  }

  onMainCoverageEndPeriodChange (value) {
    let plan = this.state.plan
    plan.mainCoverages[0].endPeriod = this.generatePeriod(value)
    console.log('endPayPeriod', plan.mainCoverages[0].endPeriod)
    this.setState({ plan })
  }

  onMainCoveragePayEnsureChange (value) {
    let plan = this.state.plan
    plan.mainCoverages[0].extraProperties = plan.mainCoverages[0].extraProperties? plan.mainCoverages[0].extraProperties : {}
    plan.mainCoverages[0].extraProperties['pay_ensure'] = parseInt(value) || 0
    console.log('payEnsure', plan.mainCoverages[0].extraProperties['pay_ensure'])
    this.setState({ plan })
  }

  onMainCoveragePropertyChange (property, value, type) {
    let plan = this.state.plan
    if (type === 'int') {
      value = parseInt(value) || 0
    } else if (type === 'float') {
      value = parseFloat(value) || 0
    }
    plan.mainCoverages[0][property] = value
    if (property === 'sa') {
      // rider sa equal or fixed rate of master
      for (let rider of plan.riderCoverages) {
        if (['0', '6'].includes(""+rider.unitFlag) &&
          !rider.limits.isWaiver) {
          for (let targetAthRate of rider.limits.targetAthRateList) {
            if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
              && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '1') {
              rider.sa = value
              break
            }
            if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId &&
              typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
              let sa = parseFloat((value * targetAthRate.minAthRate).toFixed(0))
              if (typeof targetAthRate.minAthAmt === 'number' && sa < targetAthRate.minAthAmt) {
                sa = targetAthRate.minAthAmt
              } else if (typeof targetAthRate.maxAthAmt === 'number' && sa > targetAthRate.maxAthAmt) {
                sa = targetAthRate.maxAthAmt
              }
              rider.sa = sa
              break
            }
          }
        }
      }
    } else if (property === 'premium') {
      // rider premium equal or fixed rate of master
      for (let rider of plan.riderCoverages) {
        if (['0', '7', '10'].includes(""+rider.unitFlag)) {
          for (let targetAthRate of rider.limits.targetAthRateList) {
            if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
              && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '3') {
              rider.premium = value
              break
            }
            if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId &&
              typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
              let premium = parseFloat((value * targetAthRate.minAthRate).toFixed(0))
              if (typeof targetAthRate.minAthAmt === 'number' && premium < targetAthRate.minAthAmt) {
                premium = targetAthRate.minAthAmt
              } else if (typeof targetAthRate.maxAthAmt === 'number' && premium > targetAthRate.maxAthAmt) {
                premium = targetAthRate.maxAthAmt
              }
              rider.premium = premium
              break
            }
          }
        }
      }
    } else if (property === 'unit') {
      // rider unit equal or fixed rate of master
      for (let rider of plan.riderCoverages) {
        if (['1', '3'].includes(""+rider.unitFlag)) {
          for (let targetAthRate of rider.limits.targetAthRateList) {
            if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
              && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '2') {
              rider.unit = value
              break
            }
            if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId &&
              typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
              let unit = parseInt((value * targetAthRate.minAthRate).toFixed(0))
              if (typeof targetAthRate.minAthAmt === 'number' && unit < targetAthRate.minAthAmt) {
                unit = targetAthRate.minAthAmt
              } else if (typeof targetAthRate.maxAthAmt === 'number' && unit > targetAthRate.maxAthAmt) {
                unit = targetAthRate.maxAthAmt
              }
              rider.unit = unit
              break
            }
          }
        }
      }
    } else if (property === 'benefitlevel') {
      // rider benefitlevel equal
      for (let rider of plan.riderCoverages) {
        if (rider.benefitlevel) {
          for (let targetAthRate of rider.limits.targetAthRateList) {
            if (targetAthRate.targetAttachedId === plan.mainCoverages[0].productId
              && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '4') {
              rider.benefitlevel = value
              break
            }
          }
        }
      }
    }
    this.setState({ plan })
  }

  onRiderCoverageChargePeriodChange (index, value) {
    let plan = this.state.plan
    plan.riderCoverages[index].chargePeriod = this.generatePeriod(value)
    console.log(
      'riderChargePeriod' + index,
      plan.riderCoverages[index].chargePeriod
    )
    this.setState({ plan }, () => {
      fireOnChange(document.getElementById('riderCoveragePeriod' + index))
    })
  }

  onRiderCoverageCoveragePeriodChange (index, value) {
    let plan = this.state.plan
    plan.riderCoverages[index].coveragePeriod = this.generatePeriod(value)
    console.log(
      'riderCoveragePeriod' + index,
      plan.riderCoverages[index].coveragePeriod
    )
    this.setState({ plan }, () => {
      fireOnChange(document.getElementById('riderPayPeriod' + index))
    })
  }

  onRiderCoveragePayPeriodChange (index, value) {
    let plan = this.state.plan
    plan.riderCoverages[index].payPeriod = this.generatePeriod(value)
    console.log('riderPayPeriod' + index, plan.riderCoverages[index].payPeriod)
    this.setState({ plan }, () => {
      fireOnChange(document.getElementById('riderEndPeriod' + index))
      fireOnChange(document.getElementById('riderPayEnsure' + index))
    })
  }

  onRiderCoverageEndPeriodChange (index, value) {
    let plan = this.state.plan
    plan.riderCoverages[index].endPeriod = this.generatePeriod(value)
    console.log('riderEndPeriod' + index, plan.riderCoverages[index].endPeriod)
    this.setState({ plan })
  }

  onRiderCoveragePayEnsureChange (index, value) {
    let plan = this.state.plan
    plan.riderCoverages[index].extraProperties = plan.riderCoverages[index].extraProperties? plan.riderCoverages[index].extraProperties : {}
    plan.riderCoverages[index].extraProperties['pay_ensure'] = parseInt(value) || 0
    console.log('riderPayEnsure' + index, plan.riderCoverages[index].extraProperties['pay_ensure'])
    this.setState({ plan })
  }

  onRiderCoveragePropertyChange (index, property, value, type) {
    let plan = this.state.plan
    if (type === 'int') {
      value = parseInt(value) || 0
    } else if (type === 'float') {
      value = parseFloat(value) || 0
    }
    plan.riderCoverages[index][property] = value
    if (property === 'sa') {
      // sub rider sa equal or fixed rate of parent rider
      for (let rider of plan.riderCoverages) {
        if (['0', '6'].includes(""+rider.unitFlag) &&
          !rider.limits.isWaiver) {
          for (let targetAthRate of rider.limits.targetAthRateList) {
            if (targetAthRate.targetAttachedId === plan.riderCoverages[index].productId
              && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '1') {
              rider.sa = value
              break
            }
            if (targetAthRate.targetAttachedId === plan.riderCoverages[index].productId &&
              typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
              let sa = parseFloat((value * targetAthRate.minAthRate).toFixed(0))
              if (typeof targetAthRate.minAthAmt === 'number' && sa < targetAthRate.minAthAmt) {
                sa = targetAthRate.minAthAmt
              } else if (typeof targetAthRate.maxAthAmt === 'number' && sa > targetAthRate.maxAthAmt) {
                sa = targetAthRate.maxAthAmt
              }
              rider.sa = sa
              break
            }
          }
        }
      }
    } else if (property === 'premium') {
      // sub rider premium equal or fixed rate of parent rider
      for (let rider of plan.riderCoverages) {
        if (['0', '7', '10'].includes(""+rider.unitFlag)) {
          for (let targetAthRate of rider.limits.targetAthRateList) {
            if (targetAthRate.targetAttachedId === plan.riderCoverages[index].productId
              && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '3') {
              rider.premium = value
              break
            }
            if (targetAthRate.targetAttachedId === plan.riderCoverages[index].productId &&
              typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
              let premium = parseFloat((value * targetAthRate.minAthRate).toFixed(0))
              if (typeof targetAthRate.minAthAmt === 'number' && premium < targetAthRate.minAthAmt) {
                premium = targetAthRate.minAthAmt
              } else if (typeof targetAthRate.maxAthAmt === 'number' && premium > targetAthRate.maxAthAmt) {
                premium = targetAthRate.maxAthAmt
              }
              rider.premium = premium
              break
            }
          }
        }
      }
    } else if (property === 'unit') {
      // sub rider unit equal or fixed rate of parent rider
      for (let rider of plan.riderCoverages) {
        if (['1', '3'].includes(""+rider.unitFlag)) {
          for (let targetAthRate of rider.limits.targetAthRateList) {
            if (targetAthRate.targetAttachedId === plan.riderCoverages[index].productId
              && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '2') {
              rider.unit = value
              break
            }
            if (targetAthRate.targetAttachedId === plan.riderCoverages[index].productId &&
              typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate) {
              let unit = parseInt((value * targetAthRate.minAthRate).toFixed(0))
              if (typeof targetAthRate.minAthAmt === 'number' && unit < targetAthRate.minAthAmt) {
                unit = targetAthRate.minAthAmt
              } else if (typeof targetAthRate.maxAthAmt === 'number' && unit > targetAthRate.maxAthAmt) {
                unit = targetAthRate.maxAthAmt
              }
              rider.unit = unit
              break
            }
          }
        }
      }
    } else if (property === 'benefitlevel') {
      // sub rider benefitlevel equal
      for (let rider of plan.riderCoverages) {
        if (rider.benefitlevel) {
          for (let targetAthRate of rider.limits.targetAthRateList) {
            if (targetAthRate.targetAttachedId === plan.riderCoverages[index].productId
              && targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === '4') {
              rider.benefitlevel = value
              break
            }
          }
        }
      }
    }
    this.setState({ plan })
  }

  openAddRiderDialog () {
    let plan = this.state.plan
    if (plan.mainCoverages[0].limits.familyType && this.state.plan.insureds.length < 2) {
      this.showDialog('This is a family product, please at least enter two life assureds.')
      return
    }
    this.calcPremium(() => this.getRiders())
  }

  getRiders () {
    let searchRidersParam = this.prepareRidersRequest()
    if (!searchRidersParam) {
      return
    }
    this.props.actions.getRiders(searchRidersParam, error => {
      if (error) {
        this.showDialog(t('Failed to fetch rider list'))
        return
      }
      this.setState({ addRiderDialogOpen: true })
    })
  }

  prepareRidersRequest () {
    let errors = [
      ...this.validateCoverageInputs(this.state.plan.mainCoverages[0]),
    ]
    for (let riderCoverage of this.state.plan.riderCoverages) {
      errors.push(...this.validateCoverageInputs(riderCoverage))
    }
    if (errors.length > 0) {
      this.showDialog(errors)
      return null
    }
    let searchRidersParam = {
      packageCode: this.state.plan.packageCode,
      msg: sessionStorage.getItem('SALES_APP_MSG'),
      sign: sessionStorage.getItem('SALES_APP_SIGN'),
      tenantCode: sessionStorage.getItem('SALES_APP_TENANT_CODE'),
      mainCoverages: [],
      riderCoverages: [],
      attachedPrdtLimitCondition: [],
      insureds: [],
      proposer: null,
    }
    for (let insured of this.state.plan.insureds) {
      let copiedInsured = deepClone(insured)
      delete copiedInsured.limits
      searchRidersParam.insureds.push(copiedInsured)
    }
    let copiedProposer = deepClone(this.state.plan.proposer)
    delete copiedProposer.limits
    searchRidersParam.proposer = copiedProposer
    if (!searchRidersParam.proposer.age) {
      searchRidersParam.proposer.age = searchRidersParam.insureds[0].age
    }
    let copiedMainCoverage = JSON.parse(
      JSON.stringify(this.state.plan.mainCoverages[0])
    )
    delete copiedMainCoverage.limits
    searchRidersParam.mainCoverages.push(copiedMainCoverage)
    for (let riderCoverage of this.state.plan.riderCoverages) {
      let copiedRiderCoverage = deepClone(riderCoverage)
      delete copiedRiderCoverage.limits
      searchRidersParam.riderCoverages.push(copiedRiderCoverage)
    }
    for (let product of this.props.planList) {
      for (let mainCoverage of searchRidersParam.mainCoverages) {
        if (product.salesProductId == mainCoverage.productId) {
          let attachedPrd = {
            attachedProductId: product.salesProductId,
            amountLimitList: product.amountLimitList,
            premLimitList: product.premLimitList,
            ageRange: product.ageRange,
          }
          searchRidersParam.attachedPrdtLimitCondition.push(attachedPrd)
        }
      }
      for (let riderCoverage of searchRidersParam.riderCoverages) {
        if (product.salesProductId == riderCoverage.productId) {
          let attachedPrd = {
            attachedProductId: product.salesProductId,
            amountLimitList: product.amountLimitList,
            premLimitList: product.premLimitList,
            ageRange: product.ageRange,
          }
          searchRidersParam.attachedPrdtLimitCondition.push(attachedPrd)
        }
      }
    }
    return searchRidersParam
  }

  addRider (index) {
    let hasWaiver = false
    let rider = Object.assign({}, this.props.ridersList[index])
    if (rider.isWaiver === 'Y') {
      hasWaiver = true
    }
    // check dependency riders
    if (rider.dependPrdtList && rider.dependPrdtList.length > 0) {
      let dependPrdtExist = false
      let dependPrdtIdList = []
      let dependPrdtNameList = []
      for (let dependPrdt of rider.dependPrdtList) {
        dependPrdtIdList.push(dependPrdt.productBId)
        for (let riderCoverage of this.state.plan.riderCoverages) {
          if (riderCoverage.productId === dependPrdt.productBId) {
            dependPrdtExist = true
            break
          }
        }
        if (dependPrdtExist) {
          break
        }
      }
      if (!dependPrdtExist) {
        for (let product of this.props.ridersList) {
          for (let dependPrdtId of dependPrdtIdList) {
            if (product.salesProductId === dependPrdtId) {
              dependPrdtNameList.push(product.salesProductName)
            }
          }
        }
        this.showDialog(t('This rider depends on {0}, please add it first', dependPrdtNameList.toString()))
        return
      }
    }
    // bring coexist riders
    let coexistRiders = []
    if (rider.coexistPrdtList) {
      for (let prdRelation of rider.coexistPrdtList) {
        if (prdRelation.productAId == rider.salesProductId) {
          for (let product of this.props.ridersList) {
            if (product.salesProductId == prdRelation.productBId) {
              coexistRiders.push(product)
              if (product.isWaiver === 'Y') {
                hasWaiver = true
              }
            }
          }
        }
      }
    }
    let newPlanInitialData = Object.assign({}, this.props.planInitialData)
    newPlanInitialData.planList.push(rider)
    newPlanInitialData.planList.push(...coexistRiders)
    console.log(newPlanInitialData.planList)
    this.props.actions.setPlanInitialData(newPlanInitialData)
    let newPlan = Object.assign({}, this.state.plan)
    newPlan = this.getPlanAfterRiderCoveragesChange(newPlan, newPlanInitialData)
    console.log(newPlan)
    this.setState({ plan: newPlan }, () => {
      setTimeout(() => this.resetSelectValues(), 50)
    })
    if (hasWaiver) {
      this.refs.tip.show(t('New waiver is added, please scroll up if Policyholder Info should be changed!'))
    }
    this.handleAddRiderClose()
  }

  handleAddRiderClose () {
    this.setState({ addRiderDialogOpen: false })
  }

  getPlanAfterRiderCoveragesChange (plan, newPlanInitData) {
    let newPlan = this.initPlanByData(newPlanInitData)
    // start to merge plan and new plan
    plan.insureds[0].limits = newPlan.insureds[0].limits
    if (!this.isProposal) {
      if (!newPlan.insureds[0].jobCateId) {
        delete plan.insureds[0].jobCateId
      } else if (!plan.insureds[0].jobCateId) {
        plan.insureds[0].jobCateId = newPlan.insureds[0].jobCateId
      }
    }
    if (!newPlan.insureds[0].socialInsuranceIndi) {
      delete plan.insureds[0].socialInsuranceIndi
    } else if (!plan.insureds[0].socialInsuranceIndi) {
      plan.insureds[0].socialInsuranceIndi =
        newPlan.insureds[0].socialInsuranceIndi
    }
    if (!newPlan.insureds[0].smoking) {
      delete plan.insureds[0].smoking
    } else if (!plan.insureds[0].smoking) {
      plan.insureds[0].smoking = newPlan.insureds[0].smoking
    }
    if (newPlan.mainCoverages[0].limits.familyType) {
      if (plan.insureds.length > 1) {
        for (let i = 1; i < plan.insureds.length; i++) {
          if (!this.isProposal) {
            if (!newPlan.insureds[0].jobCateId) {
              delete plan.insureds[i].jobCateId
            } else if (!plan.insureds[i].jobCateId) {
              plan.insureds[i].jobCateId = newPlan.insureds[0].jobCateId
            }
          }
          if (!newPlan.insureds[0].socialInsuranceIndi) {
            delete plan.insureds[i].socialInsuranceIndi
          } else if (!plan.insureds[i].socialInsuranceIndi) {
            plan.insureds[i].socialInsuranceIndi =
              newPlan.insureds[0].socialInsuranceIndi
          }
          if (!newPlan.insureds[0].smoking) {
            delete plan.insureds[i].smoking
          } else if (!plan.insureds[i].smoking) {
            plan.insureds[i].smoking = newPlan.insureds[0].smoking
          }
        }
      }
    } else if (newPlan.insureds.length < 2) {
      plan.insureds = plan.insureds.slice(0, 1)
    } else if (plan.insureds.length < 2) {
      plan.insureds.push(newPlan.insureds[1])
    } else {
      plan.insureds[1].limits = newPlan.insureds[1].limits
      if (!this.isProposal) {
        if (!newPlan.insureds[1].jobCateId) {
          delete plan.insureds[1].jobCateId
        } else if (!plan.insureds[1].jobCateId) {
          plan.insureds[1].jobCateId = newPlan.insureds[1].jobCateId
        }
      }
      if (!newPlan.insureds[1].socialInsuranceIndi) {
        delete plan.insureds[1].socialInsuranceIndi
      } else if (!plan.insureds[1].socialInsuranceIndi) {
        plan.insureds[1].socialInsuranceIndi =
          newPlan.insureds[1].socialInsuranceIndi
      }
      if (!newPlan.insureds[1].smoking) {
        delete plan.insureds[1].smoking
      } else if (!plan.insureds[1].smoking) {
        plan.insureds[1].smoking = newPlan.insureds[1].smoking
      }
    }
    plan.proposer.limits = newPlan.proposer.limits
    if (typeof newPlan.proposer.age !== 'number') {
      delete plan.proposer.age
    } else if (typeof plan.proposer.age !== 'number') {
      plan.proposer.age = newPlan.proposer.age
    }
    if (!this.isProposal) {
      if (!newPlan.proposer.jobCateId) {
        delete plan.proposer.jobCateId
      } else if (!plan.proposer.jobCateId) {
        plan.proposer.jobCateId = newPlan.proposer.jobCateId
      }
    }
    if (!newPlan.proposer.socialInsuranceIndi) {
      delete plan.proposer.socialInsuranceIndi
    } else if (!plan.proposer.socialInsuranceIndi) {
      plan.proposer.socialInsuranceIndi = newPlan.proposer.socialInsuranceIndi
    }
    if (!newPlan.proposer.smoking) {
      delete plan.proposer.smoking
    } else if (!plan.proposer.smoking) {
      plan.proposer.smoking = newPlan.proposer.smoking
    }
    let newRiders = []
    for (let newRider of newPlan.riderCoverages) {
      let exists = false
      for (let rider of plan.riderCoverages) {
        if (newRider.productId === rider.productId) {
          exists = true
          break
        }
      }
      if (!exists) {
        newRiders.push(newRider)
      }
    }
    if (plan.mainCoverages[0].limits.familyType) {
      newRiders = this.buildFamilyTypeRiders(newRiders)
    }
    plan.riderCoverages.push(...newRiders)
    return plan
  }

  buildFamilyTypeRiders(riderList) {
    let riders = []
    let insureds = this.state.plan.insureds
    for (let rider of riderList) {
      if (!rider.limits.isWaiver) {
        for (let i = 0; i< insureds.length; i++ ) {
          let famliyRider = deepClone(rider)
          famliyRider.insuredIds = [insureds[i].id]
          famliyRider.itemId = this.getNewItemIndex()
          riders.push(famliyRider)
        }
      } else {
        riders.push(rider)
      }
    }
    console.log(riders)
    return riders
  }

  validateCoverageInputs (coverage, isSave = false) {
    let errors = []
    let sa = coverage.sa
    let premium = coverage.premium
    let unit = coverage.unit
    if (['0', '6'].includes(""+coverage.unitFlag) && !coverage.limits.isWaiver) {
      let minSa = this.getMinSaOrUnitByAge(coverage)
      let maxSa = this.getMaxSaOrUnitByAge(coverage)
      if (sa < minSa || sa > maxSa || sa % coverage.limits.incrementIndex) {
        if (sa < minSa && minSa > maxSa) {
          errors.push(
            <h3 key={'minSa-'+coverage.productCode}>
              {coverage.productName + ' - ' + t('Sum Assured must be not less than {0} and multiple of {1}!', minSa, coverage.limits.incrementIndex)}
            </h3>
          )
        } else {
          errors.push(
            <h3 key={'minSa-'+coverage.productCode}>
              {coverage.productName + ' - ' + t('Sum Assured must be in {0}~{1} and multiple of {2}!', minSa, maxSa, coverage.limits.incrementIndex)}
            </h3>
          )
        }
      }
    }
    if (['1', '3'].includes(""+coverage.unitFlag)) {
      let minUnit = this.getMinSaOrUnitByAge(coverage)
      let maxUnit = this.getMaxSaOrUnitByAge(coverage)
      if (unit < minUnit || unit > maxUnit || unit % coverage.limits.incrementIndex) {
        if (unit < minUnit && minUnit > maxUnit) {
          errors.push(
            <h3 key={'minUnit-'+coverage.productCode}>
              {coverage.productName +
              ' - ' +
              t('Unit must must be not less than {0} and multiple of {1}!', minUnit, coverage.limits.incrementIndex)}
            </h3>
          )
        } else {
          errors.push(
            <h3 key={'minUnit-'+coverage.productCode}>
              {coverage.productName +
              ' - ' +
              t('Unit must must be in {0}~{1} and multiple of {2}!', minUnit, maxUnit, coverage.limits.incrementIndex)}
            </h3>
          )
        }
      }
    }
    if (['0', '7', '10'].includes(""+coverage.unitFlag)) {
      let minPrem = this.getMinPremium(coverage)
      let maxPrem = this.getMaxPremium(coverage)
      if (premium < minPrem || premium > maxPrem || premium % coverage.limits.incrementIndex) {
        if (premium < minPrem && minPrem > maxPrem) {
          errors.push(
            <h3 key={'minPrem-'+coverage.productCode}>
              {coverage.productName +
              ' - ' +
              t('Premium must must be not less than {0} and multiple of {1}!', minPrem, coverage.limits.incrementIndex)}
            </h3>
          )
        } else {
          errors.push(
            <h3 key={'minPrem-'+coverage.productCode}>
              {coverage.productName +
              ' - ' +
              t('Premium must must be in {0}~{1} and multiple of {2}!', minPrem, maxPrem, coverage.limits.incrementIndex)}
            </h3>
          )
        }
      }
    }
    // validate calculated premium for proposal or quote
    if (isSave && coverage.limits.isMain) {
      let minPrem = this.getMinPremium(coverage)
      let maxPrem = this.getMaxPremium(coverage)
      if (premium < minPrem || premium > maxPrem) {
        errors.push(
          <h3 key={'minPrem-'+coverage.productCode}>
            {coverage.productName +
            ' - ' +
            t('Premium must be in {0}~{1} under the current options, please adjust Sum Assured!', minPrem, maxPrem)}
          </h3>
        )
      }
    }
    // validate calculated sa for proposal or quote
    if (isSave && !['1', '3'].includes(""+coverage.unitFlag) && !coverage.benefitlevel && coverage.limits.isMain) {
      let minSa = this.getMinSaOrUnitByAge(coverage)
      let maxSa = this.getMaxSaOrUnitByAge(coverage)
      if (sa < minSa || sa > maxSa) {
        errors.push(
          <h3 key={'minSa-'+coverage.productCode}>
            {coverage.productName +
            ' - ' +
            t('Sum Assured must be in {0}~{1} under the current options, please adjust Premium!', minSa, maxSa)}
          </h3>
        )
      }
    }
    return errors
  }

  onAdviceChange (value) {
    let plan = this.state.plan
    if (value && ['AVRIST'].includes(sessionStorage.getItem('SALES_APP_TENANT_CODE'))) {
      value = value.toUpperCase()
    }
    plan.advice = value
    this.setState({ plan })
  }

  onShowAdviceChange (checked) {
    let plan = this.state.plan
    plan.showAdvice = checked ? 'Y' : 'N'
    this.setState({ plan })
  }

  handleRemoveRiderOpen (index) {
    this.setState({ removeRiderDialogOpen: true, deletedRiderIndex: index })
  }

  handleRemoveRiderClose () {
    this.setState({ removeRiderDialogOpen: false, deletedRiderIndex: null })
  }

  handleRemoveRider () {
    this.removeRider(this.state.deletedRiderIndex)
    this.handleRemoveRiderClose()
  }

  setCalcPremiumTableOpen (open) {
    this.setState({ calcPremiumTableOpen: open })
  }

  calcPremium (callback) {
    let requestPlan = this.preparePlan()
    if (!requestPlan) {
      return
    }
    let calcPremiuRequest = {
      plan : requestPlan,
      msg: sessionStorage.getItem('SALES_APP_MSG'),
      sign: sessionStorage.getItem('SALES_APP_SIGN'),
      tenantCode: sessionStorage.getItem('SALES_APP_TENANT_CODE'),
    }
    this.props.actions.calcPremium(
      calcPremiuRequest,
      (error, totalFirstYearPrem, annualPrem, coveragePrems) => {
        if (error) {
          this.showDialog(t('Failed to calculate premium'))
          return
        }
        this.setCalcPremiumTableOpen(true)
        let plan = this.state.plan
        plan.totalFirstYearPrem = totalFirstYearPrem
        plan.annualPrem = annualPrem
        for (let coveragePrem of coveragePrems) {
          for (let mainCoverage of plan.mainCoverages) {
            if (coveragePrem.itemId == mainCoverage.itemId) {
              mainCoverage.firstYearPrem = coveragePrem.firstYearPrem
              mainCoverage.premium = coveragePrem.premAn
              mainCoverage.premAn = coveragePrem.premAn
              mainCoverage.sa = coveragePrem.sa
              mainCoverage.unit = coveragePrem.unit
              continue
            }
          }
          for (let riderCoverage of plan.riderCoverages) {
            if (coveragePrem.itemId == riderCoverage.itemId) {
              if (plan.mainCoverages[0].limits.familyType && !riderCoverage.limits.isWaiver) {
                coveragePrem.insuredIndex = this.getCoveragePointToInsuredIndex(riderCoverage)
              }
              riderCoverage.firstYearPrem = coveragePrem.firstYearPrem
              riderCoverage.premium = coveragePrem.premAn
              riderCoverage.premAn = coveragePrem.premAn
              riderCoverage.sa = coveragePrem.sa
              riderCoverage.unit = coveragePrem.unit
              continue
            }
          }
        }
        console.log(plan)
        this.setState({ plan }, () => {
          callback && callback()
        })
      }
    )
  }

  validateSpecial(isSave = false) {
    let errors = []
    let mainCoverage = this.state.plan.mainCoverages[0]
    if (mainCoverage.productCode === 'AIAIFELRPX') {
      let premiumInvestRates = mainCoverage.investRates.filter(
        investRate => investRate.premType == '2'
      )
      let regularTopupInvestRates = mainCoverage.investRates.filter(
        investRate => investRate.premType == '3'
      )
      if (premiumInvestRates.length === regularTopupInvestRates.length) {
        for (let premiumFund of premiumInvestRates) {
          let existingSame = false
          for (let regularTopupFund of regularTopupInvestRates) {
            if (premiumFund.fundCode === regularTopupFund.fundCode && premiumFund.assignRate === regularTopupFund.assignRate) {
              existingSame = true
              break
            }
          }
          if (!existingSame) {
            errors.push(
              <h3 key='AIAIFELRPX_REGULAR_TOPUP_FUND'>Fund Allocation of Regular Topup must be same as Premium</h3>
            )
            break
          }
        }
      } else {
        errors.push(
          <h3 key='AIAIFELRPX_REGULAR_TOPUP_FUND'>Fund Allocation of Regular Topup must be same as Premium</h3>
        )
      }
    } else if (isSave && mainCoverage.productCode === 'SHTFAMBSC') {
      const productCodeNCB = 'AVSHFWP'
      const productCodeNoneNCB = 'AVSHFNCWP'
      const benefitlevelSpecialList = ['E', 'F']
      let maxAdultHighBenefitlevel = 'A'
      let maxChildHighBenefitlevel = 'A'
      let hasChildBenefitlevelSpecial = false
      let childBenefitleveList = []
      let existNCB = false
      let existNoneNCB = false
      for (let rider of this.state.plan.riderCoverages) {
        if (rider.limits.isWaiver) {
          continue
        }
        if (rider.productCode === productCodeNCB) {
          existNCB = true
        } else if (rider.productCode === productCodeNoneNCB) {
          existNoneNCB = true
        }
        let insuredIndex = this.getCoveragePointToInsuredIndex(rider)
        let insured = this.state.plan.insureds[insuredIndex]
        if (insured.relationToMainInsured !== 2) {
          if (rider.benefitlevel > maxAdultHighBenefitlevel) {
            maxAdultHighBenefitlevel = rider.benefitlevel
          }
        } else if (insured.relationToMainInsured === 2) {
          if (benefitlevelSpecialList.includes(rider.benefitlevel)) {
            hasChildBenefitlevelSpecial = true
          }
          if (rider.benefitlevel > maxChildHighBenefitlevel) {
            maxChildHighBenefitlevel = rider.benefitlevel
          }
          if (childBenefitleveList.indexOf(rider.benefitlevel) < 0) {
            childBenefitleveList.push(rider.benefitlevel)
          }
        }
      }
      if ((!existNCB && !existNoneNCB) || (existNCB && existNoneNCB)) {
        errors.push(
          <h3 key='SHTFAMBSC_RIDER_EXIST'>Please choose and fill in NCB or Non-NCB plan before generate quotation.</h3>
        )
      }
      if (hasChildBenefitlevelSpecial && (maxChildHighBenefitlevel > maxAdultHighBenefitlevel || childBenefitleveList.length > 1)) {
        errors.push(
          <h3 key='SHTFAMBSC_PLAN_SPECIAL'>When children choose plan E Or F, all siblings must choose same plan and not higher than parents' upper plan.</h3>
        )
      }
    } else if (isSave && mainCoverage.productCode === 'SHTDUMRP') {
      const productCodeNCB = 'AVSHIWP'
      const productCodeNoneNCB = 'AVSHINCWP'
      let existNCB = false
      let existNoneNCB = false
      for (let rider of this.state.plan.riderCoverages) {
        if (rider.limits.isWaiver) {
          continue
        }
        if (rider.productCode === productCodeNCB) {
          existNCB = true
        } else if (rider.productCode === productCodeNoneNCB) {
          existNoneNCB = true
        }
      }
      if ((!existNCB && !existNoneNCB) || (existNCB && existNoneNCB)) {
        errors.push(
          <h3 key='SHTDUMRP_RIDER_EXIST'>Please choose and fill in NCB or Non-NCB plan before generate quotation.</h3>
        )
      }
    }
    return errors
  }

  preparePlan (isSave = false) {
    let errors = [
      ...this.validateProposalRoles(),
      ...this.validateCoverageInputs(this.state.plan.mainCoverages[0], isSave),
      ...this.validateIlpInputs(this.state.plan.mainCoverages[0]),
    ]
    for (let riderCoverage of this.state.plan.riderCoverages) {
      errors.push(...this.validateCoverageInputs(riderCoverage, isSave))
    }
    errors.push(...this.validateSpecial(isSave))
    if (errors.length > 0) {
      this.showDialog(errors)
      return null
    }
    let newPlan = deepClone(this.state.plan)
    // change paymentFreq to 5 if Single Premium
    for (let coverage of [...newPlan.mainCoverages, ...newPlan.riderCoverages]) {
      if (coverage.limits.isUDRider) {
        coverage.paymentFreq = 4
      } else if (coverage.chargePeriod && coverage.chargePeriod.periodType === 1) {
        coverage.paymentFreq = 5
      } else {
        coverage.paymentFreq = newPlan.mainCoverages[0].paymentFreq
      }
    }
    delete newPlan.proposer.limits
    if (newPlan.proposer.birthday) {
      newPlan.proposer.age = getAgeByBirthday(newPlan.proposer.birthday)
    }
    for (let insured of newPlan.insureds) {
      delete insured.limits
      if (insured.laPhRela == 1) {
        let originalId = insured.id
        Object.assign(insured, newPlan.proposer)
        insured.id = originalId
      }
      if (insured.birthday) {
        insured.age = getAgeByBirthday(insured.birthday)
      }
    }
    for (let coverage of newPlan.riderCoverages) {
      // set waiver charge period and coverage period by main charge period
      if (newPlan.mainCoverages[0].limits.isIlpProduct && coverage.limits.isWaiver && coverage.limits.pointToPH && ["AVRIST"].includes(newPlan.salesCompanyCode)) {
        let mainInsuredAge = newPlan.insureds[0].age
        let phAge = newPlan.proposer.age
        if (mainInsuredAge < 18) {
          let maxCoverageYear = 25 - mainInsuredAge
          if ((65 - phAge) < maxCoverageYear) {
            maxCoverageYear = 65 - phAge
          }
          coverage.chargePeriod = {
            periodType: 2,
            periodValue: maxCoverageYear,
          }
          coverage.coveragePeriod = {
            periodType: 2,
            periodValue: maxCoverageYear,
          }
        } else {
          let maxCoverageYear = 65 - mainInsuredAge
          if ((65 - phAge) < maxCoverageYear) {
            maxCoverageYear = 65 - phAge
          }
          coverage.chargePeriod = {
            periodType: 2,
            periodValue: maxCoverageYear,
          }
          coverage.coveragePeriod = {
            periodType: 2,
            periodValue: maxCoverageYear,
          }
        }
      } else if (coverage.limits.isWaiver && ["AVRIST"].includes(newPlan.salesCompanyCode)) {
        let mainChargeYear = this.getMaxChargeYear(newPlan.mainCoverages[0])
        let maxWaiverCoverageYear = 0
        let maxWaiverCovereageLimit = null
        let maxWaiverChargeLimit = null
        for (let coverageLimit of coverage.limits.coveragePeriod) {
          let waiverCoverageYear = this.getMaxCoverageYear({
            coveragePeriod : {
              periodType: coverageLimit.periodType,
              periodValue: coverageLimit.periodValue,
            }
          })
          if (waiverCoverageYear > maxWaiverCoverageYear && waiverCoverageYear <= mainChargeYear) {
            maxWaiverCoverageYear = waiverCoverageYear
            maxWaiverCovereageLimit = coverageLimit
          }
        }
        if (maxWaiverCovereageLimit) {
          let maxWaiverChargeYear = 0
          for (let chargeLimit of maxWaiverCovereageLimit.chargePeriod) {
            let waiverChargeYear = this.getMaxChargeYear({
              chargePeriod : {
                periodType: chargeLimit.periodType,
                periodValue: chargeLimit.periodValue,
              }
            })
            if (waiverChargeYear > maxWaiverChargeYear) {
              maxWaiverChargeYear = waiverChargeYear
              maxWaiverChargeLimit = chargeLimit
            }
          }
        }
        if (maxWaiverCovereageLimit && maxWaiverChargeLimit) {
          coverage.chargePeriod = {
            periodType: maxWaiverChargeLimit.periodType,
            periodValue: maxWaiverChargeLimit.periodValue,
          }
          coverage.coveragePeriod = {
            periodType: maxWaiverCovereageLimit.periodType,
            periodValue: maxWaiverCovereageLimit.periodValue,
          }
        } else {
          console.log(`Cannot get max coverage year and max charge year of waiver ${coverage.productCode}`)
        }
      } else if (coverage.limits.isWaiver) {
        let mainChargePeriod = newPlan.mainCoverages[0].chargePeriod
        let waiverChargeYearAdjustment =
          coverage.limits.waiverChargeYearAdjustment
        let waiverChargeYear =
          mainChargePeriod.periodValue + waiverChargeYearAdjustment > 0
            ? mainChargePeriod.periodValue + waiverChargeYearAdjustment
            : mainChargePeriod.periodValue
        coverage.chargePeriod = {
          periodType: mainChargePeriod.periodType,
          periodValue: waiverChargeYear,
        }
        switch (mainChargePeriod.periodType) {
          case 2:
          case 3:
            coverage.coveragePeriod = {
              periodType: mainChargePeriod.periodType,
              periodValue: waiverChargeYear,
            }
            break
          case 4:
            coverage.coveragePeriod = {
              periodType: 1,
              periodValue: 0,
            }
            break
          default:
            break
        }
      }
      delete coverage.limits
    }
    delete newPlan.mainCoverages[0].limits
    newPlan.inforceDate = getTomorrow()
    newPlan.submitDate = getToday()
    console.log(newPlan)
    return newPlan
  }

  handleFromContactListClose () {
    this.setState({ fromContactListOpen: false, insuredIndex: null })
  }

  handleFromContactListOpen (index) {
    if (!this.state.fromContactListSearched) {
      this.searchContact('')
    }
    this.setState({ fromContactListOpen: true, insuredIndex: index })
  }

  handleSameAsInsured() {
    let plan = this.state.plan
    let mainInsured = plan.insureds[0]
    if (["AVRIST"].includes(plan.salesCompanyCode)) {
      mainInsured.laPhRela = 1
    }
    this.state.insuredIndex = -1
    let customer = {
      name: mainInsured.name,
      birthday: mainInsured.birthday,
      age: mainInsured.age,
      gender: mainInsured.gender,
      jobCateId: mainInsured.jobCateId,
      jobCateCode: mainInsured.jobCateCode,
      certiType: mainInsured.certiType,
      certiCode: mainInsured.certiCode,
      certiBeginDate: mainInsured.certiBeginDate,
      certiEndDate: mainInsured.certiEndDate,
      mobile: mainInsured.mobile,
      email: mainInsured.email,
      nationality: mainInsured.nationality,
      marriageStatus: mainInsured.marriageStatus,
      height: mainInsured.height,
      weight: mainInsured.weight,
      addresses: mainInsured.addresses,
      extraProperties: mainInsured.extraProperties,
      declaration: mainInsured.declaration,
    }
    this.setCustomer(customer)
  }

  searchContact (text) {
    let params = {
      keyWords: text,
      start: 0,
      pageSize: 10000,
      msg: sessionStorage.getItem('SALES_APP_MSG'),
      sign: sessionStorage.getItem('SALES_APP_SIGN'),
      tenantCode: sessionStorage.getItem('SALES_APP_TENANT_CODE'),
    }
    this.props.actions.getCustomers(params, error => {
      if (error) {
        this.showDialog(t('Failed to fetch customer list'))
        return
      }
      this.setState({ fromContactListSearched: true })
    })
  }

  setCustomer (customer) {
    this.handleFromContactListClose()
    if (customer.birthday) {
      customer.age = getAgeByBirthday(customer.birthday) // recalc age by birthday
    }
    let insuredIndex = this.state.insuredIndex
    let plan = this.state.plan
    if (insuredIndex === -1) {
      if (customer.age !== null  && !this.getPhAgeRange().includes(customer.age)) {
        this.showDialog(t("The age of selected customer doesn't meet current insurance conditions, please adjust inputs or pick another one."))
        return
      }
      let proposer = plan.proposer
      let originalAge = proposer.age
      let originalId = proposer.id
      let originalSmoking = proposer.smoking
      Object.assign(proposer, customer)
      if (customer.age === null) {
        proposer.age = originalAge
      }
      if (customer.smoking === null) {
        proposer.smoking = originalSmoking
      }
      proposer.id = originalId
      if (!proposer.addresses || proposer.addresses.length === 0) {
        proposer.addresses = [
          {
            province: '',
            city: '',
            region: '',
            address: '',
            postCode: '',
          },
        ]
      }
    } else {
      let insured = plan.insureds[insuredIndex]
      if (customer.age !== null && !insured.limits.age.includes(customer.age)) {
        this.showDialog(t("The age of selected customer doesn't meet current insurance conditions, please adjust inputs or pick another one."))
        return
      }
      let availableGenderOptions = this.getInsuredGenderOptions(
        insuredIndex,
        customer.age
      )
      let genderContains = false
      for (let genderOption of availableGenderOptions) {
        if (genderOption.value === customer.gender) {
          genderContains = true
          break
        }
      }
      if (!genderContains) {
        this.showDialog(t("The gender of selected customer doesn't meet the current options, please adjust inputs and pick one again."))
        return
      }
      let originalAge = insured.age
      let originalId = insured.id
      let originalSmoking = insured.smoking
      Object.assign(insured, customer)
      if (customer.age === null) {
        insured.age = originalAge
      }
      if (customer.smoking === null) {
        insured.smoking = originalSmoking
      }
      insured.id = originalId
      if (!insured.addresses || insured.addresses.length === 0) {
        insured.addresses = [
          {
            province: '',
            city: '',
            region: '',
            address: '',
            postCode: '',
          },
        ]
      }
    }
    this.setState({ plan }, () => {
      // initial all dropdowns after age change
      setTimeout(() => this.resetSelectValues(), 50)
    })
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

  saveAfterRecalcPremium () {
    if (!this.props.calcPremium) {
      this.showDialog(t('Please calculate premium first'))
      return
    }
    this.calcPremium(() => {
      this.validateBeforeSaveSpecial(()=>this.savePlan())
    })
  }

  validateBeforeSaveSpecial(callback) {
    if (this.state.plan.mainCoverages[0].limits.isIlpProduct && ["AVRIST"].includes(this.state.plan.salesCompanyCode)) {
      let plan = this.preparePlan(true)
      let illustrationCalcRequest = {
        plan,
        msg: sessionStorage.getItem("SALES_APP_MSG"),
        sign: sessionStorage.getItem("SALES_APP_SIGN"),
        tenantCode: sessionStorage.getItem("SALES_APP_TENANT_CODE"),
        performanceLevel: 2,
      };
      this.props.actions.fetchPlanIllustration(illustrationCalcRequest, (error, illusMap) => {
        if (error) {
          this.showDialog(t('Failed to fetch dynamic demo'));
          return
        }
        if (this.existingZeroUnappliedPremium(illusMap)) {
          this.showDialog('Unapplied Premium is negative, please increase the Premium');
        } else {
          callback && callback()
        }
      })
    } else {
      callback && callback()
    }
  }

  existingZeroUnappliedPremium(illusMap) {
    if (illusMap && illusMap["2"] && illusMap["2"]["1"]) {
      for (let illItem of illusMap["2"]["1"]) {
        if (illItem.type === 996 && illItem.value <= 0) {
          return true
        }
      }
    }
    return false
  }

  savePlan () {
    let plan = this.preparePlan(true)
    if (!plan) {
      return
    }
    if (this.isProposal) {
      this.props.actions.setPlan(this.state.plan)
      this.props.actions.setProposal(plan)
      let url =
        '/quote/' + this.props.params.packageCode + '/doProposal/proposerInfo'
      let quotationCode = this.props.params.quotationCode
      let proposalCode = this.props.params.proposalCode
      if (quotationCode && proposalCode) {
        url += '/' + quotationCode + '/' + proposalCode
      }
      url += '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE')
      browserHistory.push(url)
    } else {
      let savePlanRequest = {
        plan,
        msg: sessionStorage.getItem('SALES_APP_MSG'),
        sign: sessionStorage.getItem('SALES_APP_SIGN'),
        tenantCode: sessionStorage.getItem('SALES_APP_TENANT_CODE'),
      }
      this.props.actions.savePlan(savePlanRequest, (error, planCode) => {
        if (error) {
          this.showDialog(t('Failed to generate quotation'))
          return
        }
        this.props.actions.setPlan(this.state.plan)
        let url = '/plan/' + planCode
        url += '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE')
        let langCode = sessionStorage.getItem('SALES_APP_LANGUAGE')
        if (langCode) {
          url += '&lang=' + langCode
        }
        browserHistory.push(url)
      })
    }
  }

  getPhAgeRange () {
    let ageRange = []
    let mainCoverage = this.state.plan.mainCoverages[0]
    let mainChargePeriod = mainCoverage.chargePeriod
    let mainInsuredAge = this.state.plan.insureds[0].age
    let secInsuredAge = null
    if (this.state.plan.insureds.length > 1) {
      secInsuredAge = this.state.plan.insureds[1].age
    }
    let phAge = this.state.plan.proposer.age
    let mainInsuredGender = this.state.plan.insureds[0].gender
    let secInsuredGender = null
    if (this.state.plan.insureds.length > 1) {
      secInsuredGender = this.state.plan.insureds[1].gender
    }
    let phGender = this.state.plan.proposer.gender
    let phAgeLimits = this.state.plan.proposer.limits.age
    let finalMinPhAge = MIN_PH_AGE
    let finalMaxPhAge = MAX_AGE
    for (let phAgeLimit of phAgeLimits) {
      let {
        minInsdAge,
        maxInsdAge,
        gender,
        minPhAge,
        maxPhAge,
        chargePeriod,
        chargeYear,
        waiverChargeYearAdjustment,
        pointToPH,
        pointToSecInsured,
      } = phAgeLimit
      let waiverChargeYear =
        mainChargePeriod.periodValue + waiverChargeYearAdjustment > 0
          ? mainChargePeriod.periodValue + waiverChargeYearAdjustment
          : mainChargePeriod.periodValue
      let insuredAge = mainInsuredAge
      if (pointToSecInsured) {
        insuredAge = secInsuredAge
      } else if (pointToPH) {
        insuredAge = phAge
      }
      let insuredGender = mainInsuredGender
      if (pointToSecInsured) {
        insuredGender = secInsuredGender
      } else if (pointToPH) {
        insuredGender = phGender
      }
      if (
        mainChargePeriod.periodType == chargePeriod && waiverChargeYear == chargeYear && insuredAge >= minInsdAge
        && insuredAge <= maxInsdAge && (!gender || gender === 'N' || insuredGender === gender)
      ) {
        let testMinPhAge = pointToPH? minInsdAge : minPhAge
        if (testMinPhAge >= finalMinPhAge) {
          finalMinPhAge = testMinPhAge
        }
        let testMaxPhAge = pointToPH? maxInsdAge : maxPhAge
        if (testMaxPhAge <= finalMaxPhAge) {
          finalMaxPhAge = testMaxPhAge
        }
      }
    }
    if (this.state.plan.proposer.limits.minAge && finalMinPhAge < this.state.plan.proposer.limits.minAge) {
      finalMinPhAge = this.state.plan.proposer.limits.minAge
    }
    if (this.state.plan.proposer.limits.maxAge && finalMaxPhAge > this.state.plan.proposer.limits.maxAge) {
      finalMaxPhAge = this.state.plan.proposer.limits.maxAge
    }
    for (let i = finalMinPhAge; i <= finalMaxPhAge; i++) {
      ageRange.push(i)
    }
    return ageRange
  }

  getInsuredGenderOptions (index, age) {
    const GENDER_OPTIONS = [
      { value: 'M', label: t('Male') },
      { value: 'F', label: t('Female') },
    ]
    let defaultGenderOptions = [...GENDER_OPTIONS]
    if (age === null) {
      return defaultGenderOptions
    }
    let availableGenders = new Set()
    for (let genderLimit of this.state.plan.insureds[index].limits.gender) {
      if (genderLimit.minAge <= age && age <= genderLimit.maxAge) {
        if (!genderLimit.gender || genderLimit.gender === 'N') {
          availableGenders.add('M')
          availableGenders.add('F')
          break
        } else {
          availableGenders.add(genderLimit.gender)
        }
      }
    }
    return availableGenders.size > 0
      ? defaultGenderOptions.filter(option =>
          availableGenders.has(option.value)
        )
      : defaultGenderOptions
  }

  getJobClassOptions (jobCateList) {
    const JOB_CLASSES = [
      { label: t('Class 1'), value: 1 },
      { label: t('Class 2'), value: 2 },
      { label: t('Class 3'), value: 3 },
      { label: t('Class 4'), value: 4 },
      { label: t('Class 5'), value: 5 },
      { label: t('Class 6'), value: 6 },
      { label: t('Class 7'), value: 7 },
      { label: t('Class 8'), value: 8 },
      { label: t('Class 9'), value: 9 },
    ]
    let defaultJobCateList = DEFAULT_JOB_CATE_LIST
    if (jobCateList && jobCateList.length > 0 &&
      !(jobCateList.length === 1 && jobCateList[0] === 0)) {
      defaultJobCateList = jobCateList
    }
    return JOB_CLASSES.filter(option =>
      defaultJobCateList.includes(option.value)
    )
  }

  getMaxCoverageYear (mainCoverage) {
    let maxYear = mainCoverage.coveragePeriod.periodValue
    if (mainCoverage.coveragePeriod.periodType === 1) {
      maxYear = MAX_AGE - this.state.plan.insureds[0].age
    } else if (mainCoverage.coveragePeriod.periodType === 3) {
      maxYear =
        mainCoverage.coveragePeriod.periodValue -
        this.state.plan.insureds[0].age
    }
    return maxYear
  }

  getMaxChargeYear (mainCoverage) {
    let maxYear = mainCoverage.chargePeriod.periodValue
    if (mainCoverage.chargePeriod.periodType === 4) {
      maxYear = MAX_AGE - this.state.plan.insureds[0].age
    } else if (mainCoverage.chargePeriod.periodType === 3) {
      maxYear =
        mainCoverage.chargePeriod.periodValue -
        this.state.plan.insureds[0].age
    } else if (mainCoverage.chargePeriod.periodType === 1) {
      maxYear = 1
    }
    return maxYear
  }

  validateIlpInputs (mainCoverage) {
    let errors = []
    if (mainCoverage.limits.isIlpProduct) {
      let permiumInvestRates = mainCoverage.investRates.filter(
        investRate => investRate.premType == '2'
      )
      if (permiumInvestRates.length <= 0) {
        errors.push(
          <h3 key='permiumInvestRates'>
            {t('Please add fund for Premium!')}
          </h3>
        )
      }
      let maxCoverageYear = this.getMaxCoverageYear(mainCoverage)
      if (mainCoverage.limits.singleTopupPermit) {
        // let newMaxCoverageYear = maxCoverageYear
        // if (["AVRIST"].includes(this.state.plan.salesCompanyCode)) {
        //   // AVRIST special only allow 1st year single topup
        //   newMaxCoverageYear = 1
        // }
        let singleTopups = mainCoverage.topupWithdraws.filter(
          topupWithdraw => topupWithdraw.premType == '4'
        )

        let singleTopupYearMap = {}
        for (let i = 0; i < singleTopups.length; i++) {
          let singleTopup = singleTopups[i]
          let lineNumber = i + 1

          let minSingleTopup = this.getMinSingleTopup(mainCoverage)
          let maxSingleTopup =  this.getMaxSingleTopup(mainCoverage)
          if (singleTopup.amount < minSingleTopup || singleTopup.amount > maxSingleTopup) {
            errors.push(
              <h3 key={'singleTopupAmount_' + i}>
                {t('Amount of Single Topup #{0} must be in {1}~{2}!', lineNumber, minSingleTopup, maxSingleTopup)}
              </h3>
            )
          }

          if (
            singleTopup.startYear < mainCoverage.limits.topupStartYear ||
            singleTopup.startYear > maxCoverageYear
          ) {
            errors.push(
              <h3 key={'singleTopupStartYear_' + i}>
                {t('Topup Year of Single Topup #{0} must be in {1}~{2}!',
                  lineNumber,
                  mainCoverage.limits.topupStartYear,
                  maxCoverageYear
                )}
              </h3>
            )
          }

          if (singleTopupYearMap[singleTopup.startYear]) {
            errors.push(
              <h3 key={'singleTopupStartYearDuplicated_' + i}>
                {t('Topup Year of Single Topup #{0} is duplicated by #{1}!',
                  lineNumber,
                  singleTopupYearMap[singleTopup.startYear]
                )}
              </h3>
            )
          } else {
            singleTopupYearMap[singleTopup.startYear] = lineNumber
          }
        }

        let singleTopupInvestRates = mainCoverage.investRates.filter(
          investRate => investRate.premType == '4'
        )
        if (singleTopups.length <= 0 && singleTopupInvestRates.length > 0) {
          errors.push(
            <h3 key='singleTopupPremiumMissing'>
              {t('Please set Single Topup before add fund!')}
            </h3>
          )
        } else if (
          singleTopups.length > 0 &&
          singleTopupInvestRates.length <= 0
        ) {
          errors.push(
            <h3 key='singleTopupPremiumFund'>
              {t('Please add fund for Single Topup!')}
            </h3>
          )
        }
      }
      if (mainCoverage.limits.regularTopupPermit) {
        let regularTopup = mainCoverage.topupWithdraws.filter(
          topupWithdraw => topupWithdraw.premType == '3'
        )[0]
        let minRegularTopup = this.getMinRegularTopup(mainCoverage)
        let maxRegularTopup = this.getMaxRegularTopup(mainCoverage)
        if (regularTopup.amount < minRegularTopup || regularTopup.amount > maxRegularTopup) {
          errors.push(
            <h3 key='regularTopupPremiumAmount'>
              {t('Amount of Regular Topup must be in {0}~{1}!', minRegularTopup, maxRegularTopup)}
            </h3>
          )
        }

        let regularTopupInvestRates = mainCoverage.investRates.filter(
          investRate => investRate.premType == '3'
        )
        if (regularTopup.amount <= 0 && regularTopupInvestRates.length > 0) {
          errors.push(
            <h3 key='regularTopupPremiumMissing'>
              {t('Please set Regular Topup before add fund!')}
            </h3>
          )
        } else if (
          regularTopup.amount > 0 &&
          regularTopupInvestRates.length <= 0
        ) {
          errors.push(
            <h3 key='regularTopupPremiumFund'>
              {t('Please add fund for Regular Topup!')}
            </h3>
          )
        }
      }
      if (mainCoverage.limits.partialWithdrawPermit) {
        let partialWithdraws = mainCoverage.topupWithdraws.filter(
          topupWithdraw => topupWithdraw.premType == '7'
        )

        for (let i = 0; i < partialWithdraws.length; i++) {
          let partialWithdraw = partialWithdraws[i]
          let lineNumber = i + 1

          if (partialWithdraw.amount === 0 ||
            partialWithdraw.amount < mainCoverage.limits.regPartWithdrMinAmount ||
            partialWithdraw.amount > mainCoverage.limits.regPartWithdrMaxAmount
          ) {
            errors.push(
              <h3 key={'partialWithdrawAmount_' + i}>
                {t('Amount of Partial Withdraw #{0} must be in {1}~{2}!', lineNumber, mainCoverage.limits.regPartWithdrMinAmount, mainCoverage.limits.regPartWithdrMaxAmount)}
              </h3>
            )
          }

          if (
            partialWithdraw.startYear < mainCoverage.limits.partialWithdrawStartYear ||
            partialWithdraw.startYear > maxCoverageYear
          ) {
            errors.push(
              <h3 key={'singleTopupStartYear_' + i}>
                {t('Start Year of Partial Withdraw #{0} must be in {1}~{2}!',
                  lineNumber,
                  mainCoverage.limits.partialWithdrawStartYear,
                  maxCoverageYear
                )}
              </h3>
            )
          }
          if (
            partialWithdraw.endYear < mainCoverage.limits.partialWithdrawStartYear ||
            partialWithdraw.endYear > maxCoverageYear
          ) {
            errors.push(
              <h3 key={'singleTopupEndYear_' + i}>
                {t('End Year of Partial Withdraw #{0} must be in {1}~{2}!',
                  lineNumber,
                  mainCoverage.limits.partialWithdrawStartYear,
                  maxCoverageYear
                )}
              </h3>
            )
          }
          if (partialWithdraw.startYear > partialWithdraw.endYear) {
            errors.push(
              <h3 key={'singleTopupStartEndYear_' + i}>
                {t('End Year of Partial Withdraw #{0} must be no less than Start Year!', lineNumber)}
              </h3>
            )
          }

          for (let j = i + 1; j < partialWithdraws.length; j++) {
            let comparePartialWithdraw = partialWithdraws[j]
            let compareLineNumber = j + 1
            if (
              (partialWithdraw.startYear >= comparePartialWithdraw.startYear &&
                partialWithdraw.startYear <= comparePartialWithdraw.endYear) ||
              (partialWithdraw.endYear >= comparePartialWithdraw.startYear &&
                partialWithdraw.endYear <= comparePartialWithdraw.endYear) ||
              (comparePartialWithdraw.startYear <= partialWithdraw.startYear &&
                comparePartialWithdraw.startYear <= partialWithdraw.endYear) ||
              (comparePartialWithdraw.endYear >= partialWithdraw.startYear &&
                comparePartialWithdraw.endYear <= partialWithdraw.endYear)
            ) {
              errors.push(
                <h3 key={'singleTopupStartEndYear_' + i + '_' + j}>
                  {t('Withdraw Years of Partial Withdraw #{0} and #{1} are crossed each other!', lineNumber, compareLineNumber)}
                </h3>
              )
            }
          }
        }
      }
    }
    return errors
  }

  getMaxInsuredProposalBirthday (ageList, ageRangeList) {
    let minAge = 0
    if (ageList && ageList.length > 0) {
      minAge = ageList[0]
    }
    let maxMinProposalDay = 0
    if (ageRangeList && ageRangeList.length > 0) {
      for (let ageRange of ageRangeList) {
        if (ageRange.minUnit === "5" && ageRange.minAge > maxMinProposalDay) {
          maxMinProposalDay = ageRange.minAge
        }
      }
    }
    let maxMinProposalAge = parseInt(maxMinProposalDay / 365)
    if (maxMinProposalAge >= minAge) {
      return getDateFromToday(0 - maxMinProposalDay)
    } else {
      return getBirthdayFromToday(minAge)
    }
  }

  getMinBirthday (ageList) {
    if (ageList && ageList.length > 0) {
      return getBirthdayFromToday(ageList[ageList.length - 1])
    }
    return null
  }

  getMaxBirthday (ageList) {
    if (ageList && ageList.length > 0) {
      return getBirthdayFromToday(ageList[0])
    }
    return null
  }

  validateProposalRoles () {
    let errors = []
    if (this.isProposal) {
      let phName = this.state.plan.proposer.name
      if (!phName || phName.trim().length === 0) {
        errors.push(
          <h3 key='phName'>
            {t('Please input name of Policyholder!')}
          </h3>
        )
      }
      let phBirthday = this.state.plan.proposer.birthday
      if (!phBirthday) {
        errors.push(
          <h3 key='phBirthday'>
            {t('Please select birthday of Policyholder!')}
          </h3>
        )
      }
      let CompanyComponents = companies[this.state.plan.salesCompanyCode]
      let phOccupation = this.state.plan.proposer.jobCateId
      if (CompanyComponents && !phOccupation) {
        errors.push(
          <h3 key='phOccupation'>
            {t('Please select occupation of Policyholder!')}
          </h3>
        )
      }
      let insureds = this.state.plan.insureds
      let mainInsured = insureds[0]
      let mainInsuredName = mainInsured.name
      let mainInsuredRelation = mainInsured.laPhRela
      if (!mainInsuredRelation || mainInsuredRelation == '0') {
        errors.push(
          <h3 key='mainInsuredRelation'>
            {t('Please select relation to policyholder of Insured!')}
          </h3>
        )
      } else if (mainInsuredRelation != '1') {
        if (!mainInsuredName || mainInsuredName.trim().length === 0) {
          errors.push(
            <h3 key='mainInsuredName'>
              {t('Please input name of Insured!')}
            </h3>
          )
        }
        let mainInsuredBirthday = mainInsured.birthday
        if (!mainInsuredBirthday) {
          errors.push(
            <h3 key='mainInsuredBirthday'>
              {t('Please select birthday of Insured!')}
            </h3>
          )
        }
        let mainInsuredOccupation = mainInsured.jobCateId
        if (!mainInsuredOccupation) {
          errors.push(
            <h3 key='mainInsuredOccupation'>
              {t('Please select occupation of Insured!')}
            </h3>
          )
        }
      }
      if (insureds.length > 1) {
        let secInsured = insureds[1]
        let secInsuredRelation = secInsured.laPhRela
        if (!secInsuredRelation || secInsuredRelation == '0') {
          errors.push(
            <h3 key='secInsuredRelation'>
              {t('Please select relation to policyholder of 2nd Insured!')}
            </h3>
          )
        } else if (secInsuredRelation != '1') {
          let secInsuredName = secInsured.name
          if (!secInsuredName || secInsuredName.trim().length === 0) {
            errors.push(
              <h3 key='secInsuredName'>
                {t('Please input name of 2nd Insured!')}
              </h3>
            )
          }
          let secInsuredBirthday = secInsured.birthday
          if (!secInsuredBirthday) {
            errors.push(
              <h3 key='secInsuredBirthday'>
                {t('Please select birthday of 2nd Insured!')}
              </h3>
            )
          }
          let secInsuredOccupation = secInsured.jobCateId
          if (!secInsuredOccupation) {
            errors.push(
              <h3 key='secInsuredOccupation'>
                {t('Please select occupation of 2nd Insured!')}
              </h3>
            )
          }
        }
      }
    } else if (['AVRIST', 'BNI', 'CHUBB', 'eBao'].includes(this.state.plan.salesCompanyCode)) {
      let phBirthday = this.state.plan.proposer.birthday
      if (!phBirthday) {
        errors.push(
          <h3 key='phBirthday'>
            {t('Please select birthday of Policyholder!')}
          </h3>
        )
      }
      let insureds = this.state.plan.insureds
      for (let i = 0; i< insureds.length; i++) {
        if (!insureds[i].birthday) {
          errors.push(
            <h3 key={`insuredBirthday_${i}`}>
              {t('Please select birthday of Insured!')}
            </h3>
          )
        }
      }
    }
    let mainCoverage = this.state.plan.mainCoverages[0]
    if (mainCoverage.limits.familyType && this.state.plan.insureds.length < 2) {
      errors.push(
        <h3 key='familyMemberCount'>
          {t('This is a family product, please at least enter two life assureds.')}
        </h3>
      )
    }
    return errors
  }

  onInvestRatesChange (rateList, premType) {
    let plan = this.state.plan
    // remove all first
    plan.mainCoverages[0].investRates = plan.mainCoverages[0].investRates.filter(
      investRate => premType != investRate.premType
    )
    // add new
    for (let rate of rateList) {
      rate.premType = premType
      plan.mainCoverages[0].investRates.push(rate)
    }
    plan.mainCoverages[0].investRates.sort((a, b) => {
      if (a.premType < b.premType) {
        return -1
      }
      if (a.premType > b.premType) {
        return 1
      }
      return 0
    })
    console.log('investRates', plan.mainCoverages[0].investRates)
    this.setState({ plan: plan })
  }

  onTopupWithdrawsChange (topupWithdrawList, premType) {
    let plan = this.state.plan
    // remove all first
    plan.mainCoverages[0].topupWithdraws = plan.mainCoverages[0].topupWithdraws.filter(
      topupWithdraw => premType != topupWithdraw.premType
    )
    // add new
    for (let topupWithdraw of topupWithdrawList) {
      topupWithdraw.premType = premType
      plan.mainCoverages[0].topupWithdraws.push(topupWithdraw)
    }
    plan.mainCoverages[0].topupWithdraws.sort((a, b) => {
      if (a.premType < b.premType) {
        return -1
      }
      if (a.premType > b.premType) {
        return 1
      }
      return 0
    })
    console.log('topupWithdraws', plan.mainCoverages[0].topupWithdraws)
    this.setState({ plan: plan })
  }

  getSingleTopup () {
    let plan = this.state.plan
    let singleTopups = plan.mainCoverages[0].topupWithdraws.filter(
      topupWithdraw => topupWithdraw.premType == '4'
    )
    let investRates = plan.mainCoverages[0].investRates.filter(
      investRate => investRate.premType == '4'
    )
    return {
      singleTopups,
      investRates,
    }
  }

  onSingleTopupChange (value) {
    let singleTopups = value.singleTopups
    let investRates = value.investRates
    this.onTopupWithdrawsChange(singleTopups, '4')
    this.onInvestRatesChange(investRates, '4')
  }

  getRegularTopup () {
    let plan = this.state.plan
    let regularTopup = plan.mainCoverages[0].topupWithdraws.find(
      topupWithdraw => topupWithdraw.premType == '3'
    )
    let investRates = plan.mainCoverages[0].investRates.filter(
      investRate => investRate.premType == '3'
    )
    return {
      regularTopup,
      investRates,
    }
  }

  onRegularTopupChange (value) {
    let plan = this.state.plan
    let regularTopup = plan.mainCoverages[0].topupWithdraws.find(
      topupWithdraw => topupWithdraw.premType == '3'
    )
    regularTopup = Object.assign(regularTopup, value.regularTopup)
    console.log('topupWithdraws', plan.mainCoverages[0].topupWithdraws)
    let investRates = value.investRates
    this.onInvestRatesChange(investRates, '3')
  }

  getPartialWithdraw () {
    let plan = this.state.plan
    let partialWithdraws = plan.mainCoverages[0].topupWithdraws.filter(
      topupWithdraw => topupWithdraw.premType == '7'
    )
    let investRates = plan.mainCoverages[0].investRates.filter(
      investRate => investRate.premType == '7'
    )
    return {
      partialWithdraws,
      investRates,
    }
  }

  onPartialWithdrawChange (value) {
    let partialWithdraws = value.partialWithdraws
    let investRates = value.investRates
    this.onTopupWithdrawsChange(partialWithdraws, '7')
  }

  hasAmountEqualOrFixedRateOfMaster(rider, mastLimitUnit) {
    for (let targetAthRate of rider.limits.targetAthRateList) {
      if ((targetAthRate.amountEqual === 'Y' && targetAthRate.mastLimitUnit === mastLimitUnit)
        || (typeof targetAthRate.minAthRate === 'number' && targetAthRate.minAthRate === targetAthRate.maxAthRate)) {
        return true
      }
    }
    return false
  }

  hasNoneYearPayment(paymentFreqs) {
    if (!paymentFreqs || paymentFreqs.length === 0) {
      return false
    }
    for (const paymentFreq of paymentFreqs) {
      if (paymentFreq !== "1" && paymentFreq !== "5") {
        return true
      }
    }
    return false
  }

  getMinSingleTopup(coverage) {
    let age = this.state.plan.insureds[0].age
    let chargePeriod = this.state.plan.mainCoverages[0].chargePeriod
    for (let premLimit of coverage.limits.prem) {
      if (typeof premLimit.minAdTopupPrem === "number" && premLimit.minAge <= age && premLimit.maxAge >= age
        && premLimit.chargePeriod === chargePeriod.periodType && premLimit.chargeYear === chargePeriod.periodValue && premLimit.chargeType === "1") {
        return premLimit.minAdTopupPrem
      }
    }
    return 0
  }

  getMaxSingleTopup(coverage) {
    let age = this.state.plan.insureds[0].age
    let chargePeriod = this.state.plan.mainCoverages[0].chargePeriod
    for (let premLimit of coverage.limits.prem) {
      if (typeof premLimit.minAdTopupPrem === "number" && premLimit.minAge <= age && premLimit.maxAge >= age
        && premLimit.chargePeriod === chargePeriod.periodType && premLimit.chargeYear === chargePeriod.periodValue && premLimit.chargeType === "1") {
        return premLimit.maxAdTopupPrem
      }
    }
    return MAX_AMOUNT
  }

  onLangCodeChange(value) {
    let plan = this.state.plan
    plan.langCode = value
    this.setState({plan})
  }

  canViewPdf() {
    return this.props.quotePdfIndi === 'Y'
  }

  showProposerAlways(planInitData) {
    return ['AVRIST', 'BNI', 'CHUBB', 'eBao'].includes(planInitData.salesInsurer.insurerCode)
  }

  addInsured() {
    if (!this.insuredModel) {
      return
    }
    let insured = deepClone(this.insuredModel)
    insured.id = this.getNewInsuredId()
    insured.relationToMainInsured = 3
    let plan = this.state.plan
    plan.insureds.push(insured)
    console.log(plan)
    this.setState({plan})
  }

  deleteInsured(index) {
    let plan = this.state.plan
    let insured = plan.insureds[index]
    let newRiders = []
    for (let rider of plan.riderCoverages) {
      if (rider.insuredIds && rider.insuredIds[0] == insured.id) {
        // removed
      } else {
        newRiders.push(rider)
      }
    }
    plan.riderCoverages = newRiders
    plan.insureds.splice(index, 1)
    this.setState({plan})
  }

  relationToMainInsuredFilter(option) {
    let mainCoverage = this.state.plan.mainCoverages[0]
    if (mainCoverage.productCode === 'SHTFAMBSC' && option.value === 10) {
      return false
    }
    return true
  }

  onRiderExtraPropertiesChange(index, property, value) {
    let plan = this.state.plan
    let rider = plan.riderCoverages[index]
    rider.extraProperties = rider.extraProperties? rider.extraProperties : {}
    rider.extraProperties[property] = value
    this.setState({plan})
  }

  getMinRegularTopup(coverage) {
    let minValueSelf = this.getMinRegularTopupOfSelf(coverage)
    let minSpecialValue = this.getMinRegularTopupSpecial(coverage)
    let minVale = minValueSelf
    minVale = minVale > minSpecialValue ? minVale : minSpecialValue
    return minVale
  }

  getMinRegularTopupOfSelf(coverage) {
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
      ? this.state.plan.insureds[1].age
      : this.state.plan.insureds[insuredIndex].age
    let chargePeriod = coverage.chargePeriod
    let mainCoverage = this.state.plan.mainCoverages[0]
    let chargeType = mainCoverage.paymentFreq
    if (chargePeriod.periodType == 1 || mainCoverage.chargePeriod.periodType == 1) { // single premium
      chargeType = 5
    }
    for (let premLimit of coverage.limits.prem) {
      if (
        (!premLimit.chargePeriod ||
        (chargePeriod.periodType === premLimit.chargePeriod && chargePeriod.periodValue === premLimit.chargeYear)) &&
        premLimit.minAge <= age &&
        premLimit.maxAge >= age &&
        // (!premLimit.chargeType || premLimit.chargeType == "0" || chargeType == premLimit.chargeType)
        (!premLimit.chargeType || premLimit.chargeType == "0" || "1" === premLimit.chargeType)
      ) {
        return premLimit.minReguTopupPrem || 0
      }
    }
    return 0
  }

  getMinRegularTopupSpecial(coverage) {
    if (['AIAIFELRPX'].includes(coverage.productCode)) {
      let premium = this.state.plan.mainCoverages[0].premium
      let minValue = parseFloat((premium * 0.25).toFixed(2))
      return minValue
    }
    return 0
  }

  getMaxRegularTopup(coverage) {
    let insuredIndex = this.getCoveragePointToInsuredIndex(coverage)
    let age = coverage.limits.pointToPH
      ? this.state.plan.proposer.age
      : coverage.limits.pointToSecInsured
      ? this.state.plan.insureds[1].age
      : this.state.plan.insureds[insuredIndex].age
    let chargePeriod = coverage.chargePeriod
    let mainCoverage = this.state.plan.mainCoverages[0]
    let chargeType = mainCoverage.paymentFreq
    if (chargePeriod.periodType == 1 || mainCoverage.chargePeriod.periodType == 1) { // single premium
      chargeType = 5
    }
    for (let premLimit of coverage.limits.prem) {
      if (
        (!premLimit.chargePeriod ||
        (chargePeriod.periodType === premLimit.chargePeriod && chargePeriod.periodValue === premLimit.chargeYear)) &&
        premLimit.minAge <= age &&
        premLimit.maxAge >= age &&
        // (!premLimit.chargeType || premLimit.chargeType == "0" || chargeType == premLimit.chargeType)
        (!premLimit.chargeType || premLimit.chargeType == "0" || "1" === premLimit.chargeType)
      ) {
        return premLimit.maxReguTopupPrem || MAX_AMOUNT
      }
    }
    return MAX_AMOUNT
  }

  render () {
    const GENDER_OPTIONS = [
      { value: 'M', label: t('Male') },
      { value: 'F', label: t('Female') },
    ]
    const YES_NO_OPTIONS = [
      { value: 'Y', label: t('Yes') },
      { value: 'N', label: t('No') },
    ]
    const SMOKING_OPTIONS = [
      { value: '1', label: t('No Smoking - Excellent') },
      { value: '2', label: t('No Smoking - Better') },
      { value: '3', label: t('No Smoking - Good') },
      { value: '4', label: t('No Smoking - Standard') },
      { value: '5', label: t('Smoking - Secondary') },
      { value: '6', label: t('Smoking - Lower') },
    ]
    const RELATION_TO_MAIN_INSURED = [
      { value: 19, label: t('Wife') },
      { value: 20, label: t('Husband') },
      { value: 21, label: t('Father') },
      { value: 22, label: t('Mother') },
      { value: 25, label: t('Brother (Slibing)') },
      { value: 26, label: t('Sister (Slibing)') },
      { value: 2, label: t('Child') },
    ]
    let {
      packageName,
      salesInsurer,
      ridersList,
      calcPremium,
      customers,
      planInitialData,
    } = this.props
    if (planInitialData.planList) {
      this.moneyId =
        planInitialData.planList.length > 0
          ? planInitialData.planList[0].moneyId
          : 1
    }
    this.moneySign = codetable.moneySign[this.moneyId] || ''
    let CompanyComponents = companies[this.state.plan.salesCompanyCode]
    let quotationCode = this.props.params.quotationCode
    let isFromSavedQuotation = !!quotationCode
    return (
      <section id='page-content' className='scrollable-block'>
        <Tip ref="tip" />
        <RiderListDialog
          open={this.state.addRiderDialogOpen}
          ridersList={ridersList}
          onRequestClose={this.handleAddRiderClose.bind(this)}
          onItemClick={index => this.addRider(index)}
        />
        <CustomerSearchDialog
          open={this.state.fromContactListOpen}
          onRequestClose={this.handleFromContactListClose.bind(this)}
          customers={customers}
          onSearchClick={text => this.searchContact(text)}
          onItemClick={customer => this.setCustomer(customer)}
        />
        <Confirm
          title={t('Are you sure to remove this rider?')}
          open={this.state.removeRiderDialogOpen}
          onRequestConfirm={this.handleRemoveRider.bind(this)}
          onRequestCancel={this.handleRemoveRiderClose.bind(this)}
        />
        <Alert
          title={this.state.dialog.title}
          open={this.state.dialog.show}
          message={this.state.dialog.message}
          onRequestClose={this.hideDialog.bind(this)}
        />
        <QuoteHeader packageName={packageName} salesInsurer={salesInsurer} />
        {this.isProposal
          ? <FormGroup
            title={t('Policyholder Info')}
            iconfont="icon-person"
            buttonTitle={t('Import Customer')}
            onButtonClick={() => this.handleFromContactListOpen(-1)}
            >
            <FormInput
              id='proposerName'
              label={t('Name: ')}
              required
              value={this.state.plan.proposer.name}
              maxLength={50}
              onChange={value => this.onPhPropertyChange('name', value)}
              />
            <FormDate
              id='proposerBirthday'
              label={t('Birthday: ')}
              required
              showAge
              readOnly={isFromSavedQuotation}
              value={this.state.plan.proposer.birthday}
              onChange={value => this.onPhBirthdayChange(value)}
              minDate={this.getMinBirthday(this.getPhAgeRange())}
              maxDate={this.getMaxBirthday(this.getPhAgeRange())}
              />
            <FormRadio
              id='proposerGender'
              label={t('Gender: ')}
              required
              readOnly={isFromSavedQuotation}
              value={this.state.plan.proposer.gender}
              options={GENDER_OPTIONS}
              onChange={value => this.onPhPropertyChange('gender', value)}
              />
            {CompanyComponents && CompanyComponents.FormJob
                ? <CompanyComponents.FormJob
                  id='proposerJob'
                  label={t('Occupation: ')}
                  required
                  value={{
                    jobCateId: this.state.plan.proposer.jobCateId,
                    jobCateCode: this.state.plan.proposer.jobCateCode,
                  }}
                  onChange={value => this.onPhJobChange(value)}
                  />
                : null}
            {this.state.plan.proposer.socialInsuranceIndi
                ? <FormRadio
                  id='phSocialInsuranceIndi'
                  label={t('Social Insure: ')}
                  required
                  value={this.state.plan.proposer.socialInsuranceIndi}
                  options={YES_NO_OPTIONS}
                  onChange={value =>
                      this.onPhPropertyChange('socialInsuranceIndi', value)}
                  />
                : null}
            {this.state.plan.proposer.smoking
                ? <FormSelect
                  id='phSmoking'
                  label={t('Smoking: ')}
                  required
                  value={this.state.plan.proposer.smoking}
                  options={
                      this.state.plan.proposer.limits.smokingType === '1'
                        ? SMOKING_OPTIONS
                        : YES_NO_OPTIONS
                    }
                  onChange={value =>
                      this.onPhPropertyChange('smoking', value)}
                  />
                : null}
          </FormGroup>
          : null}
        <FormGroup
          title={t('Main Insured Info')}
          iconfont="icon-person"
          buttonTitle={t('Import Customer')}
          onButtonClick={() => this.handleFromContactListOpen(0)}
        >
          {this.isProposal
            ? <FormSelect
              id='mainInsuredRelation'
              label={t("Is Policyholder's: ")}
              required
              value={this.state.plan.insureds[0].laPhRela}
              options={
                  CompanyComponents
                    ? CompanyComponents.InsuredProposerRelations
                    : []
                }
              blankOption={t('Please Select')}
              onChange={value => this.onMainInsuredRelationChange(value)}
              />
            : null}
          {this.isProposal && this.state.plan.insureds[0].laPhRela == 1
            ? null
            : <FormInput
              id='mainInsuredName'
              label={t('Name: ')}
              required={this.isProposal}
              value={this.state.plan.insureds[0].name}
              maxLength={50}
              onChange={value =>
                  this.onInsuredPropertyChange(0, 'name', value)}
              />}
          {this.isProposal && this.state.plan.insureds[0].laPhRela == 1
            ? null
            : this.isProposal
              ? <FormDate
                id='mainInsuredBirthday'
                label={t('Birthday: ')}
                required
                readOnly={isFromSavedQuotation}
                showAge
                value={this.state.plan.insureds[0].birthday}
                onChange={value => this.onMainInsuredBirthdayChange(value)}
                minDate={this.getMinBirthday(
                    this.state.plan.insureds[0].limits.age
                  )}
                maxDate={this.getMaxInsuredProposalBirthday(
                    this.state.plan.insureds[0].limits.age,
                    this.state.plan.insureds[0].limits.ageRange
                  )}
                />
              : <FormBirthdayOrAge
                id='mainInsuredAge'
                label={t('Birthday / Age: ')}
                required
                showAge
                disableAge={['AVRIST'].includes(this.state.plan.salesCompanyCode)}
                value={{birthday: this.state.plan.insureds[0].birthday, age: this.state.plan.insureds[0].age}}
                options={this.state.plan.insureds[0].limits.age}
                onChange={this.onMainInsuredAgeChange.bind(this)}
                minDate={this.getMinBirthday(
                    this.state.plan.insureds[0].limits.age
                  )}
                maxDate={this.getMaxInsuredProposalBirthday(
                    this.state.plan.insureds[0].limits.age,
                    this.state.plan.insureds[0].limits.ageRange
                  )}
                />}
          {this.isProposal && this.state.plan.insureds[0].laPhRela == 1
            ? null
            : <FormRadio
              id='mainInsuredGender'
              label={t('Gender: ')}
              required
              readOnly={isFromSavedQuotation}
              value={this.state.plan.insureds[0].gender}
              options={this.getInsuredGenderOptions(
                  0,
                  this.state.plan.insureds[0].age
                )}
              onChange={value => this.onMainInsuredGenderChange(value)}
              />}
          {this.isProposal && this.state.plan.insureds[0].laPhRela == 1
            ? null
            : this.isProposal && CompanyComponents && CompanyComponents.FormJob
              ? <CompanyComponents.FormJob
                id='mainInsuredJob'
                label={t('Occupation: ')}
                required
                value={{
                  jobCateId: this.state.plan.insureds[0].jobCateId,
                  jobCateCode: this.state.plan.insureds[0].jobCateCode,
                }}
                onChange={value => this.onMainInsuredJobChange(value)}
                />
              : this.state.plan.insureds[0].jobCateId
                ? <FormSelect
                  id='mainInsuredJobCateId'
                  label={t('Occupation Class: ')}
                  required
                  value={this.state.plan.insureds[0].jobCateId}
                  options={this.getJobClassOptions(
                      this.state.plan.insureds[0].limits.jobCateList
                    )}
                  onChange={value =>
                      this.onInsuredPropertyChange(0, 'jobCateId', value)}
                  />
                : null}
          {this.isProposal && this.state.plan.insureds[0].laPhRela == 1
            ? null
            : this.state.plan.insureds[0].socialInsuranceIndi
              ? <FormRadio
                id='mainInsuredSocialInsuranceIndi'
                label={t('Social Insure: ')}
                required
                value={this.state.plan.insureds[0].socialInsuranceIndi}
                options={YES_NO_OPTIONS}
                onChange={value =>
                    this.onInsuredPropertyChange(
                      0,
                      'socialInsuranceIndi',
                      value
                    )}
                />
              : null}
          {this.isProposal && this.state.plan.insureds[0].laPhRela == 1
            ? null
            : this.state.plan.insureds[0].smoking
              ? <FormSelect
                id='mainInsuredSmoking'
                label={t('Smoking: ')}
                required
                value={this.state.plan.insureds[0].smoking}
                options={
                    this.state.plan.insureds[0].limits.smokingType === '1'
                      ? SMOKING_OPTIONS
                      : YES_NO_OPTIONS
                  }
                onChange={value =>
                    this.onInsuredPropertyChange(0, 'smoking', value)}
                />
              : null}
        </FormGroup>
        <ReactCSSTransitionGroup
          transitionName={{
            enter: 'animated',
            enterActive: 'fadeInUpBig',
            leave: 'animated',
            leaveActive: 'fadeOutDownBig',
          }}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={500}
        >
          {!this.state.plan.mainCoverages[0].limits.familyType && this.state.plan.insureds.length > 1
            ? <FormGroup
              title={t('2nd Insured Info')}
              iconfont="icon-person"
              buttonTitle={t('Import Customer')}
              onButtonClick={() => this.handleFromContactListOpen(1)}
              >
              {this.isProposal
                  ? <FormSelect
                    id='secInsuredRelation'
                    label={t("Is Policyholder's: ")}
                    required
                    value={this.state.plan.insureds[1].laPhRela}
                    options={
                        CompanyComponents
                          ? CompanyComponents.InsuredProposerRelations
                          : []
                      }
                    blankOption={t('Please Select')}
                    onChange={value => this.onSecInsuredRelationChange(value)}
                    />
                  : null}
              {this.isProposal && this.state.plan.insureds[1].laPhRela == 1
                  ? null
                  : <FormInput
                    id='secInsuredName'
                    label={t('Name: ')}
                    required={this.isProposal}
                    value={this.state.plan.insureds[1].name}
                    maxLength={50}
                    onChange={value =>
                        this.onInsuredPropertyChange(1, 'name', value)}
                    />}
              {this.isProposal && this.state.plan.insureds[1].laPhRela == 1
                  ? null
                  : this.isProposal
                    ? <FormDate
                      id='secInsuredBirthday'
                      label={t('Birthday: ')}
                      required
                      showAge
                      value={this.state.plan.insureds[1].birthday}
                      onChange={value =>
                          this.onSecInsuredBirthdayChange(value)}
                      minDate={this.getMinBirthday(
                          this.state.plan.insureds[1].limits.age
                        )}
                      maxDate={this.getMaxInsuredProposalBirthday(
                          this.state.plan.insureds[1].limits.age,
                          this.state.plan.insureds[1].limits.ageRange
                        )}
                      />
                    : <FormBirthdayOrAge
                      id='secInsuredAge'
                      label={t('Birthday / Age: ')}
                      required
                      showAge
                      disableAge={['AVRIST'].includes(this.state.plan.salesCompanyCode)}
                      value={{birthday: this.state.plan.insureds[1].birthday, age: this.state.plan.insureds[1].age}}
                      options={this.state.plan.insureds[1].limits.age}
                      onChange={this.onSecInsuredAgeChange.bind(this)}
                      minDate={this.getMinBirthday(
                          this.state.plan.insureds[1].limits.age
                        )}
                      maxDate={this.getMaxInsuredProposalBirthday(
                          this.state.plan.insureds[1].limits.age,
                          this.state.plan.insureds[1].limits.ageRange
                        )}
                      />}
              {this.isProposal && this.state.plan.insureds[1].laPhRela == 1
                  ? null
                  : <FormRadio
                    id='secInsuredGender'
                    label={t('Gender: ')}
                    required
                    readOnly={isFromSavedQuotation}
                    value={this.state.plan.insureds[1].gender}
                    options={this.getInsuredGenderOptions(
                        1,
                        this.state.plan.insureds[1].age
                      )}
                    onChange={value => this.onSecInsuredGenderChange(value)}
                    />}
              {this.isProposal && this.state.plan.insureds[1].laPhRela == 1
                  ? null
                  : this.isProposal && CompanyComponents
                    ? <CompanyComponents.FormJob
                      id='secInsuredJob'
                      label={t('Occupation: ')}
                      required
                      value={{
                        jobCateId: this.state.plan.insureds[1].jobCateId,
                        jobCateCode: this.state.plan.insureds[1].jobCateCode,
                      }}
                      onChange={value => this.onSecInsuredJobChange(value)}
                      />
                    : this.state.plan.insureds[1].jobCateId
                      ? <FormSelect
                        id='secInsuredJobCateId'
                        label={t('Occupation Class: ')}
                        required
                        value={this.state.plan.insureds[1].jobCateId}
                        options={this.getJobClassOptions(
                            this.state.plan.insureds[1].limits.jobCateList
                          )}
                        onChange={value =>
                            this.onInsuredPropertyChange(1, 'jobCateId', value)}
                        />
                      : null}
              {this.isProposal && this.state.plan.insureds[1].laPhRela == 1
                  ? null
                  : this.state.plan.insureds[1].socialInsuranceIndi
                    ? <FormRadio
                      id='secInsuredSocialInsuranceIndi'
                      label={t('Social Insure: ')}
                      required
                      value={this.state.plan.insureds[1].socialInsuranceIndi}
                      options={YES_NO_OPTIONS}
                      onChange={value =>
                          this.onInsuredPropertyChange(
                            1,
                            'socialInsuranceIndi',
                            value
                          )}
                      />
                    : null}
              {this.isProposal && this.state.plan.insureds[1].laPhRela == 1
                  ? null
                  : this.state.plan.insureds[1].smoking
                    ? <FormSelect
                      id='secInsuredSmoking'
                      label={t('Smoking: ')}
                      required
                      value={this.state.plan.insureds[1].smoking}
                      options={
                          this.state.plan.insureds[1].limits.smokingType === '1'
                            ? SMOKING_OPTIONS
                            : YES_NO_OPTIONS
                        }
                      onChange={value =>
                          this.onInsuredPropertyChange(1, 'smoking', value)}
                      />
                    : null}
            </FormGroup>
            : null}
          {this.state.plan.mainCoverages[0].limits.familyType?
            this.state.plan.insureds.map((insured, index)=> {
              if (index === 0) {
                return null
              } else {
                return (
                  <FormGroup
                    key={`insured_${index}`}
                    title={t('Life Assured') + (index + 1)}
                    iconfont="icon-person"
                    buttonTitle={t('Delete')}
                    onButtonClick={() => this.deleteInsured(index)}
                  >
                    <FormSelect
                      id={`relationToMainInsured_${index}`}
                      label={t("Relation to Main Insured: ")}
                      required
                      value={this.state.plan.insureds[index].relationToMainInsured}
                      options={RELATION_TO_MAIN_INSURED.filter(option=>this.relationToMainInsuredFilter(option))}
                      onChange={value => this.onInsuredPropertyChange(index, 'relationToMainInsured', value, 'int')}
                    />
                    <FormInput
                      id={`insuredName_${index}`}
                      label={t('Name: ')}
                      required={this.isProposal}
                      value={this.state.plan.insureds[index].name}
                      maxLength={50}
                      onChange={value =>
                        this.onInsuredPropertyChange(index, 'name', value)}
                    />
                    {this.isProposal
                      ? <FormDate
                      id={`insuredBirthday_${index}`}
                      label={t('Birthday: ')}
                      required
                      readOnly={isFromSavedQuotation}
                      showAge
                      value={this.state.plan.insureds[index].birthday}
                      onChange={value =>
                          this.onInsuredPropertyChange(index, 'birthday', value)}
                      minDate={this.getMinBirthday(
                          this.state.plan.insureds[index].limits.age
                        )}
                      maxDate={this.getMaxInsuredProposalBirthday(
                          this.state.plan.insureds[index].limits.age,
                          this.state.plan.insureds[index].limits.ageRange
                        )}
                    />
                      : <FormBirthdayOrAge
                      id={`insuredAge_${index}`}
                      label={t('Birthday / Age: ')}
                      required
                      showAge
                      disableAge={['AVRIST'].includes(this.state.plan.salesCompanyCode)}
                      value={{birthday: this.state.plan.insureds[index].birthday, age: this.state.plan.insureds[index].age}}
                      options={this.state.plan.insureds[index].limits.age}
                      onChange={value => this.onInsuredAgeChange(index, value)}
                      minDate={this.getMinBirthday(
                          this.state.plan.insureds[index].limits.age
                        )}
                      maxDate={this.getMaxInsuredProposalBirthday(
                          this.state.plan.insureds[index].limits.age,
                          this.state.plan.insureds[index].limits.ageRange
                        )}
                    />}
                    <FormRadio
                      id={`insuredGender_${index}`}
                      label={t('Gender: ')}
                      required
                      readOnly={isFromSavedQuotation}
                      value={this.state.plan.insureds[index].gender}
                      options={this.getInsuredGenderOptions(index,this.state.plan.insureds[index].age)}
                      onChange={value => this.onInsuredPropertyChange(index, 'gender', value)}
                    />
                    {this.isProposal && CompanyComponents && CompanyComponents.FormJob
                      ? <CompanyComponents.FormJob
                      id={`insuredJob_${index}`}
                      label={t('Occupation: ')}
                      required
                      value={{
                        jobCateId: this.state.plan.insureds[index].jobCateId,
                        jobCateCode: this.state.plan.insureds[index].jobCateCode,
                      }}
                      onChange={value => this.onInsuredJobChange(index, value)}
                    />
                      : this.state.plan.insureds[index].jobCateId
                      ? <FormSelect
                      id={`insuredJob_${index}`}
                      label={t('Occupation Class: ')}
                      required
                      value={this.state.plan.insureds[index].jobCateId}
                      options={this.getJobClassOptions(
                      this.state.plan.insureds[index].limits.jobCateList
                    )}
                      onChange={value =>
                      this.onInsuredPropertyChange(index, 'jobCateId', value)}
                    />
                      : null}
                    {this.state.plan.insureds[index].socialInsuranceIndi
                      ? <FormRadio
                      id={`insuredSocialInsuranceIndi_${index}`}
                      label={t('Social Insure: ')}
                      required
                      value={this.state.plan.insureds[index].socialInsuranceIndi}
                      options={YES_NO_OPTIONS}
                      onChange={value => this.onInsuredPropertyChange(
                        index,
                        'socialInsuranceIndi',
                        value
                      )}
                    />
                      : null}
                    {this.state.plan.insureds[index].smoking
                      ? <FormSelect
                      id={`insuredSmoking_${index}`}
                      label={t('Smoking: ')}
                      required
                      value={this.state.plan.insureds[index].smoking}
                      options={
                        this.state.plan.insureds[index].limits.smokingType === '1'
                          ? SMOKING_OPTIONS
                          : YES_NO_OPTIONS
                      }
                      onChange={value =>
                        this.onInsuredPropertyChange(index, 'smoking', value)}
                      />
                      : null}
                  </FormGroup>
                )
              }
            })
            : null
          }
        </ReactCSSTransitionGroup>
        {this.state.plan.mainCoverages[0].limits.familyType ?
          <div className='add-rider' onClick={this.addInsured.bind(this)}>
            <i className="iconfont icon-add"/>
          <span>
            {t('Add Insured')}
          </span>
          </div>
          : null
        }
        <ReactCSSTransitionGroup
          transitionName={{
            enter: 'animated',
            enterActive: 'fadeInUpBig',
            leave: 'animated',
            leaveActive: 'fadeOutDownBig',
          }}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={500}
        >
          {!this.isProposal && typeof this.state.plan.proposer.age === 'number'
            ? <FormGroup
            title={t('Policyholder Info')}
            iconfont="icon-person"
            buttonTitle={t('Same As Insured')}
            onButtonClick={() => this.handleSameAsInsured()}
          >
            <FormInput
              id='phName'
              label={t('Name: ')}
              value={this.state.plan.proposer.name}
              onChange={value=>this.onPhPropertyChange('name',value)}
            />
            <FormBirthdayOrAge
              showAge
              disableAge={['AVRIST'].includes(this.state.plan.salesCompanyCode)}
              id='phAge'
              label={t('Birthday / Age: ')}
              required
              value={{birthday: this.state.plan.proposer.birthday, age: this.state.plan.proposer.age}}
              options={this.getPhAgeRange()}
              onChange={this.onPhAgeChange.bind(this)}
              minDate={this.getMinBirthday(this.getPhAgeRange())}
              maxDate={this.getMaxBirthday(this.getPhAgeRange())}
            />
            <FormRadio
              id='phGender'
              label={t('Gender: ')}
              required
              value={this.state.plan.proposer.gender}
              options={GENDER_OPTIONS}
              onChange={value => this.onPhPropertyChange('gender', value)}
            />
            {this.state.plan.proposer.jobCateId
              ? <FormSelect
              id='phJobCateId'
              label={t('Occupation Class: ')}
              required
              value={this.state.plan.proposer.jobCateId}
              options={this.getJobClassOptions(
                        this.state.plan.proposer.limits.jobCateList
                      )}
              onChange={value =>
                        this.onPhPropertyChange('jobCateId', value)}
            />
              : null}
            {this.state.plan.proposer.socialInsuranceIndi
              ? <FormRadio
              id='phSocialInsuranceIndi'
              label={t('Social Insure: ')}
              required
              value={this.state.plan.proposer.socialInsuranceIndi}
              options={YES_NO_OPTIONS}
              onChange={value =>
                        this.onPhPropertyChange('socialInsuranceIndi', value)}
            />
              : null}
            {this.state.plan.proposer.smoking
              ? <FormSelect
              id='phSmoking'
              label={t('Smoking: ')}
              required
              value={this.state.plan.proposer.smoking}
              options={
                        this.state.plan.proposer.limits.smokingType === '1'
                          ? SMOKING_OPTIONS
                          : YES_NO_OPTIONS
                      }
              onChange={value =>
                        this.onPhPropertyChange('smoking', value)}
            />
              : null}
          </FormGroup>
            : null}
        </ReactCSSTransitionGroup>
        <FormGroup title={t('Main Benefit')} iconfont="icon-ic_tabbar_main_nor">
          {this.hasNoneYearPayment(this.state.plan.mainCoverages[0].limits.paymentFreqs)?
            <FormSelect
              id='mainPaymentFreq'
              label={t('Payment Frequency: ')}
              required
              value={this.state.plan.mainCoverages[0].paymentFreq}
              options={this.state.plan.mainCoverages[0].limits.paymentFreqs.filter(paymentFreq=>paymentFreq!=="5").map(paymentFreq=> {
                return {label: t(codetable.paymentFreq[paymentFreq]), value: paymentFreq}
              })}
              onChange={value=>this.onMainCoveragePropertyChange('paymentFreq', value)}
            />
            : null
          }
          {this.state.plan.mainCoverages[0].chargePeriod
            ? <FormSelect
              id='mainChargePeriod'
              label={t('Charge Period: ')}
              required
              readOnly={isFromSavedQuotation}
              value={
                  this.state.plan.mainCoverages[0].chargePeriod.periodType +
                  '-' +
                  this.state.plan.mainCoverages[0].chargePeriod.periodValue
                }
              options={this.state.plan.mainCoverages[0].limits.chargePeriod
                  .filter(chargePeriod =>
                    this.chargePeriodFilter(
                      chargePeriod,
                      this.state.plan.mainCoverages[0]
                    )
                  )
                  .map(chargePeriod => {
                    return {
                      value:
                        chargePeriod.periodType +
                        '-' +
                        chargePeriod.periodValue,
                      label: t(
                        codetable.chargePeriod[chargePeriod.periodType],
                        chargePeriod.periodValue
                      ),
                    }
                  })}
              onChange={this.onMainCoverageChargePeriodChange.bind(this)}
              />
            : null}
          {this.state.plan.mainCoverages[0].coveragePeriod
            ? <FormSelect
              id='mainCoveragePeriod'
              label={t('Coverage Period: ')}
              required
              readOnly={isFromSavedQuotation}
              value={
                  this.state.plan.mainCoverages[0].coveragePeriod.periodType +
                  '-' +
                  this.state.plan.mainCoverages[0].coveragePeriod.periodValue
                }
              options={this.state.plan.mainCoverages[0].limits.coveragePeriod
                  .filter(coveragePeriod =>
                    this.coveragePeriodFilter(
                      coveragePeriod,
                      this.state.plan.mainCoverages[0]
                    )
                  )
                  .map(coveragePeriod => {
                    return {
                      value:
                        coveragePeriod.periodType +
                        '-' +
                        coveragePeriod.periodValue,
                      label: t(
                        codetable.coveragePeriod[coveragePeriod.periodType],
                        coveragePeriod.periodValue
                      ),
                    }
                  })}
              onChange={this.onMainCoverageCoveragePeriodChange.bind(this)}
              />
            : null}
          {this.state.plan.mainCoverages[0].limits.isAnnuityProduct
            ? <FormSelect
              id='mainPayPeriod'
              label={t('Annuity Pay Plan: ')}
              required
              readOnly={isFromSavedQuotation}
              hidden={this.state.plan.mainCoverages[0].limits.payPeriod.length===1 && this.state.plan.mainCoverages[0].limits.payPeriod[0].periodType===0}
              value={
                  this.state.plan.mainCoverages[0].payPeriod.periodType +
                  '-' +
                  this.state.plan.mainCoverages[0].payPeriod.periodValue
                }
              options={this.state.plan.mainCoverages[0].limits.payPeriod
                  .filter(payPeriod =>
                    this.payPeriodFilter(
                      payPeriod,
                      this.state.plan.mainCoverages[0]
                    )
                  )
                  .map(payPeriod => {
                    return {
                      value: payPeriod.periodType + '-' + payPeriod.periodValue,
                      label: t(
                        codetable.payPeriod[payPeriod.periodType],
                        payPeriod.periodValue
                      ),
                    }
                  })}
              onChange={this.onMainCoveragePayPeriodChange.bind(this)}
              />
            : null}
          {this.state.plan.mainCoverages[0].limits.isAnnuityProduct
            ? <FormSelect
            id='mainEndPeriod'
            label={t('Annuity End: ')}
            required
            readOnly={isFromSavedQuotation}
            hidden={this.state.plan.mainCoverages[0].limits.endPeriod.length<=1}
            value={
                  this.state.plan.mainCoverages[0].endPeriod.periodType +
                  '-' +
                  this.state.plan.mainCoverages[0].endPeriod.periodValue
                }
            options={this.state.plan.mainCoverages[0].limits.endPeriod
                  .filter(endPeriod =>
                    this.endPeriodFilter(
                      endPeriod,
                      this.state.plan.mainCoverages[0]
                    )
                  )
                  .map(endPeriod => {
                    return {
                      value: endPeriod.periodType + '-' + endPeriod.periodValue,
                      label: t(
                        codetable.endPeriod[endPeriod.periodType],
                        endPeriod.periodValue
                      ),
                    }
                  })}
            onChange={this.onMainCoverageEndPeriodChange.bind(this)}
          />
            : null}
          {this.state.plan.mainCoverages[0].limits.isAnnuityProduct
            ? <FormSelect
            id='mainPayEnsure'
            label={t('Ensure Years: ')}
            required
            readOnly={isFromSavedQuotation}
            hidden={this.state.plan.mainCoverages[0].limits.payEnsure.length<=1}
            value={this.state.plan.mainCoverages[0].extraProperties? this.state.plan.mainCoverages[0].extraProperties['pay_ensure']: null}
            options={this.state.plan.mainCoverages[0].limits.payEnsure
                  .filter(payEnsure =>
                    this.payEnsureFilter(
                      payEnsure,
                      this.state.plan.mainCoverages[0]
                    )
                  )
                  .map(payEnsure => payEnsure.payEnsure)}
            onChange={this.onMainCoveragePayEnsureChange.bind(this)}
          />
            : null}
          {this.state.plan.mainCoverages[0].benefitlevel
            ? <FormSelect
              id='mainBenefitlevel'
              label={t('Benefit Level: ')}
              required
              readOnly={isFromSavedQuotation}
              value={this.state.plan.mainCoverages[0].benefitlevel}
              options={this.state.plan.mainCoverages[0].limits.benefitlevel.map(
                  benefitlevel => {
                    return {
                      value: benefitlevel.benefitLevel,
                      label: benefitlevel.levelDesc,
                    }
                  }
                )}
              onChange={value =>
                  this.onMainCoveragePropertyChange('benefitlevel', value)}
              />
            : null}
          {['1', '3'].includes(""+this.state.plan.mainCoverages[0].unitFlag)
            ? <FormInput
              id='mainUnit'
              label={t('Unit: ')}
              type='number'
              pattern='[0-9]*'
              required
              readOnly={isFromSavedQuotation}
              value={this.state.plan.mainCoverages[0].unit}
              min={this.getMinSaOrUnitByAge(this.state.plan.mainCoverages[0])}
              max={this.getMaxSaOrUnitByAge(this.state.plan.mainCoverages[0])}
              onChange={value =>
                  this.onMainCoveragePropertyChange('unit', value, 'int')}
              />
            : null}
          {['0', '6'].includes(""+this.state.plan.mainCoverages[0].unitFlag) &&
          !this.state.plan.mainCoverages[0].limits.isWaiver
            ? <FormInput
              id='mainSa'
              label={t('Sum Assured: ')}
              type='number'
              formatted
              required
              readOnly={isFromSavedQuotation}
              pattern='[0-9]*'
              value={this.state.plan.mainCoverages[0].sa}
              min={this.getMinSaOrUnitByAge(this.state.plan.mainCoverages[0])}
              max={this.getMaxSaOrUnitByAge(this.state.plan.mainCoverages[0])}
              onChange={value =>
                  this.onMainCoveragePropertyChange('sa', value, 'float')}
              />
            : null}
          {['0', '7', '10'].includes(""+this.state.plan.mainCoverages[0].unitFlag)
            ? <FormInput
              id='mainPremium'
              label={t('Premium: ')}
              type='number'
              formatted
              required
              readOnly={isFromSavedQuotation}
              pattern='[0-9]*'
              value={this.state.plan.mainCoverages[0].premium}
              min={this.getMinPremium(this.state.plan.mainCoverages[0])}
              max={this.getMaxPremium(this.state.plan.mainCoverages[0])}
              onChange={value =>
                  this.onMainCoveragePropertyChange('premium', value, 'float')}
              />
            : null}
          {this.state.plan.mainCoverages[0].limits.isIlpProduct
            ? <FundAllocation
              value={this.state.plan.mainCoverages[0].investRates.filter(
                  investRate => investRate.premType == '2'
                )}
              readOnly={isFromSavedQuotation}
              funds={this.state.plan.mainCoverages[0].limits.funds}
              onChange={rateList => this.onInvestRatesChange(rateList, '2')}
              productCode={this.state.plan.mainCoverages[0].productCode}
              />
            : null}
        </FormGroup>
        {this.state.plan.mainCoverages[0].limits.regularTopupPermit
          ? <RegularTopup
            value={this.getRegularTopup()}
            onChange={value => this.onRegularTopupChange(value)}
            funds={this.state.plan.mainCoverages[0].limits.funds}
            maxChargeYear={this.getMaxChargeYear(
                this.state.plan.mainCoverages[0]
              )}
            productCode={this.state.plan.mainCoverages[0].productCode}
            minAmount={this.getMinRegularTopup(this.state.plan.mainCoverages[0])}
            maxAmount={this.getMaxRegularTopup(this.state.plan.mainCoverages[0])}
            />
          : null}
        {this.state.plan.mainCoverages[0].limits.singleTopupPermit
          ? <SingleTopup
          value={this.getSingleTopup()}
          readOnly={isFromSavedQuotation}
          onChange={value => this.onSingleTopupChange(value)}
          funds={this.state.plan.mainCoverages[0].limits.funds}
          productCode={this.state.plan.mainCoverages[0].productCode}
          minAmount={this.getMinSingleTopup(this.state.plan.mainCoverages[0])}
          maxAmount={this.getMaxSingleTopup(this.state.plan.mainCoverages[0])}
          maxCoverageYear={this.getMaxCoverageYear(
                this.state.plan.mainCoverages[0]
              )}
        />
          : null}
        {!this.isProposal && this.state.plan.mainCoverages[0].limits.partialWithdrawPermit
          ? <PartialWithdraw
            value={this.getPartialWithdraw()}
            onChange={value => this.onPartialWithdrawChange(value)}
            productCode={this.state.plan.mainCoverages[0].productCode}
            maxCoverageYear={this.getMaxCoverageYear(
                this.state.plan.mainCoverages[0]
              )}
            minAmount={this.state.plan.mainCoverages[0].limits.regPartWithdrMinAmount}
            maxAmount={this.state.plan.mainCoverages[0].limits.regPartWithdrMaxAmount}
            />
          : null}
        <FormGroup title={t('Riders')} iconfont="icon-additional-copy">
          <ReactCSSTransitionGroup
            transitionName={{
              enter: 'animated',
              enterActive: 'zoomIn',
              leave: 'animated',
              leaveActive: 'zoomOut',
            }}
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={500}
          >
            {this.state.plan.riderCoverages.map((rider, index) => {
              let formInputs = []
              if (rider.limits.attachCompulsory || isFromSavedQuotation) {
                formInputs.push(
                  <li key={'rider-name_' + index} className='group-name'>
                    <label>
                      {rider.productName}
                    </label>
                  </li>
                )
              } else {
                formInputs.push(
                  <li key={'rider-name_' + index} className='group-name'>
                    <label>
                      {rider.productName}
                    </label>
                    <i
                      className="iconfont icon-delete middle-icon"
                      onClick={() => this.handleRemoveRiderOpen(index)}
                    />
                  </li>
                )
              }
              if (this.state.plan.mainCoverages[0].limits.familyType && !rider.limits.isWaiver) {
                let index = this.getCoveragePointToInsuredIndex(rider)
                let insured = this.state.plan.insureds[index]
                formInputs.push(
                  <FormText label={t('Life Assured ' + (index + 1))}>
                    {insured? insured.name : null}
                  </FormText>
                )
              }
              if (rider.extraProperties && rider.extraProperties['Indo_TwoYears_Flag']) {
                formInputs.push(
                  <FormSwitch id={`ExistingPolicy2YearsPlus_${index}`} label="Existing Policy 2 Years +"
                              value={rider.extraProperties['Indo_TwoYears_Flag']==='1'} readOnly={isFromSavedQuotation}
                              onChange={value=>this.onRiderExtraPropertiesChange(index, 'Indo_TwoYears_Flag', value? '1': '0')}
                  />
                )
              }
              if (!rider.limits.isWaiver && rider.chargePeriod) {
                formInputs.push(
                  <FormSelect
                    key={'riderChargePeriod_' + index}
                    id={'riderChargePeriod' + index}
                    label={t('Charge Period: ')}
                    required
                    readOnly={isFromSavedQuotation}
                    value={
                      rider.chargePeriod.periodType +
                      '-' +
                      rider.chargePeriod.periodValue
                    }
                    options={rider.limits.chargePeriod
                      .filter(chargePeriod =>
                        this.chargePeriodFilter(chargePeriod, rider)
                      )
                      .filter(chargePeriod =>
                        this.chargePeriodFilterByMainCoverage(
                          chargePeriod,
                          rider
                        )
                      )
                      .map(chargePeriod => {
                        return {
                          value:
                            chargePeriod.periodType +
                            '-' +
                            chargePeriod.periodValue,
                          label: t(
                            codetable.chargePeriod[chargePeriod.periodType],
                            chargePeriod.periodValue
                          ),
                        }
                      })}
                    onChange={value =>
                      this.onRiderCoverageChargePeriodChange(index, value)}
                  />
                )
              }
              if (!rider.limits.isWaiver && rider.coveragePeriod) {
                formInputs.push(
                  <FormSelect
                    key={'riderCoveragePeriod_' + index}
                    id={'riderCoveragePeriod' + index}
                    label={t('Coverage Period: ')}
                    required
                    readOnly={isFromSavedQuotation}
                    value={
                      rider.coveragePeriod.periodType +
                      '-' +
                      rider.coveragePeriod.periodValue
                    }
                    options={rider.limits.coveragePeriod
                      .filter(coveragePeriod =>
                        this.coveragePeriodFilter(coveragePeriod, rider)
                      )
                      .filter(coveragePeriod =>
                        this.coveragePeriodFilterByMainCoverage(
                          coveragePeriod,
                          rider
                        )
                      )
                      .map(coveragePeriod => {
                        return {
                          value:
                            coveragePeriod.periodType +
                            '-' +
                            coveragePeriod.periodValue,
                          label: t(
                            codetable.coveragePeriod[coveragePeriod.periodType],
                            coveragePeriod.periodValue
                          ),
                        }
                      })}
                    onChange={value =>
                      this.onRiderCoverageCoveragePeriodChange(index, value)}
                  />
                )
              }
              if (rider.limits.isAnnuityProduct) {
                formInputs.push(
                  <FormSelect
                    key={'riderPayPeriod_' + index}
                    id={'riderPayPeriod' + index}
                    label={t('Annuity Pay Plan: ')}
                    required
                    readOnly={isFromSavedQuotation}
                    hidden={rider.limits.payPeriod.length===1 && [0, 3].includes(rider.limits.payPeriod[0].periodType)}
                    value={
                      rider.payPeriod.periodType +
                      '-' +
                      rider.payPeriod.periodValue
                    }
                    options={rider.limits.payPeriod
                      .filter(payPeriod =>
                        this.payPeriodFilter(payPeriod, rider)
                      )
                      .filter(payPeriod =>
                        this.payPeriodFilterByMainCoverage(payPeriod, rider)
                      )
                      .map(payPeriod => {
                        return {
                          value:
                            payPeriod.periodType + '-' + payPeriod.periodValue,
                          label: t(
                            codetable.payPeriod[payPeriod.periodType],
                            payPeriod.periodValue
                          ),
                        }
                      })}
                    onChange={value =>
                      this.onRiderCoveragePayPeriodChange(index, value)}
                  />
                )
                formInputs.push(
                  <FormSelect
                    key={'riderEndPeriod_' + index}
                    id={'riderEndPeriod' + index}
                    label={t('Annuity End: ')}
                    required
                    readOnly={isFromSavedQuotation}
                    hidden={rider.limits.endPeriod.length<=1}
                    value={
                      rider.endPeriod.periodType +
                      '-' +
                      rider.endPeriod.periodValue
                    }
                    options={rider.limits.endPeriod
                      .filter(endPeriod =>
                        this.endPeriodFilter(endPeriod, rider)
                      )
                      .map(endPeriod => {
                        return {
                          value:
                            endPeriod.periodType + '-' + endPeriod.periodValue,
                          label: t(
                            codetable.endPeriod[endPeriod.periodType],
                            endPeriod.periodValue
                          ),
                        }
                      })}
                    onChange={value =>
                      this.onRiderCoverageEndPeriodChange(index, value)}
                  />
                )
                formInputs.push(
                  <FormSelect
                    key={'riderPayEnsure_' + index}
                    id={'riderPayEnsure' + index}
                    label={t('Ensure Years: ')}
                    required
                    readOnly={isFromSavedQuotation}
                    hidden={rider.limits.payEnsure.length<=1}
                    value={rider.extraProperties? rider.extraProperties['pay_ensure'] : null}
                    options={rider.limits.payEnsure
                      .filter(payEnsure =>
                        this.payEnsureFilter(payEnsure, rider)
                      )
                      .map(payEnsure => payEnsure.payEnsure)}
                    onChange={value =>
                      this.onRiderCoveragePayEnsureChange(index, value)}
                  />
                )
              }
              if (rider.benefitlevel) {
                formInputs.push(
                  <FormSelect
                    key={'riderBenefitlevel_' + index}
                    id={'riderBenefitlevel' + index}
                    label={t('Benefit Level: ')}
                    required
                    value={rider.benefitlevel}
                    options={rider.limits.benefitlevel.map(benefitlevel => {
                      return {
                        value: benefitlevel.benefitLevel,
                        label: benefitlevel.levelDesc,
                      }
                    })}
                    readOnly={isFromSavedQuotation || this.hasAmountEqualOrFixedRateOfMaster(rider, "4")}
                    onChange={value =>
                      this.onRiderCoveragePropertyChange(
                        index,
                        'benefitlevel',
                        value
                      )}
                  />
                )
              }
              if (['1', '3'].includes(""+rider.unitFlag)) {
                formInputs.push(
                  <FormInput
                    key={'riderUnit_' + index}
                    id={'riderUnit' + index}
                    label={t('Unit: ')}
                    type='number'
                    pattern='[0-9]*'
                    required
                    value={rider.unit}
                    min={this.getMinSaOrUnitByAge(rider)}
                    max={this.getMaxSaOrUnitByAge(rider)}
                    readOnly={isFromSavedQuotation || this.hasAmountEqualOrFixedRateOfMaster(rider, "2")}
                    onChange={value =>
                      this.onRiderCoveragePropertyChange(
                        index,
                        'unit',
                        value,
                        'int'
                      )}
                  />
                )
              }
              if (
                ['0', '6'].includes(""+rider.unitFlag) &&
                !rider.limits.isWaiver
              ) {
                formInputs.push(
                  <FormInput
                    key={'riderSa_' + index}
                    id={'riderSa' + index}
                    label={t('Sum Assured: ')}
                    type='number'
                    formatted
                    pattern='[0-9]*'
                    required
                    value={rider.sa}
                    min={this.getMinSaOrUnitByAge(rider)}
                    max={this.getMaxSaOrUnitByAge(rider)}
                    readOnly={isFromSavedQuotation || this.hasAmountEqualOrFixedRateOfMaster(rider, "1")}
                    onChange={value =>
                      this.onRiderCoveragePropertyChange(
                        index,
                        'sa',
                        value,
                        'float'
                      )}
                  />
                )
              }
              if (['0', '7', '10'].includes(""+rider.unitFlag)) {
                formInputs.push(
                  <FormInput
                    key={'riderPremium_' + index}
                    id={'riderPremium' + index}
                    label={t('Premium: ')}
                    type='number'
                    formatted
                    pattern='[0-9]*'
                    required
                    value={rider.premium}
                    min={this.getMinPremium(rider)}
                    max={this.getMaxPremium(rider)}
                    readOnly={isFromSavedQuotation || this.hasAmountEqualOrFixedRateOfMaster(rider, "3")}
                    onChange={value =>
                      this.onRiderCoveragePropertyChange(
                        index,
                        'premium',
                        value,
                        'float'
                      )}
                  />
                )
              }
              return formInputs
            })}
          </ReactCSSTransitionGroup>
        </FormGroup>
        {!isFromSavedQuotation &&
        <div className='add-rider' onClick={this.openAddRiderDialog.bind(this)}>
          <i className="iconfont icon-add" />
          <span>
            {t('Add Rider')}
          </span>
        </div>
        }
        <div className='quote-form-group'>
          <div className='group-header'>
            <i
              className='header-i iconfont icon-money2'
            />
            <span className='header-title'>
              {t('First Year Premium')}
            </span>
            {calcPremium
              ? <span id='total-first-year-premium'>
                {this.moneySign}
                {formatNumber(calcPremium.annualPrem)}
              </span>
              : null}
            <button
              className='header-button'
              onClick={() => this.calcPremium()}
            >
              {t('Calculate')}
            </button>
          </div>
          <div className='first-year-list'>
            <FirstYearPremiumTable
              calcPremium={calcPremium}
              moneySign={this.moneySign}
              hidden={!this.state.calcPremiumTableOpen}
            />
            <div
              className={
                'icon-down' +
                (calcPremium && this.state.calcPremiumTableOpen
                  ? ' rotate-180'
                  : '')
              }
              onClick={() =>
                this.setCalcPremiumTableOpen(!this.state.calcPremiumTableOpen)}
            />
          </div>
        </div>
        {this.isProposal
          ? null
          : <div className='quote-note'>
            <div className='note-header'>
              <input
                className='checkbox'
                id='showAdvice'
                type='checkbox'
                checked={this.state.plan.showAdvice === 'Y'}
                onChange={e => this.onShowAdviceChange(e.target.checked)}
                />
              <label htmlFor='showAdvice'>
                {t('Notes')}
              </label>
            </div>
            <div className='note-content'>
              <textarea
                value={this.state.plan.advice}
                disabled={this.state.plan.showAdvice === 'N'}
                id='comment'
                maxLength='200'
                onChange={e => this.onAdviceChange(e.target.value)}
                />
            </div>
          </div>}
        {this.isProposal || typeof this.state.plan.proposer.age === 'number'
          ? null
          : ['en'].includes(lang()) ?
          <div className='quote-send'>
            <span className='send-span'>
              {t('Send To')}
            </span>
            <select
              name='send-gender'
              value={this.state.plan.proposer.gender}
              id='send-gender'
              className='send-gender'
              onChange={e =>
                  this.onPhPropertyChange('gender', e.target.value)}
            >
              <option value='M'>
                {t('Mr')}
              </option>
              <option value='F'>
                {t('Ms')}
              </option>
            </select>
            <input
              type='text'
              value={this.state.plan.proposer.name}
              className='send-input'
              maxLength='50'
              onChange={e => this.onPhPropertyChange('name', e.target.value)}
              />
          </div>
          :
          <div className='quote-send'>
            <span className='send-span'>
              {t('Send To')}
            </span>
            <input
              type='text'
              value={this.state.plan.proposer.name}
              className='send-input'
              maxLength='50'
              onChange={e => this.onPhPropertyChange('name', e.target.value)}
            />
            <select
              name='send-gender'
              value={this.state.plan.proposer.gender}
              id='send-gender'
              className='send-gender'
              onChange={e =>
                  this.onPhPropertyChange('gender', e.target.value)}
            >
              <option value='M'>
                {t('Mr')}
              </option>
              <option value='F'>
                {t('Ms')}
              </option>
            </select>
          </div>
        }
        {['AVRIST'].includes(this.state.plan.salesCompanyCode) && this.props.quotePdfIndi === 'Y'?
          <div className='quote-send'>
            <span className='send-span'>
              {'Document Language'}
            </span>
            <select
              name='send-lang'
              value={this.state.plan.langCode}
              id='send-lang'
              className='send-lang'
              onChange={e =>
                  this.onLangCodeChange(e.target.value)}
            >
              <option value='011'>
                {'English'}
              </option>
              <option value='263'>
                {'Indonesian'}
              </option>
            </select>
          </div>
          : null
        }
        <div className='action-footer'>
          <button
            className='bottom-button'
            onClick={() => this.saveAfterRecalcPremium()}
          >
            {this.isProposal ? t('Next') : t('Generate Quotation')}
          </button>
        </div>
      </section>
    )
  }
}



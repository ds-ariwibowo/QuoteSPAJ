import React from 'react'
import browserHistory from '../../../../../common/history'
import './Questionnaire.scss'
import companies from '../../../../../companies'
import { Alert } from '../../../../../components/Dialog'

import {
  deepClone,
  t,
  setHtmlTitle,
  getTomorrow,
  getToday
} from '../../../../../common/utils'

export default class InsuredQuestionnaire extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      dialog: {
        title: null,
        message: null,
        show: false,
      },
      insured: {
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
        marriageStatus: '',
        laPhRela: '',
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
      salesCompanyCode: 'hxjk',
    }
  }
  componentWillMount () {
    this.loadProducer(()=>{
      setHtmlTitle()
      this.loadData(this.props.insureIndex)
    })
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

  componentWillReceiveProps(nextProps) {
    if (this.props.insureIndex !== nextProps.insureIndex) {
      this.loadData(nextProps.insureIndex)
    }
  }

  loadData = (insureIndex) => {
    let proposalCode = this.props.params.proposalCode
    if (this.props.proposal) {
      let insured = deepClone(this.props.proposal.insureds[insureIndex])
      let salesCompanyCode = this.props.proposal.salesCompanyCode
      this.setState({ insured , salesCompanyCode})
    } else if (proposalCode) {
      this.props.actions.getProposal(proposalCode, (error, proposal) => {
        if (error) {
          this.showDialog(t('Failed to fetch proposal'))
          return
        }
        let insured = deepClone(proposal.insureds[insureIndex])
        let salesCompanyCode = proposal.salesCompanyCode
        this.setState({ insured , salesCompanyCode})
      })
    }
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

  prevStep = () => { browserHistory.goBack() }
  nextStep = () => {
    let errors = this.refs.questionnaire.validateData();
    if (errors.length > 0) {
      this.showDialog(errors)
      return
    }
    if (!this.props.proposal) {
      this.showDialog(t('Failed to fetch proposal'))
      return
    }
    let proposalCode = this.props.params.proposalCode
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
  }

  saveProposal() {
    const { packageCode, actionType, quotationCode } = this.props.params
    let insureIndex = this.props.insureIndex
    let toSecondInsuredQuestionnaire = false
    let proposal = this.props.proposal
    proposal.insureds[insureIndex] = this.state.insured
    if (this.state.insured.laPhRela == 1) {
      proposal.proposer.declaration = this.state.insured.declaration
    }
    if (insureIndex === 0  && proposal.insureds.length > 1 && proposal.insureds[1].laPhRela != 1) {
      toSecondInsuredQuestionnaire = true
    }
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
      if (toSecondInsuredQuestionnaire) {
        browserHistory.push(`/quote/${packageCode}/${actionType}/insuredQuestionnaire2/${quotationCode}/${proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
      } else {
        saveProposalRequest.proposal.proposalCode = proposalCode
        this.underwriteProposal(saveProposalRequest, () => {
          browserHistory.push(`/quote/${packageCode}/${actionType}/payment/${quotationCode}/${proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
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

  onInsuredQuestionnaireChange(value) {
    let insured = this.state.insured;
    insured.declaration = value;
    this.setState({insured})
  }

  render () {
    const CompanyComponents = companies[this.state.salesCompanyCode]
    let {age, gender,declaration} = this.state.insured;
    return (
      <section id='page-content' className='scrollable-block'>
        <Alert
          title={this.state.dialog.title}
          open={this.state.dialog.show}
          message={this.state.dialog.message}
          onRequestClose={this.hideDialog.bind(this)}
        />
        {CompanyComponents &&
          <CompanyComponents.InsuredQuestionnaire ref='questionnaire' value={declaration} age={age} gender={gender} onChange={value=>this.onInsuredQuestionnaireChange(value)} />}
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

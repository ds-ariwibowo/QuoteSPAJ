import React, { Component } from 'react'
import browserHistory from '../../../../../common/history'

import { HideItem, HideItemGroup, PremiumTable } from '../common'
import { Alert, Confirm } from '../../../../../components/Dialog'
import companies from '../../../../../companies'
import {
  getToday,
  getTomorrow,
  t,
  setHtmlTitle,
} from '../../../../../common/utils'

export default class Payment extends Component {
  constructor(props){
    super(props)
    this.state = {
      dialog: {
        title: null,
        message: null,
        show: false,
      },
      proposal: {
        moneyId: 1,
        mainCoverages: [{
          unitFlag: 6,
          sa: 0,
          premium: 0,
          chargePeriod: {
            periodType: 1,
            periodValue: 1,
          },
          coveragePeriod: {
            periodType: 1,
            periodValue: 0,
          },
        }],
        riderCoverages: [],
        proposer: {
          name: '',
        },
        payerAccounts: [
          {
            paymentMethod: 3,
            bankAccount: {
              bankCode: '',
              bankAccount: '',
              bankAccountProvince: '',
              bankAccountCity: '',
            },
          },
        ],
        totalFirstYearPrem: 0,
      }
    }
  }
  componentWillMount () {
    this.loadProducer(()=>{
      setHtmlTitle()
      this.loadData()
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

  loadData = () => {
    let proposalCode = this.props.params.proposalCode
    if (this.props.proposal) {
      let proposal = this.props.proposal
      this.setState({ proposal })
    } else if (proposalCode) {
      this.props.actions.getProposal(proposalCode, (error, proposal) => {
        if (error) {
          this.showDialog(t('Failed to fetch proposal'))
          return
        }
        this.setState({ proposal })
      })
    }
  }

  prevStep = () => { browserHistory.goBack() }

  nextStep = () => {
    let errors = this.validatePaymentInputs()
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

  saveProposal () {
    const { packageCode, actionType, quotationCode, proposalCode } = this.props.params
    let proposal = this.state.proposal
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
      const CompanyComponents = companies[this.state.proposal.salesCompanyCode]
      if (CompanyComponents && CompanyComponents.DocumentTypes && CompanyComponents.DocumentTypes.length > 0) {
        browserHistory.push(`/quote/${packageCode}/${actionType}/collectMaterial/${quotationCode}/${proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
      } else {
        browserHistory.push(`/quote/${packageCode}/${actionType}/checkOrder/${quotationCode}/${proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
      }
    })
  }

  validatePaymentInputs () {
    let errors = []
    const CompanyComponents = companies[this.state.proposal.salesCompanyCode]
    if (!CompanyComponents || !CompanyComponents.BankFormGroup) {
      return errors
    }
    let payerAccount = this.state.proposal.payerAccounts[0]
    let bankAccount = payerAccount.bankAccount? payerAccount.bankAccount.bankAccount : ''
    if (isNaN(bankAccount) || bankAccount.length < 12 || bankAccount.length > 20) {
      errors.push(
        <h3 key='bankAccount'>
          {t('Please input correct bank card number!')}
        </h3>
      )
    }
    let bankCode = payerAccount.bankAccount? payerAccount.bankAccount.bankCode : ''
    if (!bankCode) {
      errors.push(
        <h3 key='bankCode'>
          {t('Please select bank!')}
        </h3>
      )
    }
    let bankAccountProvince = payerAccount.bankAccount? payerAccount.bankAccount.bankAccountProvince : ''
    let bankAccountCity = payerAccount.bankAccount? payerAccount.bankAccount.bankAccountCity : ''
    if (!bankAccountProvince && !bankAccountCity) {
      errors.push(
        <h3 key='bankAccountProvince'>
          {t('Please input bank of city!')}
        </h3>
      )
    }
    return errors
  }

  onPayerAccountChange (payerAccount) {
    let proposal = this.state.proposal
    proposal.payerAccounts[0] = payerAccount
    this.setState({ proposal })
  }

  render () {
    const CompanyComponents = companies[this.state.proposal.salesCompanyCode]
    return (
      <section id='page-content' className='scrollable-block'>
        <Alert
          title={this.state.dialog.title}
          open={this.state.dialog.show}
          message={this.state.dialog.message}
          onRequestClose={this.hideDialog.bind(this)}
        />
        <HideItemGroup>
          <HideItem
            visible
            disabled
            title={t('Product Info')}
            iconfont="icon-ic_tabbar_main_nor"
          >
            <PremiumTable proposal={this.state.proposal} />
          </HideItem>
        </HideItemGroup>
        {CompanyComponents && CompanyComponents.BankFormGroup?
          <CompanyComponents.BankFormGroup payerName={this.state.proposal.proposer.name} value={this.state.proposal.payerAccounts[0]} onChange={payerAccount=>this.onPayerAccountChange(payerAccount)}/>
          : null}
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


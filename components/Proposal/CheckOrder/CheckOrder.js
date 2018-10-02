import React, { Component } from 'react'
import browserHistory from '../../../../../common/history'
import './CheckOrder.scss'

import { HideItem, HideItemGroup, PersonInfo, BeneficiaryInfo, PaymentInfo, ClauseList, PremiumTable } from '../common'
import companies from '../../../../../companies'
import { Alert, Confirm } from '../../../../../components/Dialog'
import {
  getToday,
  getTomorrow,
  t
} from '../../../../../common/utils'

import {
  PROPOSAL_STATUS,
} from '../common/const'

export default class CheckOrder extends Component {
  constructor (props) {
    super(props)
    this.state = {
      agree: false,
      dialog: {
        title: null,
        message: null,
        show: false,
      },
      proposal: {
        packageId: null,
        packageCode: null,
        totalFirstYearPrem: 0,
        proposalStatus: 31,
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
        beneficiaries: [],
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
      }
    }
  }

  componentWillMount () {
    this.loadData()
  }

  loadData = () => {
    if (this.props.proposal) {
      let proposal = this.props.proposal
      this.setState({ proposal })
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

  prevStep = () => {
    browserHistory.goBack()
  }

  nextStep = () => {
    const CompanyComponents = companies[this.state.proposal.salesCompanyCode]
    if (CompanyComponents && CompanyComponents.NoticeAndPrompt && !this.state.agree) {
      this.showDialog(t('Please read and accept above declaration'))
      return
    }
    if (!this.props.proposal) {
      this.showDialog(t('Failed to fetch proposal'))
      return
    }
    const { packageCode, actionType, quotationCode, proposalCode } = this.props.params
    if (CompanyComponents && CompanyComponents.DocumentTypes && CompanyComponents.DocumentTypes.length > 0) {
      browserHistory.push(`/quote/${packageCode}/${actionType}/signature/${quotationCode}/${proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
      return
    }
    // check saved proposal status
    this.props.actions.getProposal(proposalCode, (error, proposal) => {
      if (error) {
        this.showDialog(t('Failed to fetch proposal'))
        return
      }
      let saveProposalRequest = {
        proposal : this.props.proposal,
        msg: sessionStorage.getItem('SALES_APP_MSG'),
        sign: sessionStorage.getItem('SALES_APP_SIGN'),
        tenantCode: sessionStorage.getItem('SALES_APP_TENANT_CODE'),
      }
      if (['79'].includes(proposal.proposalStatus)) {
        saveProposalRequest.proposal.inforceDate = getTomorrow()
        saveProposalRequest.proposal.submitDate = getToday()
        this.saveProposal(saveProposalRequest, proposalCode=> {
          this.acceptProposal(saveProposalRequest, acceptedProposal =>{
            saveProposalRequest.proposal = acceptedProposal
            this.issueProposal(saveProposalRequest, issuedProposal => {
              browserHistory.push(`/quote/${packageCode}/${actionType}/result/${quotationCode}/${issuedProposal.proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
            })
          })
        })
      } else if (['80', '87', '90', '91'].includes(proposal.proposalStatus)) {
        this.issueProposal(saveProposalRequest, (issuedProposal) => {
          browserHistory.push(`/quote/${packageCode}/${actionType}/result/${quotationCode}/${issuedProposal.proposalCode}` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
        })
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

  saveProposal(saveProposalRequest, callback) {
    this.props.actions.saveProposal(saveProposalRequest, (error, proposalCode) => {
      if (error) {
        this.showDialog(t('Failed to save proposal'))
        return
      }
      callback && callback(proposalCode)
    })
  }

  acceptProposal(saveProposalRequest, callback) {
    this.props.actions.acceptProposal(saveProposalRequest, (error, proposal) => {
      if (error) {
        this.showDialog(t('Failed to accept proposal') + error)
        return
      }
      callback && callback(proposal)
    })
  }

  issueProposal(saveProposalRequest, callback) {
    this.props.actions.issueProposal(saveProposalRequest, (error, proposal) => {
      if (error) {
        this.showDialog(t('Failed to accept proposal') + error)
        return
      }
      callback && callback(proposal)
    })
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
            title={t('Product Info')}
            iconfont="icon-ic_tabbar_main_nor"
            visible
          >
          <PremiumTable proposal={this.state.proposal}/>
          </HideItem>
          <HideItem title={t('Policyholder Info')} iconfont="icon-person">
            <PersonInfo person={this.state.proposal.proposer} CompanyComponents={CompanyComponents} />
          </HideItem>
          {CompanyComponents && CompanyComponents.BankFormGroup?
            <HideItem title={t('Payment Info')} iconfont="icon-pay">
              <PaymentInfo payerAccount={this.state.proposal.payerAccounts[0]} payerName={this.state.proposal.proposer.name} CompanyComponents={CompanyComponents} />
            </HideItem>
            : null}
          <HideItem title={t('Insured Info')} iconfont="icon-person">
            <PersonInfo person={this.state.proposal.insureds[0]} CompanyComponents={CompanyComponents} />
          </HideItem>
          {this.state.proposal.beneficiaries.filter(bene=>bene.relToInsured==this.state.proposal.insureds[0].id).map((bene,index)=>
            <HideItem title={t('Beneficiary Info')} iconfont="icon-person" key={'insured0-bene_'+index}>
              <BeneficiaryInfo person={bene} CompanyComponents={CompanyComponents} />
            </HideItem>
          )}
          {this.state.proposal.insureds.length > 1 ?
            <HideItem title={t('2nd Insured Info')} iconfont="icon-person">
              <PersonInfo person={this.state.proposal.insureds[1]} CompanyComponents={CompanyComponents} />
            </HideItem>
            : null}
          {this.state.proposal.insureds.length > 1 && this.state.proposal.beneficiaries.filter(bene=>bene.relToInsured==this.state.proposal.insureds[1].id).map((bene,index)=>
            <HideItem title={t('Beneficiary Info')} iconfont="icon-person" key={'insured1-bene_'+index}>
              <BeneficiaryInfo person={bene} CompanyComponents={CompanyComponents} />
            </HideItem>
          )}
          {CompanyComponents && CompanyComponents.ProposerQuestionnaire?
            <HideItem title={t('Policyholder Questionnaire')} iconfont="icon-notice">
              <CompanyComponents.ProposerQuestionnaire value={this.state.proposal.proposer.declaration} readOnly />
            </HideItem>
            : null}
          {this.state.proposal.insureds[0].laPhRela != 1 && CompanyComponents && CompanyComponents.InsuredQuestionnaire?
            <HideItem title={t('Insured Questionnaire')} iconfont="icon-notice">
              <CompanyComponents.InsuredQuestionnaire value={this.state.proposal.insureds[0].declaration} readOnly />
            </HideItem>
            : null}
          {this.state.proposal.insureds.length > 1 && this.state.proposal.insureds[1].laPhRela != 1 && CompanyComponents && CompanyComponents.InsuredQuestionnaire?
            <HideItem title={t('2nd Insured Questionnaire')} iconfont="icon-notice">
              <CompanyComponents.InsuredQuestionnaire value={this.state.proposal.insureds[1].declaration} readOnly />
            </HideItem>
            : null}
          <HideItem title={t('Product Terms')} iconfont="icon-terms">
            <ClauseList proposal={this.state.proposal} />
          </HideItem>
        </HideItemGroup>
        {CompanyComponents && CompanyComponents.NoticeAndPrompt?
          <CompanyComponents.NoticeAndPrompt agree={this.state.agree} onChange={agree=>this.setState({agree})}/>
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

import React, { Component } from 'react'
import browserHistory from '../../../common/history'
import { Alert, Confirm } from '../../../components/Dialog'
import {Msg} from 'react-weui';
import 'weui'
import 'react-weui/build/packages/react-weui.css'
import { t } from '../../../common/utils'


export default class Result extends Component {
  constructor(props){
    super(props)
    this.state = {
      dialog: {
        title: null,
        message: null,
        show: false,
      },
      proposal: {
        proposalCode: this.props.params.proposalCode,
        policyCode: '',
      }
    }
  }

  componentWillMount () {
    this.loadData()
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

  getProposalResultDesc() {
    let msg = t('Your proposal is submitted success, ')
    if (this.state.proposal.policyCode) {
      msg += t('Policy Number') + `[${this.state.proposal.policyCode}]`
    } else {
      msg += t('Proposal Number')+ `[${this.state.proposal.proposalCode}]`
    }
    return msg
  }

  render () {
    return (
      <section id='page-content' className='scrollable-block'>
        <Alert
          title={this.state.dialog.title}
          open={this.state.dialog.show}
          message={this.state.dialog.message}
          onRequestClose={this.hideDialog.bind(this)}
        />
        <Msg type="success" title={t("Submit Success")}
             description={this.getProposalResultDesc()}
        />
      </section>
    )
  }
}

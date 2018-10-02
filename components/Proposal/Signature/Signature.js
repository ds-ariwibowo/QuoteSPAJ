import React, { Component } from 'react'
import browserHistory from '../../../../../common/history'
import Signature from '../../../../../components/Signature'
import { Alert, Confirm } from '../../../../../components/Dialog'
import {t} from '../../../../../common/utils'


export default class XComponent extends Component {
  constructor(props){
    super(props)
    this.state = {
      dialog: {
        title: null,
        message: null,
        show: false,
      },
    }
  }

  componentWillMount () {
    this.loadData()
  }

  loadData = () => {
    this.setState({ proposal: this.props.proposal })
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
    const { packageCode, actionType } = this.props.params
    browserHistory.push(`/quote/${packageCode}/${actionType}/result` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
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
        <Signature title={t('Policyholder Sign')} />
        <Signature title={t('Insured Sign')} />
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

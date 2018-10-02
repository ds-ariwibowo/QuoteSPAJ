import React from 'react'
import PropTypes from 'prop-types'
import Header from '../../../components/Header'
import {Toast} from 'react-weui'
import 'weui'
import 'react-weui/build/packages/react-weui.css'
import QuoteView from './QuoteView'
import Steps from '../../../components/Steps'
import {
  CollectMaterial,
  CheckOrder,
  Signature,
  EntryInfo,
  Questionnaire,
  Payment,
} from './Proposal'
import {t, lang} from '../../../common/utils'
import './Quote.scss'
import Result from './Result'

const {ProposerInfo, InsuredInfo} = EntryInfo
const {ProposerQuestionnaire, InsuredQuestionnaire} = Questionnaire
import config from '../../../config'

export default class WrapperView extends React.Component {
  componentWillMount() {
    this.setLang()
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

  render() {
    if (this.props.params.actionType === 'doProposal') {
      let step = this.props.params.proposalStep
      let proposalView = null
      let header = null
      let stepBarIndex = 1
      switch (step) {
        case 'quote':
          proposalView = <QuoteView {...this.props} />
          header = t('Quote')
          stepBarIndex = 1
          break
        case 'proposerInfo':
          proposalView = <ProposerInfo {...this.props} />
          header = t('Policyholder Info')
          stepBarIndex = 2
          break
        case 'insuredInfo':
          proposalView = <InsuredInfo {...this.props} />
          header = t('Insured Info')
          stepBarIndex = 2
          break
        case 'proposerQuestionnaire':
          proposalView = <ProposerQuestionnaire {...this.props} />
          header = t('Policyholder Questionnaire')
          stepBarIndex = 2
          break
        case 'insuredQuestionnaire1':
          proposalView = <InsuredQuestionnaire {...this.props} insureIndex={0}/>
          header = t('Insured Questionnaire')
          stepBarIndex = 2
          break
        case 'insuredQuestionnaire2':
          proposalView = <InsuredQuestionnaire {...this.props} insureIndex={1}/>
          header = t('2n Insured Questionnaire')
          stepBarIndex = 2
          break
        case 'payment':
          proposalView = <Payment {...this.props} />
          header = t('Payment')
          stepBarIndex = 3
          break
        case 'collectMaterial':
          proposalView = <CollectMaterial {...this.props} />
          header = t('Collect Material')
          stepBarIndex = 3
          break
        case 'checkOrder':
          proposalView = <CheckOrder {...this.props} />
          header = t('Check Order')
          stepBarIndex = 4
          break
        case 'signature':
          proposalView = <Signature {...this.props} />
          header = t('Signature')
          stepBarIndex = 5
          break
        case 'result':
          proposalView = <Result {...this.props} />
          header = t('Result')
          stepBarIndex = 5
          break
        default:
          break
      }
      return (
        <article id='page'>
          <Toast icon='loading' show={this.props.loading}>
            Loading...
          </Toast>
          <Header title={header}/>
          <Steps
            stepOptions={[
              t('Calculate'),
              t('Entry Info'),
              t('Collect Material'),
              t('Check Order'),
              t('Submit'),
            ]}
            currentIndex={stepBarIndex}
            style={{height:'2.22rem'}}
          />
          {proposalView}
        </article>
      )
    } else {
      return (
        <article id='page'>
          <Header title={t('Quote')}/>
          <Toast icon='loading' show={this.props.loading}>
            Loading...
          </Toast>
          <QuoteView {...this.props} />
        </article>
      )
    }
  }
}



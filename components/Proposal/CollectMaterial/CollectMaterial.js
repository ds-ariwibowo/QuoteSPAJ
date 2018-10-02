
import React, { Component } from 'react'
import browserHistory from '../../../../../common/history'
import { FormGroup } from '../../../../../components/Form'
import NativeImageUpload from '../../../../../components/NativeImageUpload'
import {t} from '../../../../../common/utils'

export default class CollectMaterial extends Component {
  constructor (props) {
    super(props)
    this.state = {
      otherDocs: [],
      proposerFront: '',
      proposerBack: '',
    }
  }

  componentWillMount () {
    this.loadData()
  }

  loadData = () => {}

  prevStep = () => {
    browserHistory.goBack()
  }

  nextStep = () => {
    const { packageCode, actionType } = this.props.params
    browserHistory.push(`/quote/${packageCode}/${actionType}/checkOrder` + '?tenantCode=' + sessionStorage.getItem('SALES_APP_TENANT_CODE'))
  }

  onCollectMaterialPropertyChange (property, value, type) {
    if (type === 'int') value = parseInt(value) || 0
    if (type === 'float') value = parseFloat(value) || 0

    const { proposer } = this.state
    proposer[property] = value
    this.setState({ proposer })
  }

  addOtherMaterial () {
    let otherDocs = this.state.otherDocs
    let otherDoc = {
      url: null,
    }
    otherDocs.push(otherDoc)
    this.setState({ otherDocs })
  }

  deleteOtherMaterial (index) {
    let otherDocs = this.state.otherDocs
    otherDocs.splice(index, 1)
    this.setState({ otherDocs })
  }

  onProposerFrontChange(imgUrl) {

  }

  render () {
    return (
      <section id='page-content' className='scrollable-block'>
        <FormGroup title={t("Policyholder's Material Upload")} iconfont="icon-person">
          <NativeImageUpload
            title={t('The Front of ID Card')}
            defaultImage={require('./assets/identityY.jpg')}
            currentImage={this.state.proposerFront}
            onImageChange={imgUrl=>this.setState({proposerFront:imgUrl})}
          />
          <NativeImageUpload
            title={t('The Back of ID Card')}
            defaultImage={require('./assets/identityN.jpg')}
            currentImage={this.state.proposerBack}
            onImageChange={imgUrl=>this.setState({proposerBack:imgUrl})}
          />
          <NativeImageUpload
            title={t('The Front of Bank Card')}
            defaultImage={require('./assets/bankcard.jpg')}
          />
        </FormGroup>
        <FormGroup title={t("Insured's Material Upload")} iconfont="icon-person">
          <NativeImageUpload
            title={t('The Front of ID Card')}
            defaultImage={require('./assets/identityY.jpg')}
          />
          <NativeImageUpload
            title={t('The Back of ID Card')}
            defaultImage={require('./assets/identityN.jpg')}
          />
        </FormGroup>
        <FormGroup
          title={t('Other Material Upload')}
          iconfont="icon-person"
          buttonTitle={t('Add')}
          onButtonClick={this.addOtherMaterial.bind(this)}
        >
          {this.state.otherDocs.map((doc, index) =>
            <NativeImageUpload
              key={'otherDoc_' + index}
              title={t('Other Material')}
              defaultImage={require('./assets/other.jpg')}
              currentImage={doc.url}
              onDeleteClick={() => this.deleteOtherMaterial(index)}
            />
          )}
        </FormGroup>
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

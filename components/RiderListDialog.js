import React from 'react'
import PropTypes from 'prop-types'
import './Quote.scss'
import Dialog from 'material-ui/Dialog'
import {t} from '../../../common/utils'

function riderCompare(a,b) {
  if (a.salesProductName < b.salesProductName)
    return -1;
  if (a.salesProductName > b.salesProductName)
    return 1;
  return 0;
}

export default class RiderListDialog extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    ridersList: PropTypes.array,
    onItemClick: PropTypes.func,
    onRequestClose: PropTypes.func,
  }

  render () {
    let { open, ridersList, onItemClick, onRequestClose } = this.props
    return (
      <Dialog open={open}
        title={ridersList.length <= 0 ? t('No available rider') : null}
        onRequestClose={() => onRequestClose && onRequestClose()}
        contentStyle={{ width:'90%', maxWidth: 'none' }} bodyStyle={{ overflowY: 'auto' }}>
        <ul id='riders-main'>
          {ridersList.sort(riderCompare).map((rider, index) =>
            <li key={index} className='rider-item'>
              <span className='content'>{rider.salesProductName}</span>
              <span className='btn-add' onClick={() => onItemClick && onItemClick(index)}>{t('Add')}</span>
            </li>
          )}
        </ul>
      </Dialog>
    )
  }
}



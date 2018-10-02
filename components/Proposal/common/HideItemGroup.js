import React from 'react'
import PropTypes from 'prop-types'
import './style.scss'

export default class HideItemGroup extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render () {
    return (
      <div className='hide-item-group'>
        {this.props.children}
      </div>
    )
  }
}

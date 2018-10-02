import React from 'react'
import PropTypes from 'prop-types'
import './style.scss'

export default class HideItem extends React.Component {
  static propTypes = {
    icon: PropTypes.string,
    iconfont: PropTypes.string,
    title: PropTypes.string,
    visible: PropTypes.bool,
    disabled: PropTypes.bool,
    children: PropTypes.node,
  }

  constructor (props) {
    super(props)
    this.state = {
      data: {},
      ui: { visible: false },
    }
  }

  componentWillMount () {
    if (this.props.visible) {
      this.setState({
        ui: Object.assign({}, this.state.ui, { visible: this.props.visible }),
      })
    }
  }

  handleClick = e => {
    if (!this.props.disabled) {
      this.setState({
        ui: Object.assign({}, this.state.ui, {
          visible: !this.state.ui.visible,
        }),
      })
    }
  }

  render () {
    const { icon, title , iconfont} = this.props
    return (
      <div className='hide-item'>
        <div className='item-title' onClick={this.handleClick}>
          {iconfont?
            <i className={'iconfont item-i ' + iconfont} />
            :
            <img className='item-icon' src={icon} width={40} height={40} />
          }

          <span className='item-desc'>
            {title}
          </span>
          <span
            style={{ display: this.props.disabled ? 'none' : 'block' }}
            className={`arrow ${this.state.ui.visible
              ? 'expansion'
              : 'closure'}`}
          />
        </div>
        <div
          className='item-content'
          style={{ display: this.state.ui.visible ? 'block' : 'none' }}
        >
          {this.props.children}
        </div>
      </div>
    )
  }
}

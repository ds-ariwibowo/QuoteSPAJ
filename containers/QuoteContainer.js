import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from '../modules/actions'

/*  This is a container component. Notice it does not contain any JSX,
    nor does it import React. This component is **only** responsible for
    wiring in the actions and state necessary to render a presentational
    component - in this case, the counter:   */

import WrapperView from '../components/WrapperView'

/*  Object of action creators (can also be function that returns object).
    Keys will be passed as props to presentational components. Here we are
    implementing our wrapper around increment; the component doesn't care   */

const mapDispatchToProps = (dispatch, props) => {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

const mapStateToProps = (state) => ({
  loading: !state.loading.done,
  packageName: state.quote.data.packageName,
  packageCode: state.quote.data.packageCode,
  salesInsurer: state.quote.data.salesInsurer,
  planInitialData: state.quote.data,
  planList: state.quote.data.planList,
  ridersList: state.quote.data.ridersList,
  calcPremium: state.quote.data.calcPremium,
  plan: state.quote.ui.plan,
  customers: state.quote.data.customers,
  proposal: state.quote.ui.proposal,
  producer: state.quote.data.producer,
  quotePdfIndi: state.quote.data.quotePdfIndi
})

/*  Note: mapStateToProps is where you should use `reselect` to create selectors, ie:

    import { createSelector } from 'reselect'
    const counter = (state) => state.counter
    const tripleCount = createSelector(counter, (count) => count * 3)
    const mapStateToProps = (state) => ({
      counter: tripleCount(state)
    })

    Selectors can compute derived data, allowing Redux to store the minimal possible state.
    Selectors are efficient. A selector is not recomputed unless one of its arguments change.
    Selectors are composable. They can be used as input to other selectors.
    https://github.com/reactjs/reselect    */

export default connect(mapStateToProps, mapDispatchToProps)(WrapperView)

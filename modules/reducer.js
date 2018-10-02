import { combineReducers } from 'redux'
import * as t from './actionTypes'

const initUiState = {
  plan: null,
  proposal: null,
}

function ui (state = initUiState, action) {
  switch (action.type) {
    case t.RESET_PAGE:
      return initUiState
    case t.SET_PLAN:
      return Object.assign({}, state, {
        plan: action.plan,
      })
    case t.SET_PROPOSAL:
      return Object.assign({}, state, {
        proposal: action.proposal,
      })
    default:
      return state
  }
}

const initDataState = {
  packageCode: null,
  packageName: null,
  salesInsurer: null,
  planList: [],
  suggestReason: '',
  ridersList: [],
  calcPremium: null,
  planCode: null,
  proposalCode: null,
  customers: null,
  producer: null,
  quotePdfIndi: null,
  illusMap: {},
}
function data (state = initDataState, action) {
  switch (action.type) {
    case t.RESET_PAGE:
      return initDataState
    case t.RECEIVE_PLAN_INITIAL_DATA:
      return Object.assign({}, state, {
        packageCode: action.data.packageCode,
        packageName: action.data.packageName,
        salesInsurer: action.data.salesInsurer,
        planList: action.data.planList,
        suggestReason: action.data.suggestReason,
        quotePdfIndi: action.data.quotePdfIndi,
      })
    case t.RECEIVE_RIDERS_LIST:
      return Object.assign({}, state, {
        ridersList: action.ridersList,
      })
    case t.RECEIVE_CALC_PREMIUM:
      return Object.assign({}, state, {
        calcPremium: action.calcPremiumData,
      })
    case t.RECEIVE_SAVE_PLAN:
      return Object.assign({}, state, {
        planCode: action.planCode,
      })
    case t.RECEIVE_SAVE_PROPOSAL:
      return Object.assign({}, state, {
        proposalCode: action.proposalCode,
      })
    case t.RECEIVE_CUSTOMERS:
      return Object.assign({}, state, {
        customers: action.customers,
      })
    case t.RECEIVE_PLAN_ILLUSTRATION:
      return Object.assign({}, state, {
        illusMap: action.illusMap,
      })
    case t.SET_PRODUCER:
      return Object.assign({}, state, { producer: action.producer })
    default:
      return state
  }
}

const reducer = combineReducers({
  ui,
  data,
})

export default reducer

import { combineReducers } from 'redux'
import qs from 'qs'
import { createActionReducer } from '../../dataFetch'
import { constructAsyncActionTypes } from '../../createAction'

// -- Constants
const COMPANY_API_URL = '/api/rest/company'
export const companyGroup = [
  { from: '0', to: '9', key: '0$9' },
  { from: 'A', to: 'E', key: 'a$e' },
  { from: 'F', to: 'K', key: 'f$k' },
  { from: 'L', to: 'N', key: 'l$n' },
  { from: 'O', to: 'R', key: 'o$r' },
  { from: 'S', to: 'Z', key: 's$z' }
]

const LOAD_ALL_COMPANY = '@@company/LOAD_ALL_COMPANY'
const loadAllCompanyAsyncActions = constructAsyncActionTypes(LOAD_ALL_COMPANY)
const loadAllCompanyReducer = createActionReducer(loadAllCompanyAsyncActions)

const LOAD_COMPANY_GROUP = '@@company/LOAD_COMPANY_GROUP'
const loadCompanyGroupAsyncActions = constructAsyncActionTypes(LOAD_COMPANY_GROUP)
const loadCompanyGroupReducer = createActionReducer(loadCompanyGroupAsyncActions)

const LOAD_ONE_COMPANY = '@@company/LOAD_ONE_COMPANY'
const loadCompanyAsyncActions = constructAsyncActionTypes(LOAD_ONE_COMPANY)
const loadCompanyReducer = createActionReducer(loadCompanyAsyncActions)

const ADD_ONE_COMPANY = '@@company/ADD_ONE_COMPANY'
const addCompanyAsyncActions = constructAsyncActionTypes(ADD_ONE_COMPANY)
const addCompanyReducer = createActionReducer(addCompanyAsyncActions)

const EDIT_ONE_COMPANY = '@@company/EDIT_ONE_COMPANY'
const editCompanyAsyncActions = constructAsyncActionTypes(EDIT_ONE_COMPANY)
const editCompanyReducer = createActionReducer(editCompanyAsyncActions)

const REMOVE_ONE_COMPANY = '@@company/REMOVE_ONE_COMPANY'
const removeCompanyAsyncActions = constructAsyncActionTypes(REMOVE_ONE_COMPANY)
const removeCompanyReducer = createActionReducer(removeCompanyAsyncActions)


//
// Action Types
export const actionTypes = {
  loadAll: loadAllCompanyAsyncActions,
  loadOne: loadCompanyAsyncActions,
  loadGroup: loadCompanyGroupAsyncActions,
  update: editCompanyAsyncActions,
  add: addCompanyAsyncActions,
  remove: removeCompanyAsyncActions
}

//
// Reducer
export default combineReducers({
  loadAll: loadAllCompanyReducer,
  loadOne: loadCompanyReducer,
  loadGroup: loadCompanyGroupReducer,
  update: editCompanyReducer,
  add: addCompanyReducer,
  remove: removeCompanyReducer
})

//
// Action Creators
export const actionCreators = {
  loadOne,
  loadAll,
  loadGroup,
  update,
  add,
  remove
}

function loadAll () {
  return {
    type: LOAD_ALL_COMPANY,
    endPoint: COMPANY_API_URL,
    cacheKey: 'COMPANY_API_URL',
    cacheTimeout: 10000 // 10s
  }
}

function loadGroup (group) {
  const { from, to, key } = group
  const query = {
    conditions: {
      name: {
        $regex: `^[${from}-${to}]`,
        $options: 'i'
      }
    }
  }
  const url = `${COMPANY_API_URL}?${qs.stringify(query)}`

  return {
    type: LOAD_COMPANY_GROUP,
    meta: {
      group, id: key
    },
    endPoint: url,
    query,
    cacheKey: `LOAD_COMPANY_GROUP$${from}$${to}`,
    cacheTimeout: 10000
  }
}

function loadOne (id) {
  const url = `${COMPANY_API_URL}/${id}`
  return {
    type: LOAD_ONE_COMPANY,
    meta: { id },
    endPoint: url,
    cacheKey: `LOAD_ONE_COMPANY${id}`,
    cacheTimeout: 10000
  }
}

function update (id, body) {
  const url = `${COMPANY_API_URL}/${id}`
  return {
    type: EDIT_ONE_COMPANY,
    method: 'PUT',
    body: {
      update: body,
      options: {
        new: true
      }
    },
    endPoint: url
  }
}

function add (body) {
  return {
    type: ADD_ONE_COMPANY,
    method: 'POST',
    body,
    endPoint: COMPANY_API_URL
  }
}

function remove (id) {
  const url = `${COMPANY_API_URL}/${id}`
  return {
    type: REMOVE_ONE_COMPANY,
    method: 'DELETE',
    endPoint: url
  }
}

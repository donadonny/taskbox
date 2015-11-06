import React, { Component, PropTypes as T } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import map from 'lodash/collection/map'
import sortBy from 'lodash/collection/sortBy'
import { CompanyActions, ProjectActions, TaskActions } from '../../redux/modules'
import { Modal, TaskForm, ProjectSelectForm } from '../../components'

@connect(
  state => ({
    company: state.company,
    project: state.project
  }),
  dispatch => ({
    ...bindActionCreators({
      loadCompany: CompanyActions.loadCompany,
      loadProjectByIds: ProjectActions.loadProjectByIds,
      publishNewTask: TaskActions.publishNewTask
    }, dispatch)
  })
)
class NewTaskModal extends Component {

  static contextTypes = {
    resourceInfo: T.array
  }

  static propTypes = {
    company: T.object,
    project: T.object,
    isShowed: T.bool,
    onSuccess: T.func,
    onSubmit: T.func,
    onHide: T.func,
    loadCompany: T.func,
    loadProjectByIds: T.func,
    publishNewTask: T.func
  }

  static defaultProps = {
    isShowed: false,
    onSubmit: () => {},
    onHide: () => {}
  }

  constructor (props) {
    super(props)

    this.state = {
      msg: '',
      step: 0,
      currentProject: null,
      currentCompany: null,
      avaliableProjects: [],
      submitting: false
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.isShowed && nextProps.isShowed) {
      this.setState({
        msg: '',
        step: 0,
        currentProject: null,
        currentCompany: null,
        avaliableProjects: [],
        submitting: false
      })
    }
  }

  componentDidMount () {
    this.props.loadCompany()
  }

  componentWillUnmount () {
    CompanyActions.dispose()
  }

  render () {
    return (
      <Modal isShowed={this.props.isShowed}
        animateName='modalFade' transitionTimeout={500}
        dimmerClassName='modal-dimmer' modalClassName='modal-dialog'>
        {this._getContent()}
      </Modal>
    )
  }

  setMessage (msg) {
    this.setState({ msg })
  }

  _getContent () {
    const { step } = this.state
    if (step === 0) return this._confirmProject()
    if (step === 1) return this._newTaskContent()
  }

  _confirmProject () {
    const companies = sortBy(map(this.props.company.data, c => c), 'name')
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" onClick={this.props.onHide}>
            <span aria-hidden="true">×</span>
          </button>
          <h4 className="modal-title">Choose a project</h4>
        </div>
        <div className="modal-body">
          <ProjectSelectForm
            defaultCompany={this.state.currentCompany}
            defaultProject={this.state.currentProject}
            avaliableCompanies={companies}
            currentProjectItems={this.state.avaliableProjects}
            onCompanyChange={::this._handleCompanyChange}
            onProjectChange={::this._handleProjectChange} />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-sm btn-white" onClick={this.props.onHide}>Cancel</button>
          {this.state.currentProject ?
            <button type="button" className="btn btn-sm btn-info" onClick={::this._onNext}>Next</button>
            : null
          }
        </div>
      </div>
    )
  }

  _newTaskContent () {
    const { currentProject, currentCompany } = this.state
    const defaultTaskTitle = currentProject && currentCompany ? `${currentCompany.name} - ${currentProject.name}` : ''
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" onClick={this.props.onHide}>
            <span aria-hidden="true">×</span>
          </button>
          <h4 className="modal-title">Publish a new Task</h4>
        </div>
        <div className="modal-body">
          <TaskForm
            ref='taskform'
            defaultTaskTitle={defaultTaskTitle}
            avaliableResources={this.context.resourceInfo} />
        </div>
        <div className="modal-footer">
          <span className='help-text text-danger'>{this.state.msg}</span>
          <button type="button" className="btn btn-sm btn-white" onClick={::this._onBack}>Back</button>
          <button type="button" className="btn btn-sm btn-success" onClick={::this._onClick} disabled={this.state.submitting}>Publish</button>
        </div>
      </div>
    )
  }

  _onBack () {
    this.setState({ step: 0 })
  }

  _onNext () {
    this.setState({
      step: 1,
      msg: ''
    })
  }

  _onClick () {
    const form = this.refs.taskform
    form.validate()

    const { errmsg, body } = form

    if (errmsg) {
      this.setState({ msg: errmsg })
    }
    else {
      this.setState({
        msg: '', submitting: true
      }, () => {
        body.projectId = this.state.currentProject._id

        this.props.publishNewTask(body, ({ status, body }) => {
          if (Number(status) !== 200) {
            this.setState({ msg: 'Publish failed, please try again later.' })
          }
          else this.props.onSuccess(body.new)
        })
      })
    }
  }

  _handleCompanyChange (company) {
    this.props.loadProjectByIds(company.projects, ({ body }) => {
      body = sortBy(body, 'name')
      this.setState({
        currentCompany: company,
        avaliableProjects: body
      })
    })
  }

  _handleProjectChange (project) {
    this.setState({ currentProject: project })
  }
}

export default NewTaskModal

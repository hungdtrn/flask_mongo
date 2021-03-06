import { put, call, delay, race, select } from 'redux-saga/effects'

import * as projectType from './types.js'
import * as projectAction from './actions'
import * as projectOperation from './operations'
import * as projectApi from './apis'
import projectReducer from './reducers'
import { CONFIG } from '../../globals'

describe("Project actions", () => {
    it("Should create action to find all projects", () => {
        const expectedAction = {
            type: projectType.FIND_ALL_REQUEST
        }

        expect(projectAction.findAllRequest()).toEqual(expectedAction)
    })

    it("Should create action to start find all process", () => {
        const expectedAction = {
            type: projectType.FIND_ALL_START
        }

        expect(projectAction.findAllStart()).toEqual(expectedAction)
    })

    it("Should create action for find all success", () => {
        const projects = [{
            "id": 1,
            "name": "test"
        }, {
            "id": 2,
            "name": "test2"
        }]
        expect(projectAction.findAllSuccess(projects)).toEqual({
            type: projectType.FIND_ALL_SUCCESS,
            payload: {
                projects
            }
        })

    })

    it("Should create action for find all error", () => {
        const errorMsg = "Error"
        expect(projectAction.findAllError(errorMsg)).toEqual({
            type: projectType.FIND_ALL_ERROR,
            payload: {
                error: errorMsg
            }
        })
    })

    it("Should create action to find by id", () => {
        const id = "id"
        expect(projectAction.findByIdRequest(id)).toEqual({
            type: projectType.FIND_BY_ID_REQUEST,
            payload: {
                id
            }
        })
    })

    it("Should create action to start find by id process", () => {
        expect(projectAction.findByIdStart()).toEqual({
            type: projectType.FIND_BY_ID_START
        })
    })

    it("Should create action for find by id success (api)", () => {
        const project = {
            id: "id",
            name: "test"
        }

        expect(projectAction.findByIdSuccess(project)).toEqual({
            type: projectType.FIND_BY_ID_SUCCESS,
            payload: {
                currentProject: project
            }
        })
    })

    it("Should create action for find by id in array", () => {
        const id = "id"

        expect(projectAction.findByIdInArray(id)).toEqual({
            type: projectType.FIND_BY_ID_IN_ARRAY,
            payload: {
                id
            }
        })
    })

    it("Should create action for find by id error", () => {
        const error = "error"

        expect(projectAction.findByIdError(error)).toEqual({
            type: projectType.FIND_BY_ID_ERROR,
            payload: {
                error
            }
        })
    })

    it("Should create action to create", () => {
        const project = {
            "name": "test"
        }

        expect(projectAction.createRequest(project)).toEqual({
            type: projectType.CREATE_REQUEST,
            payload: {
                project
            }
        })
    })

    it("Should create action to start create process", () => {
        expect(projectAction.createStart()).toEqual({
            type: projectType.CREATE_START
        })
    })

    it("Should create action for create success", () => {
        const project = {
            "id": "test",
            "name": "test"
        }

        expect(projectAction.createSuccess(project)).toEqual({
            type: projectType.CREATE_SUCCESS,
            payload: {
                createdProject: project
            }
        })
    })

    it("Should create action for create error", () => {
        const error = "Error"

        expect(projectAction.createError(error)).toEqual({
            type: projectType.CREATE_ERROR,
            payload: {
                error
            }
        })
    })

    it("Should create action to delete", () => {
        const id = "project id"
        
        expect(projectAction.deleteRequest(id)).toEqual({
            type: projectType.DELETE_REQUEST,
            payload: {
                id
            }
        })
    })

    it("Should create action to start delete process", () => {
        expect(projectAction.deleteStart()).toEqual({
            type: projectType.DELETE_START,
        })
    })

    it("Should create action for delete success", () => {
        expect(projectAction.deleteSuccess("1")).toEqual({
            type: projectType.DELETE_SUCCESS,
            payload: {
                id: "1"
            }
        })
    })

    it("Should create action for delete error", () => {
        const error = "error"

        expect(projectAction.deleteError(error)).toEqual({
            type: projectType.DELETE_ERROR,
            payload: {
                error
            }
        })
    })


    it("Should create action to clear find error", () => {
        expect(projectAction.clearFindError()).toEqual({
            type: projectType.CLEAR_FIND_ERROR,
        })
    })

    it("Should create action to clear create", () => {
        expect(projectAction.clearCreate()).toEqual({
            type: projectType.CLEAR_CREATE,
        })
    })

    it("Should create action to clear delete", () => {
        expect(projectAction.clearDelete()).toEqual({
            type: projectType.CLEAR_DELETE
        })
    })

})

describe("Project operations (sagas)", () => {
    it("Should start find all", () => {
        const generator = projectOperation.findAll()
        
        expect(generator.next().value).toEqual(put(projectAction.findAllStart()))
    })

    it("Should find all fail (connection)", () => {
        const generator = projectOperation.findAll()

        // Call request start
        generator.next()

        // Find project
        expect(generator.next().value).toEqual(race({
            response: call(projectApi.findAll),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        // Should call error on timeout
        let next = generator.next({
            timeout: true
        })

        expect(next.value).toEqual(put(projectAction.findAllError("Timeout")))

    })

    it("Should find all fail (server)", () => {
        const generator = projectOperation.findAll()
        const serveError = "Error"        

        // Call request start
        generator.next()

        // Find project
        expect(generator.next().value).toEqual(race({
            response: call(projectApi.findAll),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        // Should call error on timeout
        let next = generator.next({
            response: {
                result: "",
                msg: serveError
            }
        })

        expect(next.value).toEqual(put(projectAction.findAllError(serveError)))
    })

    it("Should find all success", () => {
        const generator = projectOperation.findAll()
        const serverResult = {
            "id": 1,
            "name": "project",
        }        

        // Call request start
        generator.next()

        // Find project
        expect(generator.next().value).toEqual(race({
            response: call(projectApi.findAll),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        // Should call error on timeout
        let next = generator.next({
            response: {
                result: serverResult,
                msg: null
            }
        })

        expect(next.value).toEqual(put(projectAction.findAllSuccess(serverResult)))
    })

    it("Should start find by id", () => {
        const id = "id"
        const action = projectAction.findByIdRequest(id)
        const generator = projectOperation.findById(action)
        
        expect(generator.next().value).toEqual(put(projectAction.findByIdStart()))
    })

    it("Should find by id fail (connection)", () => {
        const id = "id"
        const action = projectAction.findByIdRequest(id)
        const generator = projectOperation.findById(action)

        generator.next()

        // Find project by id
        expect(generator.next().value).toEqual(race({
            response: call(projectApi.findById, action.payload.id),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            timeout: true
        })

        expect(next.value).toEqual(put(projectAction.findByIdError("Timeout")))
    })

    it("Should find by id fail (server)", () => {
        const id = "id"
        const action = projectAction.findByIdRequest(id)
        const generator = projectOperation.findById(action)
        const error = "error"

        generator.next()

        // Find project by id
        expect(generator.next().value).toEqual(race({
            response: call(projectApi.findById, action.payload.id),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            response: {
                result: null,
                msg: error
            }
        })

        expect(next.value).toEqual(put(projectAction.findByIdError(error)))
    })

    it("Should find by id success", () => {
        const id = "id"
        const action = projectAction.findByIdRequest(id)
        const generator = projectOperation.findById(action)
        const result = {
            id: "id",
            name: "name"
        }

        generator.next()

        // Find project by id
        expect(generator.next().value).toEqual(race({
            response: call(projectApi.findById, action.payload.id),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            response: {
                result,
                msg: null
            }
        })

        expect(next.value).toEqual(put(projectAction.findByIdSuccess(result)))
    })

    it("Should start create", () => {
        const projectForm = {
            name: "test"
        }
        const createAction = projectAction.createRequest(projectForm)
        const generator = projectOperation.create(createAction)
        
        expect(generator.next().value).toEqual(put(projectAction.createStart()))
    })

    it("Should create fail (connection)", () => {
        const projectForm = {
            name: "test"
        }
        const createAction = projectAction.createRequest(projectForm)
        const generator = projectOperation.create(createAction)

        generator.next()

        expect(generator.next().value).toEqual(race({
            response: call(projectApi.create, createAction.payload.project),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            timeout: true
        })

        expect(next.value).toEqual(put(projectAction.createError("Timeout")))

    })

    it("Should create fail (server)", () => {
        const projectForm = {
            name: "test"
        }
        const error = "Error"
        const createAction = projectAction.createRequest(projectForm)
        const generator = projectOperation.create(createAction)

        generator.next()

        expect(generator.next().value).toEqual(race({
            response: call(projectApi.create, createAction.payload.project),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            response: {
                result: null,
                msg: error
            }
        })

        expect(next.value).toEqual(put(projectAction.createError(error)))
    })

    it("Should create success", () => {
        const projectForm = {
            name: "test"
        }

        const createAction = projectAction.createRequest(projectForm)
        const generator = projectOperation.create(createAction)

        generator.next()

        expect(generator.next().value).toEqual(race({
            response: call(projectApi.create, createAction.payload.project),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            response: {
                result: projectForm,
                msg: null
            }
        })

        expect(next.value).toEqual(put(projectAction.createSuccess(projectForm)))
    })

    it("Should delete start", () => {
        const id = "id"
        const action = projectAction.deleteRequest(id)
        const generator = projectOperation.deleteById(action)

        expect(generator.next().value).toEqual(put(projectAction.deleteStart()))
    })

    it("Should delete fail (connection)", () => {
        const id = "id"
        const action = projectAction.deleteRequest(id)
        const generator = projectOperation.deleteById(action)

        generator.next()

        expect(generator.next().value).toEqual(race({
            response: call(projectApi.deleteById, action.payload.id),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            timeout: true
        })

        expect(next.value).toEqual(put(projectAction.deleteError("Timeout")))
    })

    it("Should delete fail (server)", () => {
        const id = "id"
        const action = projectAction.deleteRequest(id)
        const generator = projectOperation.deleteById(action)
        const error = "error"

        generator.next()

        expect(generator.next().value).toEqual(race({
            response: call(projectApi.deleteById, action.payload.id),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            response: {
                result: null,
                msg: error
            }
        })

        expect(next.value).toEqual(put(projectAction.deleteError(error)))
    })

    it("Should delete success", () => {
        const id = "id"
        const action = projectAction.deleteRequest(id)
        const generator = projectOperation.deleteById(action)

    
        generator.next()

        expect(generator.next().value).toEqual(race({
            response: call(projectApi.deleteById, action.payload.id),
            timeout: delay(CONFIG.REQUEST_TIMEOUT)
        }))

        let next = generator.next({
            response: {
                result: true,
                msg: null
            }
        })

        expect(next.value).toEqual(put(projectAction.deleteSuccess(id)))
    })

})

let DEFAULT_STATE = {
    find: {
        loading: false,
        projects: [],
        currentProject: null,
        error: null    
    },
    create: {
        loading: false,
        createdProject: null,
        error: null
    },
    delete: {
        loading: false,
        success: false,
        error: null
    }
}
describe("Project reducer", () => {
    it("Should return default find state", () => {
        expect(projectReducer(undefined, {})).toEqual(DEFAULT_STATE)
    })

    it("Should handle find all start", () => {
        const new_state = {
            ...DEFAULT_STATE,
            find: {
                loading: true,
                projects: [],
                currentProject: null,
                error: null    
            }
        }

        expect(projectReducer(DEFAULT_STATE, projectAction.findAllStart())).toEqual(new_state)
    })

    it("Should handle find all error", () => {
        const error = "Error"
        const new_state = {
            ...DEFAULT_STATE,
            find: {
                loading: false,
                projects: [],
                currentProject: null,
                error    
            }
        }

        expect(projectReducer({
            ...DEFAULT_STATE,
            find: {
                loading: true,
                projects: [],
                currentProject: null,
                error: null            
            }
        }, projectAction.findAllError(error))).toEqual(new_state)
    })

    it("Should handle find all success", () => {
        const projects = [
            {
                id: "1",
                name: "name "
            }
        ]

        const new_state = {
            ...DEFAULT_STATE,
            find: {
                loading: false,
                projects: projects,
                currentProject: null,
                error: null    
            }
        }
        
        expect(projectReducer({
            ...DEFAULT_STATE,
            find: {
                loading: true,
                projects: [],
                currentProject: null,
                error: null        
            }
        }, projectAction.findAllSuccess(projects))).toEqual(new_state)    
    
        DEFAULT_STATE = new_state
    })

    it("Should handle find by id start", () => {
        const new_state = {
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                loading: true,
            }
        }

        expect(projectReducer({
            ...DEFAULT_STATE,
        }, projectAction.findByIdStart())).toEqual(new_state)
    })

    it("Should handle find by id in array", () => {
        const projects = [{
            _id: "1",
            name: "tst1"
        }, {
            _id: "2",
            name: 'test2'
        }]

        expect(projectReducer({
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                projects
            }
        }, projectAction.findByIdInArray("1"))).toEqual({
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                projects,
                currentProject: projects[0]
            }
        })

        expect(projectReducer({
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                projects
            }
        }, projectAction.findByIdInArray("5"))).toEqual({
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                projects,
                currentProject: null
            }
        })

    })

    it("Should handle find by id error", () => {
        const error = "error"
        
        const new_state = {
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                loading: false,
                error: error    
            }
        }

        expect(projectReducer({
            ...DEFAULT_STATE,
        }, projectAction.findByIdError(error))).toEqual(new_state)
    })

    it("Should handle find by id success", () => {
        const new_state = {
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                currentProject: DEFAULT_STATE.find.projects[0],
                loading: false,
                error: null
            }
        }
                
        expect(projectReducer({
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                loading: true,
                error: null
            }
        }, projectAction.findByIdSuccess(DEFAULT_STATE.find.projects[0]))).toEqual(new_state)
    
        DEFAULT_STATE = new_state
    })

    it("Should handle clear find error", () => {        
        const new_state = {
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                error: null    
            }
        }

        expect(projectReducer({
            ...DEFAULT_STATE,
        }, projectAction.clearFindError())).toEqual(new_state)
    })

    it("Should handle create start", () => {
        const new_state = {
            ...DEFAULT_STATE,
            create: {
                loading: true,
                createdProject: null,
                error: null    
            }
        }

        expect(projectReducer({
            ...DEFAULT_STATE,
            create: {
                loading: false,
                createdProject: null,
                error: null    
            }
        }, projectAction.createStart())).toEqual(new_state)
    })

    it("Should handle create error", () => {
        const error = "error"
        const new_state = {
            ...DEFAULT_STATE,
            create: {
                loading: false,
                createdProject: null,
                error: error    
            }
        }

        expect(projectReducer({
            ...DEFAULT_STATE,
            create: {
                loading: true,
                createdProject: null,
                error: null    
            }
        }, projectAction.createError(error))).toEqual(new_state)
    })

    it("Should handle create success", () => {
        const createdProject = {
            "id": 2,
            "name": "test2"
        }

        const new_state = {
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                projects: [...DEFAULT_STATE.find.projects, createdProject]
            },

            create: {
                loading: false,
                createdProject: createdProject,
                error: null    
            }
        }

        expect(projectReducer({
            ...DEFAULT_STATE,
            create: {
                loading: true,
                createdProject: createdProject,
                error: null    
            }
        }, projectAction.createSuccess(createdProject))).toEqual(new_state)
    })

    it("Should handle clear create", () => {
        const new_state = {
            ...DEFAULT_STATE,
            create: {
                loading: false,
                createdProject: null,
                error: null    
            }
        }

        expect(projectReducer({
            ...DEFAULT_STATE,
            create: {
                loading: false,
                createdProject: null,
                error: "Error"    
            }
        }, projectAction.clearCreate())).toEqual(new_state)

        expect(projectReducer({
            ...DEFAULT_STATE,
            create: {
                loading: false,
                createdProject: {
                    id: "1",
                    name: "name"
                },
                error: null    
            }
        }, projectAction.clearCreate())).toEqual(new_state)

    })

    it("Should handle delete start", () => {
        expect(projectReducer({
            ...DEFAULT_STATE,
            delete: {
                loading: false,
                success: false,
                error: null    
            }
        }, projectAction.deleteStart())).toEqual({
            ...DEFAULT_STATE,
            delete: {
                loading: true,
                success: false,
                error: null    
            }
        })
    })

    it("Should handle delete error", () => {
        const error = "error"

        expect(projectReducer({
            ...DEFAULT_STATE,
            delete: {
                loading: true,
                success: false,
                error: null    
            }
        }, projectAction.deleteError(error))).toEqual({
            ...DEFAULT_STATE,
            delete: {
                loading: false,
                success: false,
                error: error    
            }
        })
    })

    it("Should handle delete success", () => {
        
        expect(projectReducer({
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                projects: [{
                    _id: "1",
                    name: "project1",
                }]
            },
            delete: {
                loading: true,
                success: false,
                error: null    
            }
        }, projectAction.deleteSuccess("1"))).toEqual({
            ...DEFAULT_STATE,
            find: {
                ...DEFAULT_STATE.find,
                projects: [],
            },
            delete: {
                loading: false,
                success: true,
                error: null    
            }
        })
    })

    it("Should handle clear delete", () => {
        const prevError = {
            ...DEFAULT_STATE,
            delete: {
                loading: false,
                success: false,
                error: "Error"    
            }
        }

        const prevSuccess = {
            ...DEFAULT_STATE,
            delete: {
                loading: false,
                success: true,
                error: null    
            }
        }

        const newState = {
            ...DEFAULT_STATE,
            delete: {
                loading: false,
                success: false,
                error: null    
            }
        }

        expect(projectReducer(prevError, projectAction.clearDelete())).toEqual(newState)
        expect(projectReducer(prevSuccess, projectAction.clearDelete())).toEqual(newState)

    })
})
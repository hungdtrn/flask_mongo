import { ACTIONTYPES } from './actions'

let initialState = {
    loading: false,
    accessToken: null,
    error: null,
    remember: false
}

const authReducer = (state, action) => {
    switch (action.type) {
        case ACTIONTYPES.LOGIN_SUCCESS: {
            const accessToken = action.payload.accessToken;
            console.log(accessToken);
            if (action.payload.remember) {
                localStorage.setItem("accessToken", accessToken)
            } else {
                sessionStorage.setItem("accessToken", accessToken)
            }
            return Object.assign({}, state, {
                loading: false,
                accessToken: action.payload.accessToken,
                error: null
            })
        }
        case ACTIONTYPES.LOGIN_ERROR:
            return Object.assign({}, state, {
                loading: false,
                error: action.payload.error
            })
        case ACTIONTYPES.REGISTER_SUCCESS:
            return Object.assign({}, state, {
                loading: false,
                accessToken: action.payload.accessToken,
                error: null
            })
        case ACTIONTYPES.REGISTER_ERROR:
            return Object.assign({}, state, {
                loading: false,
                error: action.payload.error
            })
        case ACTIONTYPES.CLEAR_ERROR:
            return Object.assign({}, state, {
                error: null
            })
        default: 
            return initialState
        
    }
}

export default authReducer
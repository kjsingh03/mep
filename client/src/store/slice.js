import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loginState: false,
    userBalance: 0,
    alertMessage: {
        message: '',
        type: ''
    },
}

const slice = createSlice({
    name: 'store',
    initialState,
    reducers: {
        setLoginState: (state, action) => {
            state.loginState = action.payload
        },
        setUserBalance: (state, action) => {
            state.userBalance = action.payload
        },
        setAlertMessage: (state, action) => {
            state.alertMessage = action.payload
        }
    }
})

export const { setLoginState, setUserBalance, setAlertMessage } = slice.actions

export default slice.reducer


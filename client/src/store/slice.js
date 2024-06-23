import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loginState: false,
    userBalance: 0,
    walletAddress: '',
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
        setWalletAddress: (state, action) => {
            state.walletAddress = action.payload
        },
        setAlertMessage: (state, action) => {
            state.alertMessage = action.payload
        }
    }
})

export const { setLoginState, setUserBalance, setAlertMessage,setWalletAddress } = slice.actions

export default slice.reducer


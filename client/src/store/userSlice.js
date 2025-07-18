import { createSlice } from "@reduxjs/toolkit";

const userSlice=createSlice({
    name:'user',
    initialState:null,
    reducers:{
        UserLoggedIn:(state,action)=>{
            return action.payload
        },
        userLoggedOut:()=>{
            return null
        }
    }
})

export const{userLoggedOut,UserLoggedIn}=userSlice.actions
export default userSlice.reducer
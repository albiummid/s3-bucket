import { useSelector } from "react-redux";

const { createSlice } = require("@reduxjs/toolkit");

const uploadSlice = createSlice({
    name:"upload",
    initialState:{
        uploadStatus:'Idle',
        uploadPercentage:0,
        uploadsData:[],
        files:[],
        currentIndex:null,
    },
    reducers:{
        setUploadStatus(state,{payload}){
            state.uploadStatus = payload
        },
        setUploadPercentage(state,{payload}){
            state.uploadPercentage = payload
        },
        setUploadData(state,{payload}){
            state.uploadsData = payload
        },
        setFiles(state,{payload}){
            state.files = payload;
            if(payload?.length){
                state.currentIndex = 0;
            }else{
                state.currentIndex = null
            }
        },
        setCurrentIndex(state,{payload}){
            state.currentIndex = payload
        }
    }
})

export default uploadSlice.reducer;

export const {
    setUploadData,
    setUploadStatus,
    setUploadPercentage,
    setCurrentIndex,
    setFiles
} = uploadSlice.actions

export const useUploadState = ()=> useSelector(state=>state.upload);
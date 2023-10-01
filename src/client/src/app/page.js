"use client"
import React, { useState } from 'react'
import { uploadFile } from '../utils/helpers';
import { setFiles, useUploadState } from '@/redux/features/upload/uploadSlice';
import { dispatch } from '@/redux/store';
import { Button, Progress } from '@mantine/core';

export default function Page() {
  const [uploadedLink,setUpLink] = useState('');
const handleFileChange = (e)=>{
  setUpLink("");
    const F = Array.from(e.target.files);
   dispatch(setFiles(F))
}

const startUpload = async ()=>{
const upload = await uploadFile(files[0])
setUpLink('http://localhost:5000/'+upload?.public_slug)
}
const {uploadStatus,uploadPercentage,files} = useUploadState();
console.log(files)

  return (
    <div>
        <div>
    <h1>
      Hello World!
    </h1>
    <br></br>
    <h1>
      Uploading : {uploadPercentage}
    </h1>
    <h1>
      Uplink : <a href={uploadedLink} target="_blank">{uploadedLink}</a>
    </h1>
    <h2>
      Status: {uploadStatus}
    </h2>
    <input type='file' onChange={handleFileChange}/>
    <br/>
   {
    uploadStatus !== 'Uploading'?  <Button disabled={!files.length} className=' border mt-10 p-5' onClick={startUpload} >
    Upload
   </Button>: <Progress.Root animate radius="xl" s size="xl" >
   <Progress.Section  value={uploadPercentage} striped  >
    <Progress.Label>
      {uploadPercentage}%
    </Progress.Label>
   </Progress.Section>
   </Progress.Root>
   }
   </div>
    </div>
  )
}

"use client"
import React, { useState } from 'react'
import { handleFile } from './utils/helpers';

export default function Page() {
const [files,setFiles] = useState([]);
const handleFileChange = (e)=>{
    const F = Array.from(e.target.files);
    setFiles(F);
}

const startUpload = async ()=>{
const upload = await handleFile(files[0])
console.log(upload)
console.log((upload.location.replaceAll('\\','/')).split('/bucket/')[1])
}

console.log(files)

  return (
    <div>
        <div>
    <h1>
      Hello World!
    </h1>
    {/* <h2>
      Status: {uploadState} <br/>
      UploadSize: {uploadSize} <br/>
      Upload Percentage: {uploadPercentage}

    </h2> */}
    <br></br>
    <input type='file' onChange={handleFileChange}/>
    <br/>
    <button className=' border mt-10 p-5' onClick={startUpload} >
      Upload
    </button>
   </div>
    </div>
  )
}

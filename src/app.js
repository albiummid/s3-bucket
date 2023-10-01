const express = require('express');
const http  = require('http');
const {Server} = require('socket.io');
const { socketManager } = require('./wsManager');
const fs = require('fs')


const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: '50mb'}));
const httpApp = http.Server(app);
const cors = require('cors');
const path = require('path');
const { ReadDir } = require('./utils/helpers');
const db = require('./db');
const { default: mongoose } = require('mongoose');
const appConfig = require('../app.config');
cors();

console.log(__dirname+'\\bucket')

const io = new Server(httpApp, {
    cors: {
        origin: "*",
    },
});
const uuid = require('uuid').v4;

// socketManager(io);

const files = {};

(async function (io) {
    io.on("connection", (socket) => {
        console.log(`⚡: ${socket.id} user just connected!\n`);

        socket.on('client/sendFileMetaData',async({name,type,size})=>{
           try{
            console.log("__FILE_TYPE__:",type)
            const {name:fileName,ext:fileExt} = path.parse(name);
            const tempFilename = '_temp'+fileName+'.'+type;
            const finalFileName = fileName + '_'+Date.now().toString()+fileExt
            console.log(path.parse(name));

            const bucketPath = path.join(__dirname,'bucket');
            const tempPath =  path.join(bucketPath,'temp');

            let finalPath
            if(type === 'image'){
                finalPath = path.join(bucketPath,'images')
            }else if(type === 'video'){
                finalPath = path.join(bucketPath,'videos')
            }else{
                finalPath = path.join(bucketPath,'others')
            }
            
            const tempFilePath = path.join(tempPath,tempFilename);
            const finalFilePath = path.join(finalPath,finalFileName);
            if(fs.existsSync(tempFilePath)){
                // if same file's temp version exist on temp folder
                fs.unlinkSync(tempFilePath)
            }
            fs.writeFileSync(tempFilePath,'');
                const fileInfo = {
                    id:uuid(),
                    name,
                    tempFilePath,
                    finalFilePath,
                    size,
                    type,
                };
                files[fileInfo.id] = fileInfo;
                socket.emit('server/receivedFileMeta',{
                    id:fileInfo.id,
                    status:"meta received",
                    message:"Now send the chunk"
                })
           }catch(err){
            console.log(err)
           }
        });

        socket.on('client/sendFileChunk',({id,chunk,progressPercentage})=>{
            const {tempFilePath,name} = files[id];
            const buffer = new Buffer.from(chunk,'base64');
            fs.appendFileSync(tempFilePath, buffer);
            console.log(`[ ${name} ] _UPLOADED__:`,progressPercentage,"%")
            socket.emit('server/chunkReceived',{
                isValidChunk:Boolean(chunk),
                uploadedPercentage:progressPercentage,
            })
        })

        socket.on('client/chunkSendComplete',async({id})=>{
            try{
                const {tempFilePath,finalFilePath,name,size,type} = files[id];
                fs.renameSync(tempFilePath,finalFilePath);
                const {dir,base} = path.parse(finalFilePath)
                console.log("__DIR:",dir)
                const route =( dir.replaceAll('\\','/')).split('src/')[1];
                const slug = route + '/'+base;
               const bucketFile = await db.bucket_file.create({
                    name:name,
                    file_size:size,
                    file_type:type,
                    file_destination:finalFilePath,
                    isPrivate:false,
                    public_slug:slug
                });
                console.log(bucketFile)
                
                socket.emit('server/sendFileInfo',{
                    fileInfo:bucketFile,
                })
            }catch(err){
                console.log(err)
             socket.emit('error',{err})
            }
        })

        socket.on("disconnect", () => {
            console.log("🔥: A user disconnected\n");
        });
    });
})(io)



// Check and update Bucket Dir
ReadDir(path.join(__dirname,'bucket'))
.then(res=>{
    const bucketDirList = [ 'documents', 'images', 'others', 'temp', 'videos' ];
    let foundDirList = res.folders.map(x=>x.name);
    let missingDirList = bucketDirList.filter(x=>!foundDirList.includes(x));
    missingDirList?.forEach(x=>{
        fs.mkdirSync(path.join(__dirname,'bucket',x));
        console.log("__DIR: bucket/"+x+" has been created !!")
    })
})

const startServer = ()=>{
    httpApp.listen(5000,()=>{
        console.log(`\n🔥 Server running at PORT ${5000} in development mode ⚡\n`)
    })
}

app.use('/bucket', express.static(path.join(__dirname, 'bucket')))

// Server will run iff the DB connection is successful
mongoose
    .connect(appConfig.db.dbURL, {
        retryWrites: true,
        // writeConcern
    })
    .then(() => {
        // appInfo();
        console.log("⚡ DB Connected");
        startServer();
    })
    .catch((error) => {
        //  Logging.error(error)
    });



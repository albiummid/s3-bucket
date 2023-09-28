const express = require('express');
const http  = require('http');
const {Server} = require('socket.io');
const { socketManager } = require('./wsManager');
const fs = require('fs')


const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
const httpApp = http.Server(app);
const cors = require('cors');
const path = require('path');
cors();
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

        socket.on('client/sendFileMetaData',async({name,type})=>{
           try{
            const tempFilename = '_temp'+name+'.'+type;
            const finalFileName = Date.now()+'_'+name;

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
            const {tempFilePath} = files[id];
            const buffer = new Buffer.from(chunk,'base64');
            fs.appendFileSync(tempFilePath, buffer);
            socket.emit('server/chunkReceived',{
                isValidChunk:Boolean(chunk),
            })
        })

        socket.on('client/chunkSendComplete',async({id})=>{
            try{
                const {tempFilePath,finalFilePath,name} = files[id];
                fs.renameSync(tempFilePath,finalFilePath);
                console.log(path.parse(finalFilePath))
                socket.emit('server/sendFileInfo',{
                    fileInfo:{
                        name,
                        location:finalFilePath
                    }
                })
            }catch(err){
            console.log(err)
            }
        })

        socket.on("disconnect", () => {
            console.log("🔥: A user disconnected\n");
        });
    });
})(io)


httpApp.listen(5000,()=>{
    console.log("Server Running")
})

import { setUploadPercentage, setUploadStatus } from "@/redux/features/upload/uploadSlice";
import { dispatch } from "@/redux/store";
import { io } from "socket.io-client";

const socket = io('http://localhost:5000');
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


function uploadChunk(
    id,
    file,
    i,
    chunkCount,
    BEGINNING_OF_CHUNK,
    ENDING_OF_CHUNK
) {
    const chunk = file.slice(BEGINNING_OF_CHUNK, ENDING_OF_CHUNK);
    // const checksum = SHA256(chunk).toString();
    const progressPercentage = Math.round((i / chunkCount) * 100);
    console.log("_UPLOAD_PROGRESS: ",progressPercentage,"%")
    socket.emit('client/sendFileChunk', {
        id,
        chunk,
        // checksum,
        progressPercentage,
    });
}
export function uploadFile(file) {
    let BEGINNING_OF_CHUNK = 0;
    const CHUNK_SIZE = 1e5;
    let ENDING_OF_CHUNK = CHUNK_SIZE;

    const chunkCount =
        file.size % CHUNK_SIZE === 0
            ? file.size / CHUNK_SIZE
            : Math.floor(file.size / CHUNK_SIZE) + 1;

    return new Promise((resolve, reject) => {
        if (socket) {
            socket.emit('client/sendFileMetaData', {
                // name: `${Date.now().toString()}.${file.name.split('.')[1]}`,
                name:file.name,
                type: file.type.split('/')[0],
                size:file.size,
            });
            dispatch(setUploadStatus('Meta sent'))

            socket
                .off('server/receivedFileMeta')
                .on('server/receivedFileMeta', ({ id, status, message }) => {
                    let i = 0;
                    uploadChunk(
                        id,
                        file,
                        i,
                        chunkCount,
                        BEGINNING_OF_CHUNK,
                        ENDING_OF_CHUNK
                    );

                    BEGINNING_OF_CHUNK += CHUNK_SIZE;
                    ENDING_OF_CHUNK += CHUNK_SIZE;
                    i++;
                    socket
                        .off('server/chunkReceived')
                        .on('server/chunkReceived', ({isValidChunk,uploadedPercentage}) => {
                            dispatch(setUploadStatus('Uploading'))
                            dispatch(setUploadPercentage(uploadedPercentage));
                            if (!isValidChunk) {
                                console.log('Chunk failed at ' + i);
                                uploadChunk(
                                    id,
                                    file,
                                    i,
                                    chunkCount,
                                    BEGINNING_OF_CHUNK,
                                    ENDING_OF_CHUNK
                                );
                            } else if (i <= chunkCount) {
                                uploadChunk(
                                    id,
                                    file,
                                    i,
                                    chunkCount,
                                    BEGINNING_OF_CHUNK,
                                    ENDING_OF_CHUNK
                                );

                                BEGINNING_OF_CHUNK += CHUNK_SIZE;
                                ENDING_OF_CHUNK += CHUNK_SIZE;
                                i++;
                            } else {
                                dispatch(setUploadStatus('Uploaded'));
                                dispatch(setUploadPercentage(0));
                                socket.emit('client/chunkSendComplete', {
                                    id
                                });
                                socket.off('server/sendFileInfo').on('server/sendFileInfo',({
                                    fileInfo
                                })=>{
                                    resolve(fileInfo)
                                })
                            }
                        });
                });

            socket.off('error').on('error', (err) => {
                console.error(err);
                reject(err);
            });
        }
    });
}

export const SocketFileUploader = async (filesArray = []) => {
    return new Promise(async (resolve, reject) => {
        const resultArray = [];

        try {
            for (let i = 0; i < filesArray.length; i++) {
                const res = await uploadFile(filesArray[i]);
                resultArray.push(res.message);
            }

            resolve(resultArray);
        } catch (err) {
            reject(err);
        }
    });
};

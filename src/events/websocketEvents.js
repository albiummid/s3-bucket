const { handleStartUpload, handleUpload } = require("../controllers/websocket/fileUpload.controller");

const websocketEvents = [
    {
        event:'test',
        controller:()=>{

        },
    },
    {
        event:'StartUpload',
        controller:handleStartUpload,
    },
    {
        event:'Upload',
        controller:handleUpload
    }
]?.map((x, id) => ({
    id,
    ...x,
}));

module.exports = websocketEvents
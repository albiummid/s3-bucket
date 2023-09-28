const websocketEvents = require("./events/websocketEvents");


const socketManager = async function (io) {
    io.on("connection", (socket) => {
        console.log(`⚡: ${socket.id} user just connected!\n`);

        // Rendering controllers
        websocketEvents?.map((x) => {
            const context = {
                socket,
                io,
                event: x.event,
            };
            wsContext = context;

            if (!x.event || !x.controller) {
                return console.log(
                    "No event or controller provided in event :",
                    x.id
                );
            }
            socket.on(x.event, (...payload) => {
                // Controller
                x.controller(payload, context);

                // Logger - to log anything in a particular block => just add a function in logger property in that object.
                if (x?.logger) {
                    x.logger(payload);
                }
            });
        });

        socket.on("disconnect", () => {
            console.log("🔥: A user disconnected\n");
        });
    });
};

const wsEmit = (event, ...rest) => {
    global.io.emit(event, ...rest);
};

module.exports = {
    socketManager,
    wsEmit,
};

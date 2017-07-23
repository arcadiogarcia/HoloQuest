var heimdall = (function () {

    //Here is where you should put all your rendering code, which will be private
    var library = null;
    var cachedLogs = [];
    var log = function (x) { cachedLogs.push(x) };
    var engineMessageHandler = function () { };

    var cachedMessages = [];

    var sendMessage = function (message) {
        if (message[0] != "registerSendMessage") {
            cachedMessages.push(message);
        }
    };

    var sendIndividualMessage = [];

    var onError = function (e) {
        log(JSON.stringify(e));
    }

    var playerId = 0;

    var onServerAccept = function (eventArgument) {
        log("Connection accepted");
        var tcpSocket = eventArgument.socket;
        var writer = new Windows.Storage.Streams.DataWriter(tcpSocket.outputStream);
        var tcpReader = new Windows.Storage.Streams.DataReader(tcpSocket.inputStream);
        sendIndividualMessage[playerId] = function (message) {
            message = JSON.stringify(message);
            writer.writeInt32(writer.measureString(message));
            writer.writeString(message);
            writer.storeAsync();
        };
        sendMessage = function (message) {
            sendIndividualMessage.forEach(function (fn) {
                if (fn) {
                    fn(message);
                }
            })
        }
        cachedMessages.forEach(sendMessage);
        engineMessageHandler({ player: playerId, data: ["playerConnected"] });
        startServerRead(tcpReader, playerId++);
    }

    var tcpListener = new Windows.Networking.Sockets.StreamSocketListener("87776");
    tcpListener.addEventListener("connectionreceived", onServerAccept);
    tcpListener.bindServiceNameAsync("87776", Windows.Networking.Sockets.SocketProtectionLevel.plainSocket).done(function () {
        log("Bind successful");
    }, onError);

    window.listener = tcpListener;

    var startServerRead = function (tcpReader, playerId) {
        tcpReader.loadAsync(4).done(function (sizeBytesRead) {
            // Make sure 4 bytes were read.
            if (sizeBytesRead !== 4) {
                //Connection lost
                return;
            }
            // Read in the 4 bytes count and then read in that many bytes.
            var count = tcpReader.readInt32();
            return tcpReader.loadAsync(count).then(function (stringBytesRead) {
                // Make sure the whole string was read.
                if (stringBytesRead !== count) {
                    //Connection lost
                    return;
                }
                // Read in the string.
                try {
                    var string = tcpReader.readString(count);
                    var data = JSON.parse(string);
                    engineMessageHandler({ player: playerId, data: data });
                } catch (e) {
                    log(e);
                }

                // Restart the read for more bytes.
                startServerRead(tcpReader, playerId);
            }); // End of "read in rest of string" function.
        }, onError);
    }

    //And these are the public functions that the engine will use to talk to your library
    //You can leave the ones that aren't relevant for your implementation empty, and even send a warning via the debug handler
    return {
        setUp: function (canvas, nfps) {
            //This function receives a reference to a canvaselement and the number of fps requested
            return library.setUp(canvas, nfps);
        },
        pauseAll: function () {
            //This function prevents the animation from updating (e.g doesn't advance to the next frame on each animation)
            return library.pauseAll();
        },
        restart: function () {
            //This function stars the 'animation logic' again, after pauseAll is called
            return library.restart();
        },
        setCamera: function (x, y, z) {
            //This function sets the camera position
            return library.setCamera(x, y, z);
        },
        getCamera: function () {
            //This function gets the camera position
            return library.getCamera();
        },
        moveCameraX: function (x) {
            //This function moves the camera the specified distance in the x axis
            return library.moveCameraX(x)
        },
        moveCameraY: function (y) {
            //This function moves the camera the specified distance in the y axis
            return library.moveCameraY(y);
        },
        moveCameraZ: function (z) {
            //This function moves the camera the specified distance in the z axis
            return library.moveCameraZ(z);
        },
        loadSpritesheetJSONObject: function (newspritesheets) {
            //This function loads a list of spritesheets from an array of JSON objects
            if (sendMessage != null) {
                //Promises are used to send images before spritesheets and avoid race conditions
                var promises = [];
                for (var spNumber in newspritesheets) {
                    var spritesheet = newspritesheets[spNumber];
                    if (spritesheet.src) {
                        var newPromise = new Promise((function (src, res, rej) {
                            var img = new Image();
                            img.src = library.getWorkingFolder() + "/" + spritesheet.src;
                            img.onload = (function () {
                                var canvas = document.createElement('canvas');
                                canvas.width = this.naturalWidth;
                                canvas.height = this.naturalHeight;
                                canvas.getContext('2d').drawImage(this, 0, 0);
                                var imageData = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                                var msg = ["registerImage", src, imageData];
                                sendMessage(msg);
                                res();
                            })
                        }).bind(this, spritesheet.src));
                        promises.push(newPromise);
                    }
                }
                Promise.all(promises).then(function () {
                    var msg = ["loadSpritesheetJSONObject", JSON.stringify(newspritesheets)];
                    sendMessage(msg);
                });
            }
            return library.loadSpritesheetJSONObject(newspritesheets);
        },
        addObject: function (spritesheet, state, x, y, z, isstatic) {
            //This function creates an object rendered by the given spritesheet, at the given state, at the given positions and which might or not have an static position relative to the camera
            //This function returns the object id
            var id = library.addObject(spritesheet, state, x, y, z, isstatic);
            if (sendMessage != null) {
                var msg = ["addObject", id, spritesheet, state, x, z, y, isstatic];
                sendMessage(msg);
            }
            return id;
        },
        deleteObject: function (id) {
            //This function deletes the object with the given id
            if (sendMessage != null) {
                var msg = ["deleteObject", id];
                sendMessage(msg);
            }
            return library.deleteObject(id);
        },
        clear: function () {
            //This function removes all the objects
            if (sendMessage != null) {
                var msg = ["clear"];
                sendMessage(msg);
            }
            return library.clear();
        },
        pause: function (id) {
            //This function prevents the animation of an specific object from updating
            if (sendMessage != null) {
                var msg = ["pause", id];
                sendMessage(msg);
            }
            return library.pause(id);
        },
        unpause: function (id) {
            //This function restarts the animation of an specific object
            if (sendMessage != null) {
                var msg = ["unpause", id];
                sendMessage(msg);
            }
            return library.unpause(id);
        },
        setX: function (id, x) {
            //This function sets the x coordinate of an object
            if (sendMessage != null) {
                var msg = ["setX", id, x];
                sendMessage(msg);
            }
            return library.setX(id, x);
        },
        setY: function (id, y) {
            //This function sets the y coordinate of an object
            if (sendMessage != null) {
                var msg = ["setZ", id, y];
                sendMessage(msg);
            }
            return library.setY(id, y);
        },
        setZ: function (id, z) {
            //This function sets the z coordinate of an object
            if (sendMessage != null) {
                var msg = ["setY", id, z];
                sendMessage(msg);
            }
            return library.setZ(id, z);
        },
        setParameter: function (id, key, value) {
            //This function sets a parameter of an object
            //Dont do it for now, since it is not recognized by the HoloLens app
            // if (sendMessage != null) {
            //     var msg = ["setParameter", id, key, value];
            //     sendMessage(msg);
            // }
            return library.setParameter(id, key, value);
        },
        setState: function (id, state) {
            //This function sets the state of an object
            if (sendMessage != null) {
                var msg = ["setState", id, state];
                sendMessage(msg);
            }
            return library.setState(id, state);
        },
        setSpritesheet: function (id, s) {
            //This function sets the spritesheet of an object
            if (sendMessage != null) {
                var msg = ["setSpritesheet", id, s];
                sendMessage(msg);
            }
            return library.setSpritesheet(id, s);
        },
        sendCommand: function (command, commandArgs) {
            //This function sends a command to your library, you can use this an extension point to provide additional functionality
            if (command == "registerEngineMessageHandler") {
                engineMessageHandler = commandArgs;
                return;
            }
            if (command == "setObjectStatus") {
                switch (commandArgs.status) {
                    case "locked":
                    case "cleared":
                        var msg = ["setState", commandArgs.object, "hidden"];
                        sendIndividualMessage[commandArgs.player](msg);
                        break;
                    case "active":
                        var msg = ["setState", commandArgs.object, "visible"];
                        sendIndividualMessage[commandArgs.player](msg);
                        break;
                }
                return;
            }
            if (command == "registerCustomImage") {
                var msg = ["registerCustomImage", commandArgs.object, commandArgs.image];
                sendMessage(msg);
                return;
            }
            if (sendMessage != null) {
                var msg = ["sendCommand", command, JSON.stringify(commandArgs)];
                sendMessage(msg);
            }
            return library.sendCommand(command, commandArgs);
        },
        setObjectTimer: function (id, t) {
            //Sets the internal time of an object
            if (sendMessage != null) {
                var msg = ["setObjectTimer", id, t];
                sendMessage(msg);
            }
            return library.setObjectTimer(id, t);
        },
        getObjectTimer: function (id) {
            //Gets the internal time of an object
            return library.getObjectTimer(id);
        },
        setEndedCallback: function (id, callback) {
            //Sets a callback that will activate when the current animation of an object stops
            return library.setEndedCallback(id, callback);
        },
        setRenderMode: function (mode) {
            //Sets a render mode, a function that will draw the buffer into the actual canvas
            //It can be used for scaling and applying effects
            return library.setRenderMode(mode);
        },
        setBufferSize: function (w, h) {
            //Sets the size of the internal buffer frame
            return library.setBufferSize(w, h);
        },
        getContext: function () {
            //Returns the drawing context of the canvas
            return library.getContext();
        },
        chainWith: function (renderingLibrary) {
            //Chains to an instance of another rendering library, used in 'proxy' libraries (for recording, networking, perspective...)
            library = renderingLibrary;
        },
        getSpriteBox: function (spritesheet, state) {
            //Gets the bounding box of an spritesheet (the one that encompasses all states, or just for one state if it is specified)
            return library.getSpriteBox(spritesheet, state);
        },
        debug: function (handler) {
            //Turns the debug mode ON and sets a handler that will be used to log all the errors that happen.
            //The handler will be called like this: 'handler("Something happened");' to display warnings and errors
            log = handler;
            cachedLogs.forEach(log);
            return library.debug(handler);
        },
        setWorkingFolder: function (folder) {
            //Sets the path from which assets should be loaded
            return library.setWorkingFolder(folder);
        },
        getWorkingFolder: function () {
            //Returns the working folder
            return library.getWorkingFolder();
        }
    };
});

CLOCKWORKRT.rendering.register("heimdall", heimdall);
CLOCKWORKRT.rendering.setPipeline(["heimdall", "spritesheet"]);
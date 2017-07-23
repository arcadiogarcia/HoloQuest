CLOCKWORKRT.components.register([
    {
        name: "background",
        sprite: "background"
    },
    {
        name: "player",
        sprite: "player",
        events: [
            {
                name: "#setup", code: function (data) {
                    var that = this;
                    this.var.$angle = 0;
                    this.engine.var.level.forEach(function (object) {
                        if (object.requires && that.engine.find(object.id)) {
                            if (object.requires.length == 0) {
                                object.playerStatus[that.var.id] = "active";
                                that.engine.getRenderingLibrary().sendCommand("setObjectStatus", { status: "active", player: that.var.id, object: that.engine.find(object.id).spriteholder });
                            } else {
                                object.playerStatus[that.var.id] = "locked";
                                that.engine.getRenderingLibrary().sendCommand("setObjectStatus", { status: "locked", player: that.var.id, object: that.engine.find(object.id).spriteholder });
                            }
                        }
                    });
                    this.engine.do.addPlayer(this.var.id);
                }
            },
            {
                name: "updatePlayerPosition", code: function (data) {
                    if (data.player === this.var.id) {
                        this.var.$x = data.x;
                        this.var.$y = data.y;
                        this.engine.do.updateCameraPosition(data);
                    }
                }
            },
            {
                name: "updatePlayerGaze", code: function (data) {
                    if (data.player === this.var.id) {
                        this.var.$angle = Math.atan2(data.y, data.x);
                    }
                }
            },
            {
                name: "shootPlayerProjectile", code: function (data) {

                }
            },
                {
                name: "#loop", code: function (data) {
                        this.engine.var.objectClearedThisFrame = false;
                }
            },
            {
                name: "clearObject", code: function (id) {
                    var that = this;
                    var object = getObject(id);
                    

                    if (this.engine.var.objectClearedThisFrame != true && object.playerStatus[this.var.id] == "active") {
                        this.engine.var.objectClearedThisFrame = true;
                        object.playerStatus[this.var.id] = "cleared";
                        this.engine.getRenderingLibrary().sendCommand("setObjectStatus", { status: "cleared", player: this.var.id, object: this.engine.find(object.id).spriteholder });
                    } else {
                        return;
                    }

                    this.engine.do.updateProgress(this.var.id);
                    //Find if any new object can be unlocked
                    this.engine.var.level.forEach(function (object) {
                        if (object.requires && object.playerStatus[that.var.id] == "locked") { //If an object is locked and has requirements
                            if (object.requires.map(function (id) {
                                return getObject(id).playerStatus[that.var.id] == "cleared"; //Check if every required object is unlocked
                            }).reduce(function (x, y) { return x && y })) {
                                that.engine.debug.log("Enabling " + object.id)

                                object.playerStatus[that.var.id] = "active";
                                that.engine.getRenderingLibrary().sendCommand("setObjectStatus", { status: "active", player: that.var.id, object: that.engine.find(object.id).spriteholder });
                            }
                        }
                    });
                    function getObject(id) {
                        return that.engine.var.level.filter(function (object) {
                            return object.id == id;
                        })[0];
                    }
                }
            }
        ],
        collision: {
            player: [
                { "#tag": "player", x: 0, y: 0 },
            ]
        }
    },
    {
        name: "objectSpawner",
        events: [
            {
                name: "#setup", code: function (data) {
                    this.var.dx = 0;
                    this.var.dy = 0;
                }
            },
            {
                name: "updateCameraPosition", code: function (data) {
                    this.engine.var.$cameraX = data.x - 1266 / 2;
                    this.engine.var.$cameraY = data.y - 768 / 2;
                }
            },
            {
                name: "#collide", code: function (event) {
                    if (event.shape2tag == "click") {
                        // this.engine.addObjectLive("someBomb", "bomb", this.engine.var.$cameraX + event.data.x * 1266, this.engine.var.$cameraY + event.data.y * 768, 0);
                    }
                }
            }
        ],
        collision: {
            box: [
                { "#tag": "boundingBox", x: 0, y: 0, w: 1266, h: 768 },
            ]
        }
    },
    {
        name: "incomingDataHandler",
        events: [
            {
                name: "#setup", code: function (event) {
                    this.engine.getAnimationEngine().sendCommand("registerEngineMessageHandler", this.do.incomingData);
                }
            },
            {
                name: "incomingData", code: function (event) {
                    switch (event.data[0]) {
                        case "playerConnected":
                            this.engine.spawn("player" + event.player, "player", { $x: 0, $y: 0, $z: 0, id: event.player });
                            break;
                        case "move":
                            this.engine.do.updatePlayerPosition({ player: event.player, x: event.data[1].X, y: event.data[1].Z, z: event.data[1].Y });
                            this.engine.do.updatePlayerGaze({ player: event.player, x: event.data[2].X, y: event.data[2].Z, z: event.data[2].Y });
                            break;
                        case "tap":
                            this.engine.debug.log(JSON.stringify({ x: event.data[1].X, y: event.data[1].Z, z: event.data[1].Y }));
                            this.engine.do.tap({ player: event.player, head: { x: event.data[1].X, y: event.data[1].Z, z: event.data[1].Y }, gaze: { x: event.data[2].X, y: event.data[2].Z, z: event.data[2].Y } });
                            break;
                        case "surfaceAdded":
                            this.engine.do.surfaceAdded({ id: event.data[1], vertexes: event.data[2], indexes: event.data[3] });
                            break;
                        case "surfaceModified":
                            this.engine.do.surfaceModified({ id: event.data[1], vertexes: event.data[2], indexes: event.data[3] });
                            break;
                        case "surfaceRemoved":
                            this.engine.do.surfaceRemoved({ id: event.data[1] });
                            break;
                    }
                }
            }
        ]
    },
    {
        name: "meshRenderer",
        sprite: "meshRenderer",
        events: [
            {
                name: "#setup", code: function (event) {
                    this.var.$vertexes = {};
                    this.var.$images = {};
                }
            },
            {
                name: "surfaceAdded", code: function (event) {
                    this.var.$vertexes[event.id] = event.indexes.map(function (i) { return event.vertexes[i] });
                    this.do.generateSurface(event.id);
                }
            },
            {
                name: "surfaceModified", code: function (event) {
                    this.var.$vertexes[event.id] = event.indexes.map(function (i) { return event.vertexes[i] });
                    this.do.generateSurface(event.id);
                }
            },
            {
                name: "surfaceRemoved", code: function (event) {
                    this.var.$vertexes[event.id] = undefined;
                    this.var.$images[event.id] = undefined;
                }
            },
            {
                name: "generateSurface", code: function (id) {
                    var vertexes = this.vars.$vertexes[id];
                    var canvas = document.createElement('canvas');
                    var minX = vertexes.map(function (x) { return x.X }).reduce(function (a, b) { return a > b ? b : a; });
                    var maxX = vertexes.map(function (x) { return x.X }).reduce(function (a, b) { return a < b ? b : a; });
                    var minZ = vertexes.map(function (x) { return x.Z }).reduce(function (a, b) { return a > b ? b : a; });
                    var maxZ = vertexes.map(function (x) { return x.Z }).reduce(function (a, b) { return a < b ? b : a; });
                    canvas.width = maxX - minX;
                    canvas.height = maxZ - minZ;
                    var context = canvas.getContext("2d");
                    context.lineWidth = 1;
                    for (var i = 0; i < vertexes.length; i += 3) {
                        var a1 = vertexes[i];
                        var a2 = vertexes[i + 1];
                        var a3 = vertexes[i + 2];
                        var depth = (a1.Y + a2.Y + a3.Y) / 2;
                        var r = (depth - (-400)) / (800) * 255;
                        var b = 255 - r;
                        context.beginPath();
                        context.moveTo(a1.X - minX, a1.Z - minZ);
                        context.lineTo(a2.X - minX, a2.Z - minZ);
                        context.lineTo(a3.X - minX, a3.Z - minZ);
                        context.lineTo(a1.X - minX, a1.Z - minZ);
                        context.strokeStyle = 'rgba(' + r + ',' + b + ',255,0.8)';
                        context.stroke();
                        context.fillStyle = 'rgba(' + r + ',' + b + ',255,0.3)';
                        context.fill();
                    }
                    this.var.$images[id] = { canvas: canvas, x: minX, y: minZ };
                }
            }
        ]
    }
]);
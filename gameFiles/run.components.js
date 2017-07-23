CLOCKWORKRT.components.register([
    {
        name: "levelLoader",
        events: [
            {
                name: "#setup", code: function (event) {
                    var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
                    openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
                    openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
                    openPicker.fileTypeFilter.replaceAll([".hq"]);
                    var that = this;
                    openPicker.pickSingleFileAsync().then(function (file) {
                        if (file) {
                            Windows.Storage.FileIO.readTextAsync(file).then(function (text) {
                                that.engine.var.level = JSON.parse(text).map(function (x) { x.playerStatus = {}; return x; });
                                that.do.levelLoaded(JSON.parse(text));
                            });
                        }
                    });
                }
            },
            {
                name: "levelLoaded", code: function (level) {
                    var that = this;
                    var levelLength = 0;
                    level.forEach(function (object) {
                        var spawnedObject;
                        that.engine.debug.log(object.type);
                        switch (object.type) {
                            case "pin":
                                spawnedObject = that.engine.spawn(object.id, "pin", { id: object.id, $x: object.location[0], $y: object.location[1], $z: object.location[2], requires: object.requires });
                                levelLength++;
                                break;
                            case "text":
                                spawnedObject = that.engine.spawn(object.id, "text", { id: object.id, $x: object.location[0], $y: object.location[1], $z: object.location[2], requires: object.requires, text: object.text });
                                levelLength++;
                                break;
                            case "question":
                                spawnedObject = that.engine.spawn(object.id, "question", { id: object.id, $x: object.location[0], $y: object.location[1], $z: object.location[2], requires: object.requires, text: object.text, options: object.options });
                                levelLength++;
                                break;
                            case "prohibited":
                                spawnedObject = that.engine.spawn(object.id, "prohibited", { id: object.id, $x: object.location[0], $y: object.location[1], $z: object.location[2] });
                                break;
                        }
                    });
                    this.engine.var.levelLength = levelLength;
                }
            }
        ]
    },
    {
        name: "pin",
        sprite: "pin",
        events: [
            {
                name: "#setup", code: function (event) {
                    this.engine.getRenderingLibrary().sendCommand("setScale", { id: this.spriteholder, value: 0.1 });
                }
            },
            {
                name: "#collide", code: function (event) {
                    event.object.do.clearObject(this.var.id);
                }
            }
        ],
        collision: {
            worldObject: [
                { "#tag": "pin", x: 0, y: 0 },
            ]
        }
    },
    {
        name: "text",
        sprite: "text",
        events: [
            {
                name: "#setup", code: function (event) {
                    this.engine.getRenderingLibrary().sendCommand("setScale", { id: this.spriteholder, value: 0.1 });
                    var canvas = document.createElement('canvas');
                    canvas.width = 500;
                    canvas.height = 500;
                    var context = canvas.getContext("2d");
                    context.font = '20pt Calibri';
                    context.fillStyle = "#F0F";
                    var words = this.var.text.split(" ");
                    var i = 1;
                    while (words.length > 0) {
                        var text = "";
                        while (context.measureText(text + " " + words[0]).width < 490 && words.length > 0) {
                            text += " " + words.shift();
                        }
                        context.fillText(text, 5, i * 25);
                        i++;
                    }
                    var imageData = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                    this.engine.getRenderingLibrary().sendCommand("registerCustomImage", { object: this.spriteholder, image: imageData });
                }
            },
            {
                name: "tap", code: function (event) {
                    this.engine.do.clearObject(this.var.id);
                }
            }
        ],
        collision: {
            worldObject: [
                { "#tag": "text", x: 0, y: 0 },
            ]
        }
    },
    {
        name: "question",
        sprite: "question",
        events: [
            {
                name: "#setup", code: function (event) {
                    this.engine.getRenderingLibrary().sendCommand("setScale", { id: this.spriteholder, value: 0.1 });
                }
            },
            {
                name: "#collide", code: function (event) {
                    var canvas = document.createElement('canvas');
                    canvas.width = 500;
                    canvas.height = 500;
                    var context = canvas.getContext("2d");
                    context.font = '20pt Calibri';
                    context.fillStyle = "#F0F";
                    var words = this.var.text.split(" ");
                    var i = 1;
                    while (words.length > 0) {
                        var text = "";
                        while (context.measureText(text + " " + words[0]).width < 490 && words.length > 0) {
                            text += " " + words.shift();
                        }
                        context.fillText(text, 5, i * 25);
                        i++;
                    }
                    var imageData = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                    this.engine.getRenderingLibrary().sendCommand("registerCustomImage", { object: this.spriteholder, image: imageData });
                }
            },
            {
                name: "tap", code: function (event) {
                    this.engine.do.clearObject(this.var.id);
                }
            }
        ]
    },
    {
        name: "prohibited",
        sprite: "prohibited",
        events: [
            {
                name: "#setup", code: function (event) {
                    this.engine.getRenderingLibrary().sendCommand("setScale", { id: this.spriteholder, value: 0.1 });
                }
            }
        ],
        collision: {
            worldObject: [
                { "#tag": "prohibited", x: 0, y: 0 },
            ]
        }
    },
    {
        name: "studentTracker",
        events: [
            {
                name: "#setup", code: function (event) {
                    var div = document.createElement("div");
                    div.id = "studentTracker";
                    div.style = "position:absolute;right:0px;top:0px;width:100px;height:100%;background:#033;";
                    document.body.appendChild(div);
                }
            },
            {
                name: "addPlayer", code: function (id) {
                    var div = document.createElement("div");
                    div.id = "player" + id;
                    div.style = "display:block;width:80px;padding:10px;margin-top:20px;background:#066;";
                    div.innerHTML = "<div id='playername" + id + "' >Student #" + id + "</div><div id='playerprogress" + id + "' >0/" + this.engine.var.levelLength + "</div><div id='playerwarnings" + id + "' ></div>";
                    document.getElementById("studentTracker").appendChild(div);
                }
            },
            {
                name: "updateProgress", code: function (id) {
                    var progress = 0;
                    this.engine.var.level.forEach(function (object) {
                        if (object.requires && object.playerStatus[id] == "cleared") {
                            progress++;
                        }
                    });
                    document.getElementById("playerprogress" + id).innerHTML = progress + "/" + this.engine.var.levelLength;
                }
            },
            {
                name: "playerWarning", code: function (event) {
                    document.getElementById("playerwarnings" + event.id).innerHTML = event.warning;
                }
            }
        ]
    }
]);
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
                    level.forEach(function (object) {
                        var spawnedObject;
                        that.engine.debug.log(object.type);
                        switch (object.type) {
                            case "pin":
                                spawnedObject = that.engine.spawn(object.id, "pin", { id: object.id, $x: object.location[0], $y: object.location[1], $z: object.location[2], requires: object.requires });
                                break;
                            case "text":
                                spawnedObject = that.engine.spawn(object.id, "text", { id: object.id, $x: object.location[0], $y: object.location[1], $z: object.location[2], requires: object.requires, text: object.text });
                                break;
                            case "question":
                                spawnedObject = that.engine.spawn(object.id, "question", { id: object.id, $x: object.location[0], $y: object.location[1], $z: object.location[2], requires: object.requires, text: object.text, options: object.options });
                                break;
                            case "prohibited":
                                spawnedObject = that.engine.spawn(object.id, "prohibited", { id: object.id, $x: object.location[0], $y: object.location[1], $z: object.location[2] });
                                break;
                        }
                    });
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
        sprite: "prohibited"
    }
]);
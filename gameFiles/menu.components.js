CLOCKWORKRT.components.register([
    {
        name: "menuButton",
        sprite: "menuButton",
        events: [
            {
                name: "#setup", code: function (event) {
                    this.var.$text = this.var.text;
                }
            },
            {
                name: "#collide", code: function (event) {
                    if (event.shape2tag == "click") {
                        this.engine.loadLevel(this.var.target);
                    }
                }
            }
        ],
        collision: {
            box: [
                { "#tag": "button", x: 0, y: 0, w: 600, h: 200 }
            ]
        },
    },
    {
        name: "levelLoader",
        events: [
            {
                name: "#setup", code: function (event) {
                    var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
                    openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
                    openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
                    openPicker.fileTypeFilter.replaceAll([".hq"]);
                    var that=this;
                    openPicker.pickSingleFileAsync().then(function (file) {
                        if (file) {
                            Windows.Storage.FileIO.readTextAsync(file).then(function(text){
                                that.engine.do.levelLoaded(text);
                            });
                        }
                    });
                }
            }
        ]
    }
]);
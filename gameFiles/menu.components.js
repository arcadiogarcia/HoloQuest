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
        name: "editorLoader",
        events: [
            {
                name: "#setup", code: function (event) {
                    var that = this;
                    var uri = new Windows.Foundation.Uri(CLOCKWORKRT.API.appPath() + "/html/editor.html");
                    var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
                        Windows.Storage.FileIO.readTextAsync(file).done(function (x) {
                            document.body.removeChild(that.engine.var["#DOM"]);
                            document.body.innerHTML = x;

                            document.getElementById("map").appendChild(that.engine.var["#DOM"]);
                        });
                    }, function (x) {
                        that.engine.debug.log(x);
                    });

                    var uri = new Windows.Foundation.Uri(CLOCKWORKRT.API.appPath() + "/html/editor.css");
                    var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
                        Windows.Storage.FileIO.readTextAsync(file).done(function (x) {
                            var head = document.getElementsByTagName('head')[0];
                            var style = document.createElement('style');
                            style.innerHTML = x;
                            head.appendChild(style);
                        });
                    }, function (x) {
                        that.engine.debug.log(x);
                    });


                }
            }
        ]
    }
]);
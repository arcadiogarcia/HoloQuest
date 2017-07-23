document.getElementById("saveButton").addEventListener("click", saveNode);
document.getElementById("pinButton").addEventListener("click", newPin);
document.getElementById("backButton").addEventListener("click", window.back);
document.getElementById("saveButton").addEventListener("click", save);
var nodes = [];


function save() {
    var openPicker = new Windows.Storage.Pickers.FileSavePicker();
    openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
    openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
    openPicker.fileTypeFilter.replaceAll([".hq"]);
    var that = this;
    openPicker.pickSaveFileAsync().then(function (file) {
        if (file) {
            Windows.Storage.FileIO.WriteTextAsync(file,JSON.stringify(nodes)).then(function (text) {
            });
        }
    });
}

//SIGMA
var s = new sigma('container');

s.settings({
    defaultEdgeColor: '#000',
    minArrowSize: 10
});


function hideExtraOptions() {
    document.getElementById("textPinFields").style.display = "none";
    document.getElementById("imagePinFields").style.display = "none";
    document.getElementById("questionPinFields").style.display = "none";
}

function showExtraOptions(type) {
    document.getElementById(type + "PinFields").style.display = "inline";
}

function clearOptions() {
    document.getElementById("pinFields").style.display = "none";
}

function typeChange() {
    hideExtraOptions();
    showExtraOptions(document.getElementById("pinType").value);
}

function generateQuestionFields() {
    var n = document.getElementById("pinNAnswers").value;
    var s = ""
    for (var i = 0; i < n; i++) {
        s += "<textarea id='a" + i + "'></textarea><br>"
    }
    document.getElementById("pinAnswers").innerHTML = s;
}

// function updateCanvas(){
//     var c = document.getElementById("canvas").getContext("2d");
//     c.fillStyle="goldenrod";
//     c.fillRect(0, 0, 10000, 10000);
// }

function newPin() {
    document.getElementById("pinLabel").value = "";
    document.getElementById("pinSkin").value = "red";
    document.getElementById("pinX").value = "";
    document.getElementById("pinY").value = "";
    document.getElementById("pinRequirements").value = "";
    document.getElementById("pinType").value = "pin";

    hideExtraOptions();

    document.getElementById("pinFields").style.display = "inline";
}

function saveNode() {
    var label = document.getElementById("pinLabel").value;
    var skin = document.getElementById("pinSkin").value;
    var x = document.getElementById("pinX").value;
    var y = document.getElementById("pinY").value;
    var requirements = document.getElementById("pinRequirements").value;
    if (requirements == "") {
        requirements = [];
    } else {
        requirements = requirements.split(', ')
    }
    var type = document.getElementById("pinType").value;

    var colors = [{ name: "red", color: "#f00" }, { name: "yellow", color: "#ff0" }, { name: "green", color: "#0f0" }, { name: "cyan", color: "#0ff" }, { name: "blue", color: "#00f" }, { name: "pink", color: "#f0f" }]
    var nodeColor = colors.filter(function (x) { return x.name == skin })[0].color;

    var newNode = { "label": label, "skin": skin, "x": x, "y": y, "requirements": requirements, "type": type, "size": 1, "color": nodeColor };

    switch (type) {
        case "text":
            newNode.text = document.getElementById("pinText").value;
            break;
        case "image":
            newNode.img = document.getElementById("pinImage").value;
            break;
        case "question":
            newNode.question = document.getElementById("pinQuestion").value;
            var answers = [];
            for (var i = 0; i < document.getElementById("pinNAnswers").value; i++) {
                answers.push(document.getElementById("a" + i).value)
            }
            newNode.answers = answers;
            break;
        default: break;
    }

    var existingNode = nodes.filter(function (x) { return x.label == label });
    if (existingNode.length == 0) {
        newNode.id = nodes.length
        nodes.push(newNode);
        s.graph.addNode(newNode);
        //Edges
        if (newNode.requirements.length > 0) {
            newNode.requirements.forEach(function (x) {
                var rn = nodes.filter(function (y) { return y.label == x })[0];
                s.graph.addEdge({
                    id: rn.id + "to" + newNode.id,
                    source: rn.id,
                    target: newNode.id,
                    type: "arrow"
                });
            });
        }
    } else {
        newNode.id = existingNode[0].id;
        s.graph.dropNode(newNode.id);
        s.graph.addNode(newNode);
        nodes[nodes.indexOf(existingNode[0])] = newNode;
        //Edges
        if (newNode.requirements.length > 0) {
            newNode.requirements.forEach(function (x) {
                var rn = nodes.filter(function (y) { return y.label == x })[0];
                s.graph.addEdge({
                    id: rn.id + "to" + newNode.id,
                    source: rn.id,
                    target: newNode.id,
                    type: "curve",
                    head: "arrow",
                    edgeColor: "#000",
                    arrowSize: 100
                });
            });
        }
    }
    //console.log(JSON.stringify(nodes));

    //SIGMA
    s.bind('clickNode', function (e) {
        newPin();
        var selected = nodes.filter(function (x) { return x.label == e.data.node.label })[0];
        document.getElementById("pinLabel").value = selected.label;
        document.getElementById("pinX").value = selected.x;
        document.getElementById("pinY").value = selected.y;
        document.getElementById("pinRequirements").value = selected.requirements.toString();
        document.getElementById("pinType").value = selected.type;

        switch (type) {
            case "text":
                showExtraOptions("text");
                document.getElementById("pinText").value = selected.text;
                break;
            case "image":
                showExtraOptions("image");
                document.getElementById("pinImage").value = selected.img;
                break;
            case "question":
                showExtraOptions("question");
                document.getElementById("pinQuestion").value = selected.question;
                var answers = [];
                for (var i = 0; i < document.getElementById("pinNAnswers").value; i++) {
                    document.getElementById("a" + i).value = answers[i];
                }
                break;
            default: break;
        }
    });
    s.refresh();

    clearOptions();
}
// currently only supports videos less than an hour long

var window = new Window("palette", "Clip Video by Timestamps", undefined);
window.orientation = "column";

var groupOne = window.add("group", undefined, "groupOne");
groupOne.orientation = "row";
var timestampEditText = groupOne.add("edittext", undefined, "Timestamp File");
timestampEditText.size = [250, 25];
var timestampButton = groupOne.add("button", undefined, "...");
timestampButton.size = [25, 25];

var groupTwo = window.add("group", undefined, "groupTwo");
groupTwo.orientation = "row";
var startButton = groupTwo.add("button", undefined, "Start");

window.center();
window.show();

timestampButton.onClick = function() {
        var timestampFile = new File;
        timestampFile = timestampFile.openDlg("Choose timestamps file", "*.txt", false);
        
        if(timestampFile != null) {
            timestampEditText.text = timestampFile.fsName.replace(/%20/g, " ");
            } else {
            timestampEditText.text = "Timestamp File";
            alert("Not a valid file!");
            return false;
                }
    }

startButton.onClick = function() {
        if(!File(timestampEditText.text).exists) {
            alert("Please select a valid timestamp file first");
            return false;
            }
        
        if(app.project.activeItem == null || !(app.project.activeItem instanceof CompItem)) {
            alert("Please select a composition first");
            return false;
            }
        
        main(File(timestampEditText.text), app.project.activeItem);
    }

function main(timestampFile, comp) {
    
    //app.beginUndoGroup("Timestamp clip cutting");
    var timestampInfo;
    
    timestampFile.open("r");
    timestampInfo = timestampFile.read();
    timestampFile.close();
    
    var timestampRows = timestampInfo.split("\n");
    var clippedComps = [];
    
    var startTime = 0;
    var endTime;
    
    var rqItem;
    var module;
    
    for(var i = 0; i < timestampRows.length; i++) {
        clippedComps.push(comp.duplicate());
        clippedComps[i].name = timestampRows[i].slice(0, timestampRows[i].indexOf("-"));
        clippedComps[i].openInViewer();
        clippedComps[i].workAreaStart = startTime;
        if(timestampRows[i+1]) {
            endTime = convertToAETime(timestampRows[i+1].slice(timestampRows[i+1].indexOf("-")+2, timestampRows[i+1].length));
            } else {
            endTime = comp.duration;
                }
         clippedComps[i].workAreaDuration = endTime - startTime;
         startTime = endTime;
         
        rqItem = app.project.renderQueue.items.add(clippedComps[i]);
        module = rqItem.outputModule(1);
        module.file = File("~/Desktop/"+clippedComps[i].name+".avi");
        }
    
    app.project.renderQueue.queueInAME(true);  
    
    //app.endUndoGroup();
    }

function convertToAETime(timeString) {
    
    var minutesText = timeString.slice(0, timeString.indexOf(":"));
    var secondsText = timeString.slice(timeString.indexOf(":")+1, timeString.length);
    
    var aeMinutes = parseInt(minutesText) * 60;
    var aeSeconds = parseInt(secondsText);
    
    var finalTime = aeMinutes + aeSeconds;
    
    return finalTime;
    }
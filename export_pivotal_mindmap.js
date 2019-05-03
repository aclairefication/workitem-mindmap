//Export CSV from Pivotal Tracker and transform it into a Freemind XML file (with .mm file extension)
const fs = require('fs-extra'),
    builder = require('xmlbuilder'),
    csv = require('csv');
    // X2JS = require('x2js');
const _ = require('lodash');

//start with the Freemind mindmap header
let mindmap = builder.begin().ele('map', { 'version': '1.0.1' });

var projectName = 'Claire Personal Kanban';
let projectNode;

//CSV input file
var csv_parser = csv.parse();

csv_parser.on('readable', function(){
  while(data = csv_parser.read()){
    // transformer.write(data);

    //read in rows for epics, features, bugs, etc

    //Deal with nesting?

    //Build the tree


  }
});



fs.readFile('claire_s_kanban_20170926_1933.csv', 'utf-8', function(err, csv_input) {

    //XLS was an XML under the covers, but CSV is not
    bodyString = xml.slice(xml.indexOf('<tbody>'),xml.indexOf("</table></td>"));
    var x2js = new X2JS();
    var jsonObj = x2js.xml2js(bodyString);
    var jsonArrayOfBacklogItemRows = jsonObj.tbody.tr;

    //project is the center of the mindmap
    projectName = jsonArrayOfBacklogItemRows[0].td[2].__text;
    projectNode = mindmap.ele('node',{ 'TEXT': projectName});

    let currentNode = projectNode;

    //Find the highest number for level counter for the input file
    var parentLevel = _.reduce(jsonArrayOfBacklogItemRows, function(highestLevel, row){
        return Math.max(highestLevel, _.reduce(row.td,function(rowHighestLevel, entry){
            if(entry._colspan == null || (typeof entry._colspan === 'undefined')){
                return rowHighestLevel;
            }
            return Math.max(rowHighestLevel, parseInt(entry._colspan));
        }, 0));
    }, 0);

    jsonArrayOfBacklogItemRows.forEach(function(row) {
        //strip out indentation empty elements
        row.td = _.dropWhile(row.td, function(entry){
            return entry.length == 0;
        });

        backlogItemElements = row.td;

        //NOTE backlog level numeric value: the higher the number, the closer to the center of the mindmap
        nodeLevelCounter = backlogItemElements[0]._colspan;
        backlogItemName = backlogItemElements[0].__text;
        backlogItemID = backlogItemElements[1].__text;
        backlogItemBlockingText = backlogItemElements[3];
        backlogItemOwner = backlogItemElements[4].__text != null  && (typeof backlogItemElements[4].__text !== 'undefined') ? backlogItemElements[4].__text : '';
        backlogItemStatus = backlogItemElements[5].__text != null  && (typeof backlogItemElements[5].__text !== 'undefined') ? backlogItemElements[5].__text : '';

        //Conditionally set the background color based on Status of item
        let backgroundColor = setBackgroundColor(backlogItemStatus);

        //When status is not set, show a value in the mindmap
        let status = backlogItemStatus === '' ? '(None)' : backlogItemStatus;
        //only want to see blocking items text when there are blocking items
        let blocked = backlogItemBlockingText === 'Blocking Issues: 0' ? '' : backlogItemBlockingText;
        //When owner is not set, show a value in the mindmap
        let owner = backlogItemOwner === '' ? '(None)' : backlogItemOwner;

        if(currentNode != projectNode){
            var timesToGoUp = (nodeLevelCounter - parentLevel) + 1;
            for(var i = 0; i < timesToGoUp; i++){
                currentNode = currentNode.up();
            }
        }

        currentNode = currentNode.ele('node', {
            'BACKGROUND_COLOR': backgroundColor, //derived from Status
            'TEXT':backlogItemID + ' '+ backlogItemName + ' Status: ' + status + ' ' + blocked + ' Owner: ' + owner
            // 'POSITION': 'right' //TODO balance the tree between left & right?
        });

        if(blocked !== ''){
            //An icon node looks like this <icon BUILTIN="messagebox_warning"/>
            currentNode.ele('icon', {'BUILTIN': 'messagebox_warning'});
        }

        parentLevel = nodeLevelCounter;

    });

    //write out to file
    fs.writeFile('mindmap.mm', mindmap.end({
        pretty: true,
        indent: '  ',
        newline: '\n',
        allowEmpty: true
    }), function(err, data){
        if (err) console.log(err);
    });

    console.log('end')

});

function setBackgroundColor(Status){
    //TODO refactor to take color-status associations from a config file
    //Conditionally set the background color based on Status of item
    let backgroundColor = '#ffffff'; //default to plain white

    if(Status === '(None)' || Status === ''){
        backgroundColor = '#999999'; //gray
    } else if (Status === 'Done') {
        backgroundColor = '#00cc00'; //green
    } else if (Status === 'In Progress' || Status === 'Dev in Progress' || Status === 'Ready for Test'){
        backgroundColor = '#ffff66'; //yellow
    } else if (Status === 'Ready for Dev'){
        backgroundColor = '#ff0033'; //red
    } else if (Status === 'completed'){
        backgroundColor = '#3366ff'; //blue
    }

    return backgroundColor
}
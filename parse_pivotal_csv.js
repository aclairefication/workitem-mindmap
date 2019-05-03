//Export CSV from Pivotal Tracker and transform it into a Freemind XML file (with .mm file extension)
const fs = require('fs-extra'),
    builder = require('xmlbuilder'),
    csv = require('csv');
    // X2JS = require('x2js');
const _ = require('lodash');

//start with the Freemind mindmap header
let mindmap = builder.begin().ele('map', { 'version': '1.0.1' });

//TODO read in project name as a command line argument 
var projectName = 'Claire Personal Kanban';
let projectNode;

//CSV input file
var csv_parser = csv.parse();

//TODO read in CSV file
csv_parser.on('readable', function(){
  while(data = csv_parser.read()){
    // transformer.write(data);

    //read in rows for epics, features, bugs, etc
    //build JSON
    //var jsonArrayOfBacklogItemRows = 

    //Deal with nesting?

    //Build the tree


  }

});

    projectNode = mindmap.ele('node',{ 'TEXT': projectName});

    let currentNode = projectNode;

    jsonArrayOfBacklogItemRows.forEach(function(row) {
        //strip out indentation empty elements
        row.td = _.dropWhile(row.td, function(entry){
            return entry.length == 0;
        });

        backlogItemElements = row.td;

        //fixed columns: Id,Title,Labels,Iteration,Iteration Start,Iteration End,Type,Estimate,Current State,Created at,Accepted at,Deadline,Requested By,Description,URL
        //Zero or more owners possible
        //variable columns: Owned By,Owned By,
        //Zero or more comments possible
        //variable columns: Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment
        //Zero or more tasks possible
        //variable columns: Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status



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
        let owner = backlogItemOwner === '' ? '(None)' : backlogItemStatus;

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

function setBackgroundColor(Status){
    //TODO refactor to take color-status associations from a config file
    //Conditionally set the background color based on Status of item
    let backgroundColor = '#ffffff'; //default to plain white

    if(Status === '' || Status === 'unstarted' || Status === 'unscheduled'){
        backgroundColor = '#999999'; //gray
    } else if (Status === 'started' || Status === 'finished' || Status === 'delivered'){
        backgroundColor = '#ffff66'; //yellow
    } else if (Status === 'completed') {
        backgroundColor = '#00cc00'; //green
    } else if (Status === 'rejected'){
        backgroundColor = '#ff0033'; //red
    } else if (Status === 'accepted'){
        backgroundColor = '#3366ff'; //blue
    }

    return backgroundColor
}
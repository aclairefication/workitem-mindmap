const fs = require('fs-extra'),
    builder = require('xmlbuilder'),
    csv = require('csvtojson');

//General row format:
//fixed columns: Id,Title,Labels,Iteration,Iteration Start,Iteration End,Type,Estimate,Current State,Created at,Accepted at,Deadline,Requested By,Description,URL
//Zero or more owners possible
//variable columns: Owned By,Owned By,
//Zero or more comments possible
//variable columns: Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment,Comment
//Zero or more tasks possible
//variable columns: Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status,Task,Task Status

//start with the Freemind mindmap header
let mindmap = builder.begin().ele('map', { 'version': '1.0.1' });

//project is the center of the mindmap
var projectName = 'Claire Personal Kanban';
var projectNode = buildCenterNode(projectName);
//TODO pass this file name as a command line argument
const csvFilePath='claire_s_kanban_20170926_1933.csv';

//TODO define the center node as part of the file path/file name??
//TODO trim off the file extension and date-timestamp
//TODO use the rest of the filename as center node for the tree?

//Nodes for the tree
var epics = [];
var workitems = []; //either story or bug

//Encoding for the nodes
var statuses = [];
var epicLabels = [];
var otherLabels = [];

// console.log(csvFilePath);

csv()
.fromFile(csvFilePath)
.on('json',(backlogJson)=>{

	sortTheNodes(backlogJson, projectNode);

	//Build the list of statuses
	var currentStatus = backlogJson["Current State"];
	buildStatusList(currentStatus);

	// buildNode(backlogJson);

	//TODO for each JSON object build the tree for the object
	// jsonArrayOfBacklogItemRows.forEach(function(row) {
	    // console.log(backlogJson.Id);
	// });

	//TODO once the epics are attached to the center, loop back through to attach the stories to the epics
	//TODO for each story, attach a node to its epic that includes ID and Title
	//TODO then for each story, attach its iteration info + its status info + its owners + its comments + its tasks + its labels (that aren't epics)

})
.on('done',(error)=>{
	console.log("epic labels contains ", epicLabels);
	console.log("other labels contains ", otherLabels);
	console.log("workitem statuses are ", statuses);

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

function buildCenterNode(projectName){

    let currentNode = mindmap.ele('node',{ 'TEXT': projectName});

	return currentNode;
}

function sortTheNodes(BacklogItem, currentNode){
	//TODO figure out the type of row I'm dealing with - want epics attached to the center (project) node
	//Figure out what type of backlog item this is
	if(BacklogItem.Type === 'epic') {
		//TODO in the JSON, find the epic elements & add them to the root
		//TODO add the epic to the root project node
		console.log(BacklogItem.Id + ' ' + BacklogItem.Title + ' is an epic');

		buildNode(BacklogItem, currentNode);

		//QUESTION how can I tell when a label is an epic? (vs just a label)
		buildEpicLabelsList(BacklogItem)
		//TODO use these epic labels to build the tree
	} else if(BacklogItem.Type === 'feature') {
		//TODO add the feature to the tree where the epic lives

		buildNode(BacklogItem, currentNode);

		buildNonEpicLabelsList(BacklogItem);
	} else if(BacklogItem.Type === 'bug') {
		//TODO add the bug to the tree where the epic lives
		//TODO differentiate a bug from a feature

		buildNode(BacklogItem, currentNode);

		buildNonEpicLabelsList(BacklogItem);
	}	
}

function buildNode(BacklogItem, currentNode){
    // backlogItemBlockingText = backlogItemElements[3];
    backlogItemID = BacklogItem.Id;
    backlogItemName = BacklogItem.Title;
    backlogItemRequester = BacklogItem["Requested By"] != null  && (typeof BacklogItem["Requested By"] !== 'undefined') ? BacklogItem["Requested By"] : '';
    backlogItemStatus = BacklogItem["Current State"];

    //Use status to color the backlog item nodes
	var backgroundColor = setBackgroundColor(BacklogItem, backlogItemStatus);
	// console.log(backgroundColor);
	//Q: Should the epic nodes be colored differently? (Maybe leave them the default white?)

    //When status is not set, show a value in the mindmap
    let status = backlogItemStatus === '' ? '(None)' : backlogItemStatus;
    //only want to see blocking items text when there are blocking items
    // let blocked = backlogItemBlockingText === 'Blocking Issues: 0' ? '' : backlogItemBlockingText;
    //When owner is not set, show a value in the mindmap
    let owner = backlogItemRequester === '' ? '(None)' : backlogItemRequester;

    currentNode = currentNode.ele('node', {
        'BACKGROUND_COLOR': backgroundColor, //derived from Status
        'TEXT':backlogItemID + ' '+ backlogItemName + ' Status: ' + status + ' ' + ' Owner: ' + owner
        // 'TEXT':backlogItemID + ' '+ backlogItemName + ' Status: ' + status + ' ' + blocked + ' Owner: ' + owner
        // 'POSITION': 'right' //TODO balance the tree between left & right?
    });

    // if(blocked !== ''){
    //     //An icon node looks like this <icon BUILTIN="messagebox_warning"/>
    //     currentNode.ele('icon', {'BUILTIN': 'messagebox_warning'});
    // }	

    //TODO add a child node for the URL?
    // backlogItemURL = BacklogItem.URL;
}

function setBackgroundColor(BacklogItem, Status){
    //TODO refactor to take color-status associations from a config file
    //Conditionally set the background color based on Status of item
    let backgroundColor = '#ffffff'; //default to plain white

    if(Status === 'unstarted' || Status === 'unscheduled' || Status === '' || Status === 'not set'){
		//This is 'not worked'
		console.log(BacklogItem.Id + ' ' + BacklogItem.Title + ' is not worked');
		//TODO different color from 'done' or 'in progress'    	
        backgroundColor = '#999999'; //gray
    } else if (Status  === 'started'){
		//This is 'in progress'
		console.log(BacklogItem.Id + ' ' + BacklogItem.Title + ' is in progress');
		//TODO different color from accepted
        backgroundColor = '#ffff66'; //yellow
    } else if (Status === 'accepted' || Status === 'delivered') {
		//This is 'done'
		console.log(BacklogItem.Id + ' ' + BacklogItem.Title + ' is accepted');
		//TODO different color from in progress
        backgroundColor = '#00cc00'; //green
    }

    return backgroundColor;
}

function buildStatusList(currentStatus){
	//Build the list of statuses
	if (currentStatus == ""){
		currentStatus = "not set";
	}
	if(!statuses.includes(currentStatus)){
		statuses.push(currentStatus);
	}	
}

function buildEpicLabelsList(BacklogItem){
	epicLabels.push(BacklogItem.Labels);	
}

function buildNonEpicLabelsList(BacklogItem){
	//make a list of the non-epic labels
	//TODO use these labels to add icons to the nodes in the tree?
	thisFeaturesLabels = BacklogItem.Labels.split(", ");
	thisFeaturesLabels.forEach(function(currentLabel){
		if (!epicLabels.includes(currentLabel) && !otherLabels.includes(currentLabel) 
			&& currentLabel !== ''){
			otherLabels.push(currentLabel);
		}			
	})
}
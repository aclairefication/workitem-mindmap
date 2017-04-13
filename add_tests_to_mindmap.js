//Export Backlog CSV from VersionOne LifeCycle and transform it into a Freemind XML file (with .mm file extension)
const fs = require('fs-extra'),
    builder = require('xmlbuilder'),
    X2JS = require('x2js');
const _ = require('lodash');

var mindmap;
var parentName = '';

//Read in the existing mindmap file so we can search and edit it
fs.readFile('mindmap.mm', 'utf-8', function(err, xml) {
    mindmap = xml; //TODO figure out whether this will actually work
});

fs.readFile('LC_Backlog_Tests_Tasks.xls', 'utf-8', function(err, xml) {

    bodyString = xml.slice(xml.indexOf('<tbody>'),xml.indexOf("</table></td>"));
    var x2js = new X2JS();
    var jsonObj = x2js.xml2js(bodyString);
    var jsonArrayOfBacklogItemRows = jsonObj.tbody.tr;

    //In the Backlog export, the order of fields is: Title, ID, Owner, Blocked, Portfolio Item (parent), Status
    //Tasks and Tests immediately follow the Primary Workitem in the file and end when the next primary workitem appears in the file

    //I think there should be special rules for adding test sets as branches off the stories they test (if there is an indication of the relationship)
    //For example, some test sets in our data have a story number in their name

    jsonArrayOfBacklogItemRows.forEach(function(row) {

        //For each row, if there is a colspan, then the row is a primary workitem (e.g. story, defect, testset)
        //If there is an empty cell at the beginning and some later in the row, then it is a secondary workitem (e.g. task, test)

        //Strip out indentation empty elements - so after this block, must use colspan to find the primaries
        row.td = _.dropWhile(row.td, function(entry){
            return entry.length == 0;
        });

        backlogItemElements = row.td;

        //TODO parse each primary workitem (can also tell it's primary from the prefix of the identifier)
        //In the Backlog export, the order of fields is: Title, ID, Owner, Blocked, Portfolio Item (parent), Status
        primaryWorkitemIndicator = backlogItemElements[0]._colspan != null  && (typeof backlogItemElements[0]._colspan !== 'undefined') ? backlogItemElements[0]._colspan : '';

        if(primaryWorkitemIndicator !== ''){
            //this is a primary workitem, so parse it like one
            backlogItemName = backlogItemElements[0].__text;
            backlogItemID = backlogItemElements[1].__text;
            backlogItemOwner = backlogItemElements[2].__text != null  && (typeof backlogItemElements[2].__text !== 'undefined') ? backlogItemElements[2].__text : '';
            backlogItemBlockingText = backlogItemElements[3];
            //portfolio item may not be set
            backlogPortfolioItem = backlogItemElements[4].__text != null  && (typeof backlogItemElements[4].__text !== 'undefined') ? backlogItemElements[4].__text : '';
            //status may not be set
            backlogItemStatus = backlogItemElements[5].__text != null  && (typeof backlogItemElements[5].__text !== 'undefined') ? backlogItemElements[5].__text : '';

            //Only primary workitems can have a Portfolio Item set
            if(backlogPortfolioItem !== ''){
                //TODO find the Portfolio Item in the existing mindmap

                //TODO once found, set the parentName to backlogPortfolioItem so we can use it when adding secondary workitems
                parentNode = backlogPortfolioItem;

                console.log("Found primary workitem " + backlogItemID + " " + backlogItemName + " " + backlogItemOwner + " " + backlogItemBlockingText + " " + parentNode + " " + backlogItemStatus)

            } else {
                //Portfolio Item is not set for this backlog item
                parentNode = '';
                //   TODO decide whether to skip them or add a special node for all the unattached workitems

                console.log("Found primary workitem " + backlogItemID + " " + backlogItemName + " " + backlogItemOwner + " " + backlogItemBlockingText + " " + parentNode + " " + backlogItemStatus)

            }
        } else {
            //this is a secondary workitem, so parse it like one
            //secondary workitems cannot be blocked (only primary workitems can)
            secondaryWorkitemName = backlogItemElements[0].__text;
            secondaryWorkitemId = backlogItemElements[1].__text;
            secondaryWorkitemOwner = backlogItemElements[2].__text != null  && (typeof backlogItemElements[2].__text !== 'undefined') ? backlogItemElements[2].__text : '';
            secondaryWorkitemStatus = backlogItemElements[3].__text != null  && (typeof backlogItemElements[3].__text !== 'undefined') ? backlogItemElements[3].__text : '';

            //this secondary workitem could not already be in the mindmap, so it must be added to its parent
            //TODO figure out how to tell whether the parent was successfully added - just search the mindmap file for the parent?
            //TODO what to do if the parent isn't found in the mindmap?

            //TODO build the XML for the secondary workitem
            //Conditionally set the background color based on Status of item
            let backgroundColor = setBackgroundColor(backlogItemStatus);

            //When status is not set, show a value in the mindmap
            let status = secondaryWorkitemStatus === '' ? '(None)' : secondaryWorkitemStatus;

            //When owner is not set, show a value in the mindmap
            let owner = secondaryWorkitemOwner === '' ? '(None)' : secondaryWorkitemOwner;

            //TODO once parent is found, add the built task or test XML to the mindmap nested in the parent node

            console.log("Found secondary workitem " + secondaryWorkitemId + " " + secondaryWorkitemName + " " + owner + " " + status)

        }

        // parentNode.ele('node', {
        //     'BACKGROUND_COLOR': backgroundColor, //derived from Status
        //     'TEXT':backlogItemID + ' '+ backlogItemName + ' Status: ' + status + ' ' + blocked + ' Owner: ' + owner
        //     // 'POSITION': 'right' //TODO balance the tree between left & right?
        // });

    });

    // //TODO figure out how to update existing file - will the following block overwrite?
    // fs.writeFile('mindmap.mm', mindmap.end({
    //     pretty: true,
    //     indent: '  ',
    //     newline: '\n',
    //     allowEmpty: true
    // }), function(err, data){
    //     if (err) console.log(err);
    // });

});

function setBackgroundColor(Status){
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
    } else if (Status === 'Accepted'){
        backgroundColor = '#3366ff'; //blue
    }

    return backgroundColor
}

function findPrimaryWorkitemInXML(primaryWorkitemId){
    //ASSUMES have read in the mindmap XML file (.mm extension)

    //TODO search the XML source for the primaryWorkitemId
    //TODO return a pointer to that part of the file (i.e. node in the tree?)... want to insert the secondary workitems here
    // return currentNode;
}

function buildSecondaryWorkitemXML(currentNode, backgroundColor, secondaryWorkitemId, secondaryWorkitemName, secondaryWorkitemStatusString, secondaryWorkitemOwnerString){
    currentNode = currentNode.ele('node', {
        'BACKGROUND_COLOR': backgroundColor, //derived from Status
        'TEXT':secondaryWorkitemId + ' '+ secondaryWorkitemName + ' Status: ' + secondaryWorkitemStatusString + ' Owner: ' + secondaryWorkitemOwnerString
        // 'POSITION': 'right' //TODO balance the tree between left & right?
    });

}
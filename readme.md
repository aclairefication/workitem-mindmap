# Workitem Mindmap

Create a [mind map](https://en.wikipedia.org/wiki/Mind_map) of your backlog's epics and stories, the workitems of your day-to-day development

[![Node.JS](https://img.shields.io/badge/node.js-3C873A.svg)](https://nodejs.org/en/)
[![NPM](https://img.shields.io/badge/npm-CC3534.svg)](https://www.npmjs.com/)
[![Issues](https://img.shields.io/github/issues/aclairefication/workitem-mindmap?color=blueviolet)](https://github.com/aclairefication/workitem-mindmap/issues)

## How can a mind map help me?

- Communicate more effectively with your product managers about your story status
- Manage your own engineering products or projects if you don't have a cross-functional team
- Share progress with your boss or mentor in your next 1on1 meeting

## What problem does this code solve?

Manual reporting is a time suck. My friend (a client) asked for some help...

[Slides](https://www.slideshare.net/aclairefication/blow-your-mind-mindmap-automation-in-node) or [Video](https://youtu.be/aTIB1_v6XuY)

## I'm sold! Now what?
1. Clone this repo to local
2. Export backlog from management tool (i.e. [Pivotal Tracker](https://www.pivotaltracker.com/)) & put it in the directory with the code
3. Modify the download file to be named Portfolio_Items.xls or [update the filename in export_mindmap.js](https://github.com/aclairefication/workitem-mindmap/blob/master/export_mindmap.js#L13)
4. Run this script

```npm install```

```npm run main```

5. Open the result in [Freemind](http://freemind.sourceforge.net)
6. Profit :interrobang: :interrobang: :interrobang:

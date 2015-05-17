var self = require('sdk/self')
var tabs = require("sdk/tabs");
var Request = require('sdk/request').Request
var contextMenu = require("sdk/context-menu");
var { viewFor } = require("sdk/view/core");
var { modelFor } = require("sdk/model/core");
var windows = require("sdk/windows");
var selection = require("sdk/selection");

//tabs.activeTab.url = "http://blog.fefe.de";


// get cliqz result from API and populate menu
getSelectionRequest = function(selectionText,con) {
  menuItem.items[dummy]
  var request = Request({
    url: "http://webbeta.cliqz.com/api/v1/results?q=" + encodeURIComponent(selectionText),
     onComplete: function (response) {
       res = response.json;
       var myItems = []

       for( i in res.result ) {
        var myContentScript = 'self.on("click", function (node, data) {' +' self.postMessage(data)' + '});'  

        myItems.push(contextMenu.Item(
                      {label: res.result[i].snippet.title.substr(0,50)
                            + ' @ ' + res.result[i].url.substr(7,15) + ' ' 
                            + (res.result[i].snippet.desc ? ' (' 
                            + res.result[i].snippet.desc + ')': ''),
                        contentScript: myContentScript,
                        data: res.result[i].url,
                        image: self.data.url("icon.png"),
                        onMessage: function (url) {
                          tabs.open(url);
                        }}));
        }

        if( myItems.length == 0 ) {
          myItems.push(contextMenu.Item(
                      {label: 'Google search for "' + selectionText + '"',
                        contentScript: 'self.on("click", function () {' +' self.postMessage()' + '});',
                        onMessage: function () {
                          tabs.open('https://www.google.de/#q='+encodeURIComponent(selectionText) );
                        }}));
        }
        menuItem.items = myItems
    }
  }).get();
}


var dummy = contextMenu.Item({label: "Cliqzing.."});

var menuItem = contextMenu.Menu({
  label: "Cliqz search" ,
  id: "cliqzmenu",
  targetId: "cliqzmenu",
  context: contextMenu.SelectionContext(),
  image: self.data.url("icon.png"),
  items: [dummy]
});


/*
 var pasteItem = contextMenu.Item({
  label: "paste into location bar" ,
  context: contextMenu.SelectionContext(),
  image: self.data.url("icon.png"),
  contentScript: 'self.on("click", function () {' +
                 '  var text = window.getSelection().toString();' +
                 '  self.postMessage(text);' +
                 '});',
  onMessage: function (text) {
    console.log(tabs.activeTab)
    
    console.log(encodeURIComponent(text))
  }
});
*/




function addListenerShowing(win) {
  var win = viewFor(win);
  cmNode = win.document.getElementById('contentAreaContextMenu')
  cmNode.addEventListener('popupshowing', function(e){
    if(!e.target.id ) {
        getSelectionRequest(selection.text)
    }
  })
}


function addListenerHiding(win) {
  var win = viewFor(win);
  cmNode = win.document.getElementById('contentAreaContextMenu')
  cmNode.addEventListener('popupshowing', function(e){
    menuItem.items = [dummy]
  })
}

for( var i in windows.browserWindows) {
  addListenerShowing(windows.browserWindows[i]);
  addListenerHiding(windows.browserWindows[i]);
}

windows.browserWindows.on("open",function(win) {
    addListenerShowing(win)
    addListenerHiding(win);
});
#!/usr/bin/env node

//========================================================================
// cordova-create
//
// A node command for creating a simple Cordova project with a couple 
// of common plugins.
//
// by John M. Wargo (www.johnwargo.com)
//========================================================================
var appConfig = require('./app_config.js');
var colors = require('colors');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var shelljs = require('shelljs');

//*************************************
//some constants
//*************************************
var cmdStr = 'cdva-create folder app_id app_name [platform list]';
var commaSpace = ', ';
var debug = false;
var plugin_list;
var quoteMark = '"';
var space = ' ';
var theStars = "********************************";

function listArray(theName, theArray) {
  //Write the contents of an array to the console
  console.log("\n%s Array Contents", theName);
  for (var i = 0; i < theArray.length; i++) {
    console.log("%s[%s]: '%s'", theName, i, theArray[i]);
  }
}

function showHelp() {
  var helpFile = 'help.txt';
  //read the help file
  var raw = fs.readFileSync(path.join(__dirname, helpFile)).toString('utf8');
  //write the contents of the help file to the console
  console.log(raw);
}

function executeCordovaCommand(commandStr) {
  //Build the base command
  var theCmd = 'cordova ';
  //do we want to enable debug mode?
  if (theConfig.enableDebug) {
    //Then append the -d to the cordova command
    console.log("Enabling debug mode");
    theCmd += '-d ';
  }
  //Now add the rest of the command to the string
  theCmd += commandStr;
  console.log('Command string: %s', theCmd);
  var resCode = shelljs.exec(theCmd).code;
  if (resCode !== 0) {
    console.error("Unable to execute command (error code: %s)".red, resCode);
    process.exit(1);
  }
}

//========================================================================
//Write out what we're running
//========================================================4================
console.log("\n%s".green, theStars);
console.log("* Cordova Create (cdva-create) *".green);
console.log(theStars.green);

//========================================================================
//Sort out the command line arguments
//========================================================================
var userArgs;
//Is the first item 'node'? then we're testing
if (process.argv[0].toLowerCase() == 'node') {
  //whack the first two items off of the list of arguments
  //This removes the node entry as well as the cordova-create entry (the
  //program we're running)
  userArgs = process.argv.slice(2);
} else {
  //whack the first item off of the list of arguments
  //This removes just the cva-create entry
  userArgs = process.argv.slice(1);
}
//What's left at this point is just all of the parameters
if (debug) {
  listArray('Arguments', userArgs);
}

//Do we have the right # of parameters to continue?
if (userArgs.length > 2) {
  //Get the app's configuration settingds
  var theConfig = appConfig.getConfig();
  //Write them to the log while we're testing this thing...
  //console.log('App Config: %s'.red, JSON.stringify(theConfig));
  //console.log('App Config: %s'.red, JSON.stringify(theConfig));

  //Grab the target folder
  var targetFolder = userArgs[0];
  //Get the app ID
  var appID = userArgs[1];
  //grab the app name
  var appName = userArgs[2];
  //now whack off the initial (first three) arguments
  var userArgs = userArgs.slice(3);
  //What's left is any target platforms (if we have any)
  var targetPlatforms = [];
  //Do we have any platforms on the command line?
  if (userArgs.length > 0) {
    //Then use them
    targetPlatforms = userArgs;
  } else {
    targetPlatforms = theConfig.platformList;
  }

  //========================================================================
  //Check to make sure that the target folder does not already exist
  //========================================================================
  if (fs.existsSync(targetFolder)) {
    console.error("\nTarget folder %s already exists".red, targetFolder);
    process.exit(1);
  }

  //========================================================================
  //Read the plugin list from the config
  //========================================================================
  plugin_list = theConfig.pluginList;

  //========================================================================
  //Tell the user what we're about to do
  //========================================================================
  console.log("\n" + theStars);
  console.log("Application Name: %s", appName);
  console.log("Application ID: %s", appID);
  console.log("Target folder: %s", targetFolder);
  console.log("Target platforms: %s", targetPlatforms.join(commaSpace));
  console.log('Plugins: %s', plugin_list.join(commaSpace));
  console.log(theStars);

  //========================================================================
  //create the Cordova project
  //========================================================================
  console.log("\nCreating project".yellow);
  console.log(theStars);
  var cmdStr = 'create ' + targetFolder + space + appID + space + quoteMark + appName + quoteMark;
  var copyFromPath = theConfig.copyFrom;
  //Do we have a copyFrom path?
  if (copyFromPath.length > 0) {
    //Then add it to the end of the create command
    console.log('Enabling --copy-from option (file path: %s)', copyFromPath);
    //Then add it to the command string we're executing
    cmdStr += ' --copy-from "' + copyFromPath + quoteMark;
  } else {
    //Only do the linkTo option if copyTo is blank
    //can't have both
    var linkToPath = theConfig.linkTo;
    if (linkToPath.length > 0) {
      //Then add it to the end of the create command
      console.log('Enabling --link-to option (file path: %s)', linkToPath);
      //Then add it to the command string we're executing
      cmdStr += ' --link-to "' + linkToPath + quoteMark;
    }
  }

  //Pass any additional create command paramaters that exist in the
  //config file
  var createParms = theConfig.createParms;
  if (createParms.length > 0) {
    console.log('Appending "%s" to the create command', createParms);
    cmdStr += " " + createParms;
  }
  executeCordovaCommand(cmdStr);

  //========================================================================
  //Change to the target folder directory
  //========================================================================
  console.log("\nChanging to project folder (%s)".yellow, targetFolder);
  console.log(theStars);
  shelljs.pushd(targetFolder);

  //========================================================================
  // Platforms
  //========================================================================
  console.log('\nAdding platforms [%s] to the project'.yellow, targetPlatforms.join(commaSpace));
  console.log(theStars);
  if (targetPlatforms.length > 0) {
    executeCordovaCommand('platform add ' + targetPlatforms.join(space));
  } else {
    //I guess we're not adding any platforms
    //warn, but don't fail
    console.log("No platforms specified, skipping".yellow);
  }

  //========================================================================
  // Plugins
  //========================================================================
  console.log("\nAdding Cordova Core Plugins".yellow);
  console.log(theStars);
  if (plugin_list.length > 0) {
    // Loop through plugins array rather than hard-coding this list
    plugin_list.forEach(function (plugin) {
      console.log("Adding %s plugin to project".yellow, plugin);
      executeCordovaCommand('plugin add ' + plugin);
    });
  } else {
    //I guess we're not adding any plugins
    //warn, but don't fail
    console.log("No plugins specified in the configuration file, skipping...".yellow);
  }

  //========================================================================
  // Finished
  //========================================================================
  console.log("\nAll done!\n".green);

} else {
  //Do we have only one parameter and it's the word 'config'?
  if (userArgs.length == 1 && userArgs[0].toLowerCase() == '/config') {
    //Then open the config file for editing
    //First get the config file name
    var configFile = appConfig.getConfigFile();
    //Tell the user we're launching it
    console.log("Launching %s", configFile);
    //Figure out what command will launch the file depending on the
    //operating system
    var cmdStr;
    if (appConfig.isWindows()) {
      cmdStr = "start " + configFile;
    } else {
      cmdStr = "open " + configFile;
    }
    var child;
    child = exec(cmdStr, function (error, stdout, stderr) {
      if (error !== null) {
        console.log("\nexec error: %s\n".red, error);
        process.exit(1);
      }
    });
  } else {
    //Otherwise, we don't know what to do, so toss out an error
    //Tell the user why we can't do anything
    console.error("\nMissing one or more parameters, the proper command format is: ".red);
    //Show them the offending command line
    console.error("\n  %s\n".red, cmdStr);
    //Then display the help file
    showHelp();
    //We're done, so exit the app
    process.exit(1);
  }
}
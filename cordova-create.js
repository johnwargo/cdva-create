#!/usr/bin/env node
/* jshint node: true, strict: true, undef: true, unused: true */
//========================================================================
// cordova-create
//
// A node command for creating a simple Cordova project with a couple
// of common plugins.
//
// by John M. Wargo (www.johnwargo.com)
//========================================================================

"use strict";

var appConfig = require('./app_config.js');
// var colors = require('colors');
var fs = require('fs');
var path = require('path');
var shelljs = require('shelljs');

//*************************************
//some constants
//*************************************
var cmdStr = 'cdva-create folder app_id app_name [platform list]';
var commaSpace = ', ';
var debug = false;
var helpFile = 'help.txt';
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
//Is the first item 'node' or does it contain node.exe? Then we're testing!
//Yes, I could simply look for the word 'node' in the first parameter, but these
//are two specific cases I found in my testing, so I coded specifically to them.
if (process.argv[0].toLowerCase() === 'node' || process.argv[0].indexOf('node.exe') > -1) {
    //if (process.argv[0].toLowerCase() == 'node') {
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
//If debug mode is enabled, print all of the parameters to the console
if (debug) {
    listArray('Arguments', userArgs);
}

//========================================================================
//Do we have the minimum number of parameters to continue?
//========================================================================
if (userArgs.length > 2) {
    //Get the app's configuration settings
    var theConfig = appConfig.getConfig();
    //Grab the target folder
    var targetFolder = userArgs[0];
    //Get the app ID
    var appID = userArgs[1];
    //grab the app name
    var appName = userArgs[2];
    //now whack off the initial (first three) arguments
    userArgs = userArgs.slice(3);
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
    // We got this far, so it's time to create the Cordova project
    //========================================================================
    console.log("\nCreating project".yellow);
    console.log(theStars);
    //start by building the default command string
    cmdStr = 'create ' + targetFolder + space + appID + space + quoteMark + appName + quoteMark;
    //Now lets see if the user has the copy-from feature enabled in the config file
    var copyFromPath = theConfig.copyFrom;
    //Do we have a copy-from path?
    if (copyFromPath.length > 0) {
        //Can we resolve the copyFromPath (does it exist)?
        if (fs.existsSync(path.resolve(copyFromPath))) {
            //Then append it to the end of the command string
            console.log('Enabling --copy-from option (file path: %s)', copyFromPath);
            cmdStr += ' --copy-from "' + copyFromPath + quoteMark;
        } else {
            //the copy-from path won't resolve, so we'll skip it (and warn the user, of course)
            console.log("\nUnable to resolve copy-from path (%s), skipping\n".red, copyFromPath);
        }
    } else {
        //Now lets see if the user has the link-to feature enabled in the config file
        //Only do the linkTo option if copyTo is blank as we can't support both
        var linkToPath = theConfig.linkTo;
        //Do we have a link-to path?
        if (linkToPath.length > 0) {
            //Can we resolve the link-to path (does it exist)?
            if (fs.existsSync(path.resolve(linkToPath))) {
                //Then append it to the end of the command string
                console.log('Enabling --link-to option (file path: %s)', linkToPath);
                cmdStr += ' --link-to "' + linkToPath + quoteMark;
            } else {
                //the link-to path won't resolve, so we'll skip it (and warn the user, of course)
                console.log("\nUnable to resolve link-to path (%s), skipping\n".red, linkToPath);
            }
        }
    }

    //Pass any additional create command parameters that exist in the config file
    var createParms = theConfig.createParms;
    //Do we have any specified?
    if (createParms.length > 0) {
        //Append them to the end of the command string
        console.log('Appending "%s" to the create command', createParms);
        cmdStr += " " + createParms;
    }
    //At this point, we have the completed Cordova create command string, so execute it
    executeCordovaCommand(cmdStr);
    //Once this completes, we have a Cordova project, but no platforms or plugins added
    //Everything else that happens, happens in the project folder that was just created, so...
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
    if (userArgs.length === 1 && userArgs[0].toLowerCase() === '/config') {
        console.log("Config command detected\n");
        //Then open the config file for editing
        //First get the config file name
        var configFile = appConfig.getConfigFile();
        //Tell the user we're launching it
        console.log("Launching '%s' using the default editor\n", configFile);
        //Figure out what command will launch the file depending on the
        //operating system
        if (appConfig.isWindows()) {
            cmdStr = "start " + configFile;
        } else {
            cmdStr = "open " + configFile;
        }

        var resCode = shelljs.exec(cmdStr).code;
        if (resCode !== 0) {
            console.error("\nUnable to execute command (error code: %s)".red, resCode);
            process.exit(1);
        }

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

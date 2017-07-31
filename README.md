Cordova Create Utility (cdva-create) 
====================================

A module for creating a simple Cordova project with a couple of common platforms and plugins added. Essentially, this command replaces the common set of commands a Cordova developer types every (and I do mean every) time he or she creates a new Cordova project. 

If you create an occasional Cordova application, this probably won't be that useful to you. For me, in my day job as a product manager for a set of enterprise plugins for Apache Cordova and my side job, which is producing a catalog of books on Apache Cordova, I find that I'm constantly creating new Cordova projects. This module should save you a little time and make it very easy to create new Cordova projects.

The module is customizable; when you run the command the first time, it creates a configuration file that you can easily modify to customize how the module works for you. Through the configuration file, you can specify the platforms and plugins that are added to the project created using the command. You can even enable debug mode, which causes the module to execute the `cordova` command with it's debug (-d) command line option. All of the customization capabilities will be described later.

Requirements
============
This module expects that you have a functional Apache Cordova development environment running. This includes the appropriate native SDKs (Android Development Tools, Xcode and so on), NodeJS and other associated tools. As the command is a node module, it relies upon the same technology as the Cordova CLI does. 

This module has been tested on Windows, Macintosh OS X and Ubuntu Linux.

An excellent resource for information on how to setup a Cordova development environment is my [Apache Cordova 3 Programming](http://www.cordovaprogramming.com) book.

Installation
============
Install this module using npm by opening a terminal window and executing the following command:

Windows:

	npm install -g cdva-create

Macintosh OS X and Linux:

	sudo npm install -g cdva-create


If you've downloaded this module's code from GitHub, you can install the module by extracting the files then opening a terminal window and navigating to the folder where this file is located and issuing the following command:

Windows:

	npm install -g

Macintosh OS X and Linux:

	sudo npm install -g

Usage
===========
To create a new project using this command, open a terminal window and navigate to the folder where you want the project created and issue the following command:

	cdva-create folder app_id app_name [platform list]

The first three parameters are the same parameters you would use with the `cordova create` command. The platform list, shown as an optional parameter (by the use of brackets), defines the list of target platforms you want to use for the application project.

To create a sample Android project called Hello2 in a folder called hello_2 you would use the following command:

	cdva-create hello_2 com.johnwargo.hello2 Hello2 android

To create the same project, but include an iOS project as well, you would use the following command:

	cdva-create hello_2 com.johnwargo.hello2 Hello2 android ios

If you do not specify a platform list on the command line, the set of default platforms for your current operating system (described below) will be used.

To launch the system's default editor to edit the application's configuration file (described in the next section), use the following command:

	cdva-create /config 

Customization
======================
When the command runs for the first time, it creates a configuration file that can be used to customize the tasks the command performs when it runs. The configuration file is called `cdva-create.json` and it can be located in the user's home folder. On Windows you can find the file in the c:\users\user_name folder (replacing user_name with the login name for the current user). On Macintosh OS X, the file is located in the user's home folder at /Users/user_name (again replacing user_name with the user's logon name).

The default options for the application are defined in the following JSON object stored in the configuration file:

    {
      "platformList": [ "android", "firefoxos", "ios" ],
      "pluginList": ['cordova-plugin-console', 'cordova-plugin-dialogs', 'cordova-plugin-device'],
      "enableDebug": false,
	  "copyFrom": "folder_path"
	  "linkTo": "folder_path"
	  "createParms": "\"{\\\"plugin_search_path\\\":\\\"d:/dev/\\\"}\""
    }

To change the module's configuration, edit the JSON object, providing your own values for the configuration options described by the object. 

The default list of target platforms will differ depending on what operating system you are using. If you look at the script's code, you will see the following default platforms lists:

  	var default_platforms_linux = ['ubuntu'];
  	var default_platforms_osx = ['android', 'ios'];
  	var default_platforms_win = ['android', 'windows'];
	
You can add third party plugins to the pluginlist. This should work as long as the Cordova CLI can load the plugins using the plugin's ID. Where this won't work is for locally installed plugins. If you want to use locally installed plugins, you will need to set a plugin search path during the call to the `cordova create` command. 

The enableDebug parameter causes the module to add the debug (-d) parameter to all `cordova` CLI commands. With this option set to true, additional information will be written to the console as the Cordova CLI commands are executed. You will want to enable this option if something isn't working with the command and you want more information about what's happening as the different commands are executed. 

The copyFrom property allows you to specify the folder path that is used for the source for the web application content for the created application. When a non-blank value is provided here, the `cordova create` command is enhanced by adding a `--copy-from "folder_path"` to the end of the command. The folder_path can be an absolute or relative path - all that matters is that the Cordova CLI can resolve the path.

With linkto, a symbolic link is created in the project's www folder that points to the specified folder path. When a non-blank value is provided here, the `cordova create` command is enhanced by adding a `--link-to "folder_path"` to the end of the command. The folder_path can be an absolute or relative path; all that matters is that the Cordova CLI can resolve the path.

The createParms property defines a JSON object that is used to populate a `config.json` file located in the new project's `.cordova` folder.  When a non-blank value is provided here, the JSON object is passed as a parameter on the end of the `cordova create` command. Using the example above, this option instructs the CLI to populate the `cordova.json` file with the following content: 

	{ "plugin_search_path": "d:/dev/" }

With this in place, any `platform add` commands will search the specified path for plugins. The weird triple backslashes in the JSON string are there so that the content's quote and backslash characters will be properly escaped by the JSON parser. You can populate additional properties in the `config.json` file by appending the appropriate JSON content to the createParms property.

Note: You can create an empty folder then enable this option (passing in the path to the empty folder) to create a Cordova project with no web application content in the application's www folder.

Many people enable the option by default for all cordova commands, but this really doesn't make sense since, in a properly configured Cordova development environment, stuff just works. Don't succumb, only enable this option when it's really useful or needed. 

Update History
==============
+ September 22, 2016 - Updated the module for the new cordova plugin IDs.
+ June 25, 2015 - Fixed issues that were affecting my ability to debug the module in WebStorm. Added validation of the copyFrom and linkTo parameters. If the specified path can't be resolved, the user is warned and the parameter skipped.
+ November 5, 2014 - Added /config command-line option. Opens the application's configuration file in the system's default editor.  
+ October 28, 2014 - Added support for the Cordova CLI create command's --link-to switch. Added support for passing additional parameters to the create command. This was added in order to support adding a plugin search path to the project's configuration when first creating the project. This was needed to support the SAP Mobile Platform Hybrid SDK since the SDK plugins are installed locally and the CLI has issues locating dependent plugins when installed locally.  

***
By [John M. Wargo](http://www.johnwargo.com) - If you find this code useful, and feel like thanking me for providing it, please consider making a purchase from [my Amazon Wish List](https://amzn.com/w/1WI6AAUKPT5P9). You can find information on many different topics on my [personal blog](http://www.johnwargo.com). Learn about all of my publications at [John Wargo Books](http://www.johnwargobooks.com). 
            
/*==================================Instructions For Using Liri==================================
-Search for a twitter user's tweets by entering the command `tweets "<user name>"`
-Search for a song by entering the command `spotify "<song name>"`
-Search for a movie by entering the command `movie "<movie name>"`
-Write commands to random.txt and execute them by entering the command `do-what-it-says`

-The names in quotes are optional. If no name is entered, a default will be searched for instead.

-All user commands are logged into log.txt.
===============================================================================================*/

//Keys for all APIs are in this file.
var keys = require("./keys.js");

//Twitter API
var Twitter = require("twitter");
//Twitter Keys
var twitter = new Twitter(keys.twitterKeys);

//Spotify API
var Spotify = require("node-spotify-api");
//Spotify Keys
var spotify = new Spotify(keys.spotifyKeys);

//OMDB API
var request = require("request");
//OMDB Keys
var omdbKey = keys.omdbKey.key;

//fs is node package for reading and writing files.
var fs = require("fs");

var liri = {

	//Stores user inputs.
	input1: process.argv[2],
	input2: process.argv[3],

	//This function is ran when Liri is executed and it runs a user's entered command.
	start: function() {

		//If no command is entered, the command entered doesn't exist, or the user entered more than 2 commands
		//then this default text is displayed.
		var incorrectCommand = (
    			"Unrecognized command. Please try again from the options below.\nThe names in quotes are optional:\n" +
    			"\n    tweets '<user name>'" +
    			"\n    spotify '<song name>'" +
    			"\n    movie '<movie name>'" +
    			"\n    do-what-it-says"
    		);

		//Checks to see if user entered 2 or less commands, displays incorrectCommand text if user entered more than 2 commands
		if(process.argv.length < 5) {
			//Checks to see what command was inputted by the user and then calls their related function.
			switch (this.input1) {
  				case "tweets":
    				this.getTweets();
    				break;
    			case "spotify":
    				this.getSong();
    				break;
    			case "movie":
    				this.getMovie();
    				break;
    			case "do-what-it-says":
    				//Checks to see if user entered more commands after "do-what-it-says", 
    				//displays incorrectCommand text if user entered more commands.
    				if(process.argv.length < 4) {
    					this.getCommands();
    				}
    				else {
    					console.log(incorrectCommand);
    					liri.logText(incorrectCommand);
    				};
    				break;
    			//Default text is displayed for any incorrect command.
    			default: 
    				console.log(incorrectCommand);
    				liri.logText(incorrectCommand);
    		};
    	}
    	else {
    		//incorrectCommand text is displayed if user entered more than 2 commands.
    		console.log(incorrectCommand);
    		liri.logText(incorrectCommand);
    	};

	},

	//Displays a user's entered twitter user's tweets.
	getTweets: function() {

		var text = "";

		//If the user did not enter a twitter username/screenname to search for, the default will be set as "BobWill77299309".
		var screenName = this.input2;
		if(screenName === undefined) {
			screenName = "BobWill77299309"
		};

		//Twitter API searches by username/screenname and returns their lastest 20 tweets.
		twitter.get("statuses/user_timeline", {screen_name: screenName, count: 20}, function(error, tweets, response) {
			if(error) {
				//If an error occurs, the error's contents is displayed.
				text += ("Twitter error occurred: " + error);
			}
			else {
				//Displays twitter user's name, username/screenname, tweets, and when the tweets were created.
				for(var i = 0; i < tweets.length; i++) {
					text += (tweets[i].user.name + " @" + tweets[i].user.screen_name + "\n");
					text += (
						"'" + tweets[i].text + "'" + 
						"\n" + tweets[i].created_at + 
						"\n------------------------------\n"
					);
				};
				
			};
			console.log("\n" + text);
			liri.logText(text);
		});

	},

	//Displays a user's entered song's properties by using the Spotify API.
	getSong: function() {

		var text = "";

		//If the user did not enter a song name to search for, the default will be set as "The Sign by Ace of Base".
		var songName = this.input2;
		if(songName === undefined) {
			songName = "The Sign by Ace of Base";
		};

		//Spotify API searches by song name and returns the song's properties.
		spotify.search({type: "track", query: songName, limit: 1}, function(error, response) {
			if (error) {
				//If an error occurs, the error's contents is displayed.
				text += ("Spotify error occurred: " + error);
			}
			else {
				var song = response.tracks.items[0];

				//Displays the song's artist's name.
				//If there are multiple artists, all their names will be displayed.
				var artistNames = "";
				if(song.artists.length > 1) {
					for(var i = 0; i < song.artists.length; i++) {
						if(i !== (song.artists.length -1 )) {
							artistNames += song.artists[i].name + ", ";
						}
						else {
							artistNames += "and " + song.artists[i].name;
						};
					};
					text += ("Artists: " + artistNames);
				}
				else {
					text += ("Artist: " + song.artists[0].name);
				};

				//Displays the song's name and album name.
				text += ("Song: " + song.name + "\n" + "Album: " + song.album.name + "\n");

				//Displays the song's preview link.
				//If there is no song preview link, then text saying it is unavailable will be shown.
				if(song.preview_url === null) {
					text += ("Song Preview Url: There is no song preview available");
				}
				else{
					text += ("Song Preview Url: " + song.preview_url);
				};
			};
			console.log("\n" + text);
			liri.logText(text);
		});

	},

	//Displays a user's entered movie's properties by using the OMDB API.
	getMovie: function() {

		var text = "";

		//If the user did not enter a movie name to search for, the default will be set as "Mr. Nobody".
		var movieName = this.input2;
		if(movieName === undefined) {
			movieName = "Mr. Nobody";
		};

		//OMDB API searches by movie name and returns the movie's properties.
		request("http://www.omdbapi.com/?apikey=" + omdbKey + "&t=" + movieName, function(error, response, body) {
  			if (error) {
  				//If an error occurs, the error's contents is displayed.
  				text += ("OMDB error occured: " + error);
  			}
  			else if(response.statusCode === 200) {
  				var parse = JSON.parse(body);
  				//Displays the movie's title, release date, IMDB rating, Rotten Tomatoes rating, country produced in,
  				//language, plot, and actors.
    			text += (
    				"Title: " + parse.Title + 
    				"\nRelease Date: " + parse.Released + 
    				"\nIMDB Rating: " + parse.imdbRating + 
    				"\nRotten Tomatoes Rating: " + parse.Ratings[1].Value +
    				"\nCountry Produced: " + parse.Country + 
    				"\nLanguage: " + parse.Language + 
    				"\nPlot: " + parse.Plot + 
    				"\nActors: " + parse.Actors
    			);
  			};
  			console.log("\n" + text);
			liri.logText(text);
		});
		
	},

	//Reads text from random.txt and uses them as commands/inputs for Liri's functions. 
	//Allows multiple commands such as using both spotify and movie.
	//Add commands by writing 	action,'<name>'    i.e. spotify,"I Want It That Way"
    //If you want multiple commands, add commands to random.txt by separating them by line breaks.
    //i.e. spotify,"I Want It That Way"
    //	   movie,"Frozen"
	getCommands: function() {

		var text = "";

		//Reads from random.txt
		fs.readFile("random.txt","utf8", function(error, data) {
      		if(error) {
        		text += ("do-what-it-says error: " + error);
        		console.log(text);
        		liri.logText(text);
      		}
      		else {
      			if(data !== "") {
      				//Separates different commands.
      				var commands = data.split("\r\n");
      				//Separates each command into separate inputs.
      				for(var i = 0; i < commands.length; i++) {
      					var inputs = commands[i].split(",");
      					liri.input1 = inputs[0];
      					liri.input2 = inputs[1];
      					//Calls start function to execute command.
      					liri.start();
      				};
      			}
      			else {
      				//Displays this text if random.txt is empty.
      				text += ("random.txt is empty. Please write some commands in random.txt.");
      				console.log(text);
      				liri.logText(text);
      			};
      		};
			
		});

	},

	//Logs all console.logs and the user's entered commands.
	logText: function(text) {

		//Stores user's entered command.
		var commandText = "";
		for(var i = 2; i < process.argv.length; i++) {
			commandText += process.argv[i] + " ";
		};

		//Appends logs to log.txt
		fs.appendFile("log.txt", "Liri Log: " + Date() + "\nCommand: " + commandText + "\n" + text + "\n\n", function(error){
    		if(error) {
    			//If an error occurs, the error's contents is displayed.
      			console.log("Logging Text Error Occured: " + error);
    		};
		});

	}

};

liri.start();
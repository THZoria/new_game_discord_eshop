const Discord = require("discord.js");
const Client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ]
});

//Import htmlentities module to decode HTML entities
var htmlentities = require('html-entities');
//Import fs module to manage files
var fs = require('fs');
//Import request module to request API 
var request = require('request');
var url = 'https://tinfoil.media/Title/ApiJson/';

//Function to extract New json entries based on ID json value
function compare(newJson, oldJson) {
    // get Id's from oldJson
    let ids = oldJson.data.map(ch => ch.id);
    // filter from newJson that's not inside from old ids
    return newJson.data.filter(ch => !ids.includes(ch.id));
}

//
function fsnewjson(){
  let date_ob = new Date();
  let hours = date_ob.getHours();
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  console.log("Round de check démarré à : " + hours + ":" + minutes);
  request.get({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
    } else {
      // data is already parsed as JSON:
      dataclean = data["data"]
      dataclean.sort(GetSortOrder("release_date"))
      let datajson = JSON.stringify(data, null, 3);
      fs.writeFileSync('data-new.json', datajson, (err) => {if (err) throw err; console.log('Data written to file');});
      AnnounceEshopReleases();
    }
  }
  );
}

//Replace old json file by new at the end of the loop
function fsrotatejson(){
    fs.rename('data-new.json', 'data-old.json', function (err) {

    if (err) throw err;
        console.log('Json file renamed to data-old.json- !');
    });
}

//Sort new entry ascending method
function GetSortOrder(prop){
    return function(a,b){
       if( a[prop] > b[prop]){
           return 1;
       }else if( a[prop] < b[prop] ){
           return -1;
       }
       return 0;
    }
}

//Remove html <a> and decode HTML entities
function CleanName(jsonname){
    var mySubString = jsonname.substring(
        jsonname.indexOf(">") + 1, 
        jsonname.lastIndexOf("</")
      );
      return htmlentities.decode(mySubString);
}

//Parse Date value and format it
function CleanDate(jsondate){
    const options1 = {weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(jsondate);

    const dateTimeFormatFR = new Intl.DateTimeFormat('fr-FR', options1);
    var result = (dateTimeFormatFR.format(date));

    return result[0].toUpperCase() + result.substring(1);
}

//Remove all HTML data and keep the URL
function CleanIcon(jsonicon){
    var mySubString = jsonicon.substring(
        jsonicon.indexOf("(") + 1, 
        jsonicon.lastIndexOf(")")
      );
    return mySubString;
}

//MainProcess of AnnounceEshopReleases
function AnnounceEshopReleases(){
    //Import the old and new json file.
    var dataoldfile = fs.readFileSync('data-old.json', 'utf8');
    var datanewfile = fs.readFileSync('data-new.json', 'utf8');
    fsrotatejson();
    var dataold = JSON.parse(dataoldfile);
    var datanew = JSON.parse(datanewfile);

    let datadiffresult = compare(datanew, dataold);
    datadiffresult.sort(GetSortOrder("release_date"));

    for (let key in datadiffresult) {
        let value = datadiffresult[key];
        gameid = datadiffresult[key]["id"];
        gamename = CleanName(datadiffresult[key]["name"]);
        if (datadiffresult[key]["release_date"]!== null && datadiffresult[key]["release_date"] !== ''){
          gamereleasedate = CleanDate(datadiffresult[key]["release_date"]);
        } else {
          gamereleasedate = "Undefined";
        }
        
        gamesize = datadiffresult[key]["size"];
        gamepublisher = datadiffresult[key]["publisher"];
        gameicon = CleanIcon(datadiffresult[key]["icon"]);
        console.log("ID : " + gameid);
        console.log("Name : " + gamename);
        console.log("Date de publicaton : " + gamereleasedate);
        console.log("Taille : " + gamesize);
        console.log("Editeur/Publieur : " + gamepublisher);
        console.log(gameicon);
        console.log("-----------------");

        const embed = new Discord.MessageEmbed()
        .setTitle(gamename)
        .setDescription(" **__ID__** : " + gameid + "\n **__Editeur__** :  " + gamepublisher + "\n **__Taille__** :  " + gamesize + "\n **__Date de sortie__** :  " + gamereleasedate)
        .setURL('https://tinfoil.media/Title/' + gameid)
        .setThumbnail(gameicon)
        .setTimestamp()
        .setFooter('NinshopBot')
        .setColor("#ff00f1")

        Client.channels.fetch('918466929298120704')
        .then(channel => {
            channel.send({ embeds: [embed] });
        })

        console.log("Envoie effectué");
        console.log("-----------------");
    }
    let date_ob = new Date();
    let hours = date_ob.getHours();
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    console.log("Round de check terminé à : " + hours + ":" + minutes);
}

Client.on("ready", () => {
  console.log("Démarrer");
  Client.channels.fetch('918466929298120704')
        .then(channel => {
            channel.send("Hello here :D !");
        })
  fsnewjson();
  setInterval(fsnewjson, 1000 * 60 * 60);
});

Client.login("token")

const { getGamesEurope } = require('nintendo-switch-eshop');
const Discord = require("discord.js");
const Client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ]
});

const prefix = "$";

Client.on("ready", () => {
  console.log("Démarrer");
});

Client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.content === prefix + "ninshop") {
    let data = await getGamesEurope({ limit: 2, locale: "fr" });
    console.log(data)
    console.log("Les informations ont été transmis")
    const embed = new Discord.MessageEmbed()
      .setTitle(data[0].title)
      .setDescription(" **__Détail__** : " + data[0].product_catalog_description_s + "\n **__Editeur__** :  " + data[0].publisher + "\n **__Catégorie__** :  " + data[1].pretty_game_categories_txt + "\n **__Prix__** :  " + data[0].price_lowest_f +  " € "  + "\n **__Age__** :  " + data[0].pretty_agerating_s + "\n **__Date de sortie__** :  " + data[0].pretty_date_s)
      .setImage(data[0].image_url)
      .setFooter('NinshopBot')
      .setColor("#ff00f1")

    message.channel.send({ embeds: [embed] });
  }
});





Client.login("ODIwMjA2MjU4NTgwNzUwMzM2.YExymg.VKIHAUKvWWu10RlnTQ6PT7-Cwqc")






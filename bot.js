const Discord = require('discord.js');
const client = new Discord.Client({
  disabledEvents: ['TYPING_START'],
});
const prefix = "lmao"
const snekfetch = require('snekfetch');
const ytdl = require('ytdl-core');
const Util = require('discord.js');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube('AIzaSyANS8AVVuSxUOifKikrllcTMRewOfMTFr4');
const voteapi = "https://discordbots.org/api/bots/398413630149885952/votes?onlyids=true";
const Sequelize = require('sequelize');
const fs = require('fs');
const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL);
process.on('unhandledRejection', console.error)

client.commands = new Discord.Collection();

const command_folders = fs.readdirSync('./commands');
for (const folder of command_folders) {
  const command_files = fs.readdirSync(`./commands/${folder}`);
  for (const file of command_files) {
    if (file.split('.').pop() === 'js') {
    const props = require(`./commands/${folder}/${file}`);
    client.commands.set(props.help.name, props);
    }
  }
}

const sequelize =  new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sql',
});

const Sounds = sequelize.define('sounds', {
  name: {
    type: Sequelize.STRING,
    unique: true,
  },
  url: Sequelize.STRING,
  username: Sequelize.STRING,
  usage_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

client.once('ready', () => {
  Sounds.sync();
});

client.on('message', message => {

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const input = message.content.slice(prefix.length + 1).split(' ');
  const command = input.shift();
  const args = input.join(' ');

  let cmd = client.commands.get(command); //let cmd = client.commands.get(command.slice(prefix.length));
  if (cmd) cmd.run(client, message, args)

});

client.on('guildCreate', guild => {
  let defaultChannel = "";
  guild.channels.forEach((channel) => {
    if (channel.type == "text" && defaultChannel == "") {
      if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  })
  if (!defaultChannel) return;
  //defaultChannel will be the channel object that it first finds the bot has permissions for
  const embed = new Discord.RichEmbed()
    .setTitle('Howdy folks!')
    .setDescription(`thnx veri much for inViting mi to **${guild.name}**!!1! I'm **LMAOBot**, a f4ntast1c b0t created by **Pete#4164**, **Dim#8080**, **NumerX#4587**, and **Clark thy Lord#7042**! \n \nTo look at the list of my commands, type __**'lmao help'**__! \n \nHey you! yeah.. you!11! W4nt to upv0te LMAOBot to gain __***EXCLUSIVE***__ features such as upvote only commands, and a sexy role on the support server?!?!?11 You can do so by typing **'lmao upvote'** in chat! Thnx xoxo :heart: \n \nIf you're having any problems, feel free to join my support server, just type **'lmao invite'**!`)
    .setColor(0x2471a3)

  defaultChannel.send({
    embed
  })


})

client.on('ready', () => {
  client.shard.broadcastEval('this.guilds.size').then(results => {
    client.user.setActivity(`lmao help | ${results.reduce((prev, val) => prev + val, 0)} servers`);
  })
  console.log('Ready sir..');

  setInterval(async () => {
//     try {
//         let supportguild = client.shard.broadcastEval('client.guilds.get("399121674198581248")');
//         let role = "403490721421590529";
//         console.log("discordbots.org> Checking upvotes for roles.");
//         if(!supportguild) return console.log("discordbots.org> Error: Could not find supportguild");

//           supportguild.members.map(member => {
//             if (member.roles.has(role)) {
//               if (dbl.hasVoted(member.user.id) == false) {
//                 member.removeRole(role, "Removed upvote.")
//               }
//             } else {
//               if (dbl.hasVoted(member.user.id) == true) {
//                 member.addRole(role, "Added upvote.")
//               }
//             }
//           });

//     } catch (err) {
//       console.error('discordbots.org> Checking upvotes returned error: ' + err)
// }

    client.shard.broadcastEval('this.guilds.size').then(results => {
      snekfetch.post(`https://discordbots.org/api/bots/stats`)
        .set('Authorization', process.env.DBL)
        .send({
          server_count: `${results.reduce((prev, val) => prev + val, 0)}`
        })
        .then(() => console.log('Updated discordbots.org stats.'))
        .catch(err => console.error(`Whoops something went wrong: ${err.body}`));

      client.user.setActivity(`lmao help | ${results.reduce((prev, val) => prev + val, 0)} servers`)
    })
  }, 600000);
});

client.login(process.env.TOKEN);

// Import anything and everything required
const Discord = require('discord.js');
const snekfetch = require('snekfetch');
const ytdl = require('ytdl-core');
const Util = require('discord.js');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube('AIzaSyANS8AVVuSxUOifKikrllcTMRewOfMTFr4');
const voteapi = "https://discordbots.org/api/bots/398413630149885952/votes?onlyids=true";
const Sequelize = require('sequelize');
const fs = require('fs');
const https = require('https');
process.on('unhandledRejection', console.error)

// Setup Discord.js Client/Bot
const client = new Discord.Client({
  disabledEvents: ['TYPING_START'],
});

// Setup Client's configuration
client.config = require('./configs/bot.json');

// Setup Client's commands
client.commands = new Discord.Collection();
const command_folders = fs.readdirSync('./commands');
for (const folder of command_folders) {
  const command_files = fs.readdirSync(`./commands/${folder}`);
  for (const file of command_files) {
    if (file.split('.').pop() === 'js') {
      const command = require(`./commands/${folder}/${file}`);
      client.commands.set(command.name, command);
    }
  }
}


// Setup SQL database conneciton
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sql',
});


// Setup Sound manager
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



client.on('ready', () => {
  // Setup Sound system
  Sounds.sync();

  // Setup Bot
  client.shard.broadcastEval('this.guilds.size').then(results => {
    client.user.setActivity(`${client.config.prefix} help | ${results.reduce((prev, val) => prev + val, 0)} servers`);
  });

  console.log('Ready sir...');

  setInterval(async () => {
    try {
      let res = await require('snekfetch').get(`https://discordbots.org/api/bots/398413630149885952/votes?onlyids=1`)
        .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5ODQxMzYzMDE0OTg4NTk1MiIsImJvdCI6dHJ1ZSwiaWF0IjoxNTE1NDc5MzAwfQ.fZOBCz8fBAS-24EeC0uxOwlvs6LLqKTPgW-cpBQl1Z8').query('onlyids', true)
      if (!res) return console.error('discordbots.org> Checking upvotes returned no result.')

      if (res.status == 200) {
        let body = res.body;
        let supportguild = client.guilds.get("399121674198581248");
        let role = "403490721421590529";
        console.log("discordbots.org> Checking upvotes for roles.");

        if (supportguild) {
          supportguild.members.map(member => {
            if (member.roles.has(role)) {
              if (body.indexOf(member.user.id) == -1) {
                member.removeRole(role, "Removed upvote.")
              }
            } else {
              if (body.indexOf(member.user.id) != -1) {
                member.addRole(role, "Added upvote.")
              }
            }
          });
        }
      } else {
        console.error('discordbots.org> Checking upvotes returned status code: ' + res.status)
      }
    } catch (err) {
      console.error('discordbots.org> Checking upvotes returned error: ' + err)
    }
    client.shard.broadcastEval('this.guilds.size').then(results => {
      snekfetch.post(`https://discordbots.org/api/bots/stats`)
        .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5ODQxMzYzMDE0OTg4NTk1MiIsImJvdCI6dHJ1ZSwiaWF0IjoxNTE1NDc5MzAwfQ.fZOBCz8fBAS-24EeC0uxOwlvs6LLqKTPgW-cpBQl1Z8')
        .send({
          server_count: `${results.reduce((prev, val) => prev + val, 0)}`
        })
        .then(() => console.log('Updated discordbots.org stats.'))
        .catch(err => console.error(`Whoops something went wrong: ${err.body}`));

      client.user.setActivity(`${client.config.prefix} help | ${results.reduce((prev, val) => prev + val, 0)} servers`)
    });
  }, 600000);
});

client.on('message', msg => {
  if (!msg.content.startsWith(client.config.prefix) || msg.author.client) return;

  // Convert input into command name & args
  const args = msg.content.slice(client.config.prefix.length).split(/ +/);
  const command_name = args.shift().toLowerCase();

  // Find a command by it's name or aliases
  const command = client.commands.get(command_name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));
  if (!command) return;

  // Check that command requirements are met
  if (command.args && !args.length) {
    return msg.reply(' you didn\'t provide any arguments!');
  }

  if (command.guild_only && msg.channel.type !== 'text') {
    return msg.reply(' I can only execute that command inside servers!');
  }

  try {
    command.run(client, msg, args);
  } catch (error) {
    console.error(error);
    msg.reply(' there was an error in trying to execute that command!');
  }
});

client.on('guildCreate', guild => {
  // Get channel in which bot is allowed to msg
  let default_channel = guild.channels.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
  if (!default_channel) return;

  default_channel.send({
    embed: {
      color: 0x2471a3,
      author: {
        name: bot.user.username,
        icon_url: bot.user.avatarURL,
      },
      title: 'Howdy folks!',
      url: 'https://discord.js.org/#/',
      description: `Thnx veri much for inViting mi to **${guild.name}**!!1! I'm **LMAOBot**, a f4ntast1c b0t developed by *${client.config.developers.join(", ")}*! \n \nTo look at the list of my commands, type __**'${client.config.prefix} help'**__! \n \nHey you! yeah.. you!11! W4nt to upv0te LMAOBot to gain __***EXCLUSIVE***__ features such as upvote only commands, and a sexy role on the support server?!?!?11 You can do so by typing **'${client.config.prefix} upvote'** in chat! Thnx xoxo :heart: \n \nIf you're having any problems, feel free to join my support server [here](${client.config.support_server})!`,
      timestamp: new Date(),
      footer: {
        icon_url: bot.user.avatarURL,
        text: bot.config.embed.footer,
      },
    },
  });
});

client.login(process.env.TOKEN);
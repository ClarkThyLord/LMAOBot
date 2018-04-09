const Discord = require('discord.js');
const Sequelize = require('sequelize');
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

    module.exports.run = async (client, message, args) => {
		const soundName = args;
		if(!soundName) return message.channel.send(":x: You need to enter a sound to delete!")
		const sound = await Sounds.findAll({ where: { username: { [Sequelize.Op.like]: `% (${message.author.id})` } } });
		let mysounds = sound.map(s => s.name).join(" ");
		if(!mysounds.includes(soundName) && message.author.id !== "223919574536552449" && message.author.id !== '219204779426054146' && message.author.id !== "198255568882761728" && message.author.id !== "199810482574458881") return message.channel.send(":x: You can only delete your own sounds!");
		const rowCount = await Sounds.destroy({ where: { name: soundName } });
		if(!rowCount) return message.channel.send(`Sound **${soundName}** does not exist.`)
		return message.channel.send(`Sound **${soundName}** deleted.`)
    }

module.exports.help = {
    name: "deletesound"
}
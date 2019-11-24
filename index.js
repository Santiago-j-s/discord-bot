const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/Client');
const { prefix, token } = require('./config.json');

const client = new Client();
client.commands = new Discord.Collection();

// TODO: Consultar a @FDSoftware
// const queue = new Map();

const commandFiles = fs
	.readdirSync('./commands')
	.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

console.log(client.commands);

client.once('ready', () => {
	console.log('Ready!');
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async message => {
	const args = message.content.slice(1).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName);

	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
	if (message.content.startsWith('!welcome')) {
		client.channels
			.get('594935077637718027')
			.fetchMessage('646726213003509770')
			.then(message2 => console.log(message.reply(message2.content)))
			.catch(console.error);
	} else {
		try {
			command.execute(message);
		} catch (error) {
			console.error(error);
			message.reply('Ese comando no existe, pero la puta madreee!!!');
		}
	}
});

client.login(token);

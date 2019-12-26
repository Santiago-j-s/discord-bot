/**
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").User} User
 */
const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/Client');
const { prefix, token } = require('./config.json');
const Db = require('./db/sqlite/db');

const client = new Client();
client.commands = new Discord.Collection();

const dbPath = './db1.sqlite';
const db = new Db(dbPath);

const commandFiles = fs
	.readdirSync('./commands')
	.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

console.log(client.commands);

const logMemUsg = () => {
	console.log(
		`The script uses approximately ${process.memoryUsage().heapUsed /
			1024 /
			1024} MB`
	);
};

/**
 * @param {Db} db
 * @param {User} author
 * @param {Message} message
 */
async function autoBan(db, author, message) {
	const isProblematicUser = () =>
		message.mentions.users.first().id === '631621499262074881';

	if (!(await db.isVerifiedUser(author.id))) {
		if (isProblematicUser()) {
			message.guild.member(author).ban({
				reason: 'Bye!',
				days: 1,
			});
		} else {
			db.incrementVerifyMsgs(author);
		}
	}
}

client.once('ready', () => {
	logMemUsg();
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
	const author = message.author;

	if (author.bot) return;
	autoBan(db, author, message);

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
			const numero = Math.floor(Math.random() * 100 + 1);
			if (numero == 45) {
				message.reply('Ese comando no existe, pero la puta madreee!!!');
			} else {
				message.reply('usa !help para tener una lista de comandos');
			}
		}
	}
});

client.login(token);

const sqlite3 = require('sqlite3').verbose();

/**
 * @param {Error|null} err
 */
function handleConnection(err) {
	if (err) {
		console.error(err.message);
		return;
	}
	console.log('Conectado a la DB');
}

/**
 * @param {string} dbPath
 * @returns {import("sqlite3").Database}
 */
function connect(dbPath) {
	return new sqlite3.Database(dbPath, err => handleConnection(err));
}

/**
 * Saca una pregunta de la db y la pasa al historial
 *
 * @param {import("sqlite3").Database} db
 * @param {import("discord.js").Channel} channel
 */
function shift(db, channel) {
	const sql = `SELECT DISTINCT
					User User,
					QA Question,
					_rowid_ id
				FROM Questions
				WHERE Estado = 0
				ORDER BY _rowid_ `;

	db.get(sql, [], (err, row) => {
		if (err) throw err;

		if (row != undefined) {
			console.log(`${row.User} pregunto: ${row.Question} `);
			channel.send(`${row.User} pregunto: ${row.Question} `);
			const sql2 = `UPDATE Questions SET Estado = 1 WHERE _rowid_ = ${row.id};`;
			db.all(sql2, []);
		} else {
			// eslint-disable-next-line quotes
			channel.send(`No hay mas preguntas para responder ameo'`);
			// eslint-disable-next-line quotes
			console.log(`No hay mas preguntas para responder ameo'`);
		}
	});
}

/**
 * Inserts a question in the db
 *
 * @param {import("sqlite3").Database} db
 * @param {Message} message
 * @param {string} question
 */
function push(db, channel, username, question) {
	const sql = `INSERT INTO Questions (User, QA) VALUES  ('${username}','${question}')`;

	db.get(sql, [], err => {
		if (err) throw err;

		console.log('Se ingreso una nueva pregunta!');
		return channel.send('✅ Tu pregunta ya se envio!');
	});
}

/**
 * Get all questions
 *
 * @param {import("sqlite3").Database} db
 * @param {import("discord.js").Channel} channel
 */
function history(db, channel) {
	const sql = `SELECT DISTINCT QA Question, User User, _rowid_ id
            FROM Questions
            WHERE Estado = 1
			ORDER BY _rowid_ `;

	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		let txt = '';
		rows.forEach(row => {
			// eslint-disable-next-line prettier/prettier
			txt += `${row.User} pregunto: ${row.Question} \n`;

			console.log(
				`${row.User} pregunto (en un pasado muy muy lejano): ${row.Question} `
			);
		});
		txt = txt === '' ? 'No hay preguntas' : txt;
		channel.send(txt);
	});
	return;
}

/**
 * @module commands/question
 * @type {Command}
 */
module.exports = {
	name: 'question',
	description: 'Modulo para ayudar en las charlas QA',
	execute(message) {
		const dbPath = './db1.sqlite';
		const db = connect(dbPath);

		const args = message.content.split(' ');
		const channel = message.channel;

		const commands = {
			shift: () => shift(db, channel),
			push: () => {
				const question = args.slice(2).join(' ');
				const username = message.author.username;
				push(db, channel, username, question);
			},
			history: () => history(db, channel),
		};

		if (args[1] in commands) {
			commands[args[1]]();
		} else {
			return channel.send(`Para usar el modulo de QA usa el siguiente comando:
      \n !question push "tu pregunta aca" (no hace faltan las comillas , si respetar los espacios)`);
		}
	},
};

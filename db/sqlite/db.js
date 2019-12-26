const sqlite3 = require('sqlite3').verbose();

const userTable = 'User';
const thresholdMsgsToVerifyUser = 5;

/** Class representing a db connection */
module.exports = class Db {
	/**
	 * @param {string} dbPath
	 */
	constructor(dbPath) {
		this.db = this.connect(dbPath);
	}

	/**
	 * @param {Error|null} err
	 */
	handleConnection(err) {
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
	connect(dbPath) {
		return new sqlite3.Database(dbPath, err => this.handleConnection(err));
	}

	/**
	 * Get all users from db
	 */
	getUsers() {
		const sql = `SELECT Id, Username FROM ${userTable}`;
		return new Promise((resolve, reject) => {
			this.db.all(sql, [], (err, rows) => {
				if (err) reject(err);
				resolve(rows);
			});
		});
	}

	/**
	 * Check if user is verified.
	 *
	 * A user is verified if at least one of the following conditions is met:
	 * - Verified field in user row is set to 1
	 * - MsgsCnt field in user row is greather than `thresholdMsgsToVerifyUser`
	 *
	 * @param {string} userId
	 * @returns {Promise<boolean>}
	 */
	isVerifiedUser(userId) {
		const sql = `
			SELECT Id, Verified
			FROM ${userTable}
			WHERE Id=? AND (Verified=1 OR MsgsCnt >= ${thresholdMsgsToVerifyUser})
		`;

		new Promise(resolve => {
			this.db.get(sql, [userId], (err, row) => {
				if (err || !row) resolve(false);
				if (!row.Verified) {
					this.verifyUser(userId);
				}
				resolve(true);
			});
		});
	}

	/**
	 * @param {string} userId
	 */
	verifyUser(userId) {
		const sql = `UPDATE ${userTable} SET Verified = 1 WHERE Id = ?`;

		return new Promise((resolve, reject) => {
			this.db.run(sql, [userId], err => {
				if (err) reject();
				resolve();
			});
		});
	}

	/**
	 * Increment verified msgs of user
	 *
	 * @param {import("discord.js").User} user
	 */
	incrementVerifyMsgs(user) {
		const sql = `
			INSERT INTO ${userTable}(Id, Username)
			VALUES ($id, $username)
			ON CONFLICT(Id)
			DO UPDATE SET MsgsCnt = MsgsCnt + 1`;

		const params = {
			id: user.id,
			username: user.username,
		};

		return new Promise((resolve, reject) => {
			this.db.run(sql, params, err => {
				if (err) reject();
				resolve();
			});
		});
	}
};

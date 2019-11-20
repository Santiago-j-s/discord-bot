const {
	Util
} = require('discord.js');
const ytdl = require('ytdl-core');
const {
	GToken
} = require('../config.json');


const YouTube = require('simple-youtube-api');
const youtube = new YouTube(GToken);
module.exports = {
	name: 'play',
	description: 'Deja que el DJ Pepe le ponga ritmo a la noche!',

	async execute(message) {
		//Preparo el mensaje de entrada:
		const args = message.content.split(' ');
		const url = args[1];

		if ( url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/.*list(.*)$/) ) {

			message.channel.send(`Empezando a buscar en la playlist`);
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const songInfo2 = await ytdl.getInfo(video.id);
				const song2 = { title: songInfo2.title, url: songInfo2.video_url, };
				this.preplay(message,song2.url,true);
			}
			return message.channel.send(`✅ Playlist: **${playlist.title}** Se esta reproduciendo!`);
		} else if(args[1] == "search"){
			this.buscar( message,message.content.split('search ')[1] );
			return;
		} else{
			this.preplay( message,args[1],false );
			return;
		}
	},
	async preplay( message,url2,NO_SPAM) {

		const queue = message.client.queue;
		const serverQueue = message.client.queue.get(message.guild.id);
		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
		const permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
			return message.channel.send('I need the permissions to join and speak in your voice channel!');
		}

		const songInfo = await ytdl.getInfo(url2);
		const song = {
			title: songInfo.title,
			url: songInfo.video_url,
		};

		if (!serverQueue) {
			const queueContruct = {
				textChannel: message.channel,
				voiceChannel: voiceChannel,
				connection: null,
				songs: [],
				volume: 2.14, //2.14
				playing: true,
			};

			queue.set(message.guild.id, queueContruct);

			queueContruct.songs.push(song);

			try {
				var connection = await voiceChannel.join();
				queueContruct.connection = connection;
				this.play(message, queueContruct.songs[0]);
				message.channel.send(`✅ **${song.title}** Se esta reproduciendo!`);
			} catch (err) {
				console.log(err);
				queue.delete(message.guild.id);
				return message.channel.send(err);
			}
		} else {
			serverQueue.songs.push(song);
			if(!NO_SPAM){return message.channel.send(`✅  **${song.title}** has been added to the queue!`);}
			return;
			
		}
	},

	play(message, song) {
		const queue = message.client.queue;
		const guild = message.guild;
		const serverQueue = queue.get(message.guild.id);
	
		if (!song) {
			serverQueue.voiceChannel.leave();
			queue.delete(guild.id);
			return;
		}
	
		const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
			.on('end', () => {
				console.log('Music ended!');
				serverQueue.songs.shift();
				this.play(message, serverQueue.songs[0]);
			})
			.on('error', error => {
				message.channel.send("uuhY que peLoTuuDOO!!!");
				console.error(error);
			});
		dispatcher.setVolumeLogarithmic(serverQueue.volume / 15);
	},

	async buscar(msg, busqueda){
		try {
			var videos = await youtube.searchVideos(busqueda, 10);
			let index = 0;
			msg.channel.send(`
__**Song selection:**__

${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}

Please provide a value to select one of the search results ranging from 1-10.
			`);
			// eslint-disable-next-line max-depth
			try {
				var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
					maxMatches: 1,
					time: 15000,
					errors: ['time']
				});
			} catch (err) {
				console.error(err);
				return msg.channel.send('no se ingreso un numero, o es invalido, cancelando busqueda.');
			}
			const videoIndex = parseInt(response.first().content);
			var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
			this.preplay(msg, video.url,false);
		} catch (err) {
			console.error(err);
			return msg.channel.send('🆘 no encontre nada uuhY que peLoTuuDOO!!!.');
		}
	}
};

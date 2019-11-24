const fs = require('fs');
module.exports = {
	name: 'question',
	description: 'Modulo para ayudar en las charlas QA',
	execute(message) {
		const args = message.content.split(' ');

		if (args[1] == 'shift') {
			// leemos y parseamos el json
			const rawdata = fs.readFileSync('QA.json');
			const test2 = JSON.parse(rawdata);
			// sacamos el primero
			const test3 = test2.shift();
			console.log(test3);
			message.channel.send(
				`<${test3[0]['User']}>  Pregunto: **${test3[0]['QA']}** `
			);
			// re-parseamos el json para guardar
			const data2 = JSON.stringify(test2, null, 2);
			fs.writeFileSync('QA.json', data2);

			// Ahora a agarrar la ultima QA y la pegamos al historial:
			const rawdata2 = fs.readFileSync('QA.history.json');
			const QAContruct2 = JSON.parse(rawdata2);

			// TODO: QA3?
			const QA3 = [
				{
					User: test3[0]['User'],
					QA: test3[0]['QA'],
				},
			];

			// Pusheamos
			QAContruct2.push(QA2);

			// escribimos:
			const data3 = JSON.stringify(QAContruct2, null, 2);
			fs.writeFileSync('QA.history.json', data3);
			return;
		} else if (args[1] == 'push') {
			// Primero leemos:
			const rawdata = fs.readFileSync('QA.json');
			const QAContruct = JSON.parse(rawdata);
			// ahora agregamos la Pregunta 0km
			const QA2 = [
				{
					User: message.author.username,
					QA: message.content.split('push ')[1],
				},
			];

			// Pusheamos
			QAContruct.push(QA2);

			// escribimos:
			const data2 = JSON.stringify(QAContruct, null, 2);
			fs.writeFileSync('QA.json', data2);

			return message.channel.send('✅ Tu pregunta ya se envio! ');
		} else if (args[1] == 'start') {
			/* para iniciar el archivo*/
			const QA3 =
				'[[ {  "User": "test2", "QA": "manda otro shift, esto es solo para iniciar el array!!" } ]]';
			// escribimos:
			// let data3 = JSON.stringify(QA3, null, 2);
			fs.writeFileSync('QA.json', QA3);
			return message.channel.send(' ✅ Modulo Iniciado');
		} else if (args[1] == 'end') {
			fs.writeFileSync('QA.json', '');
			message.channel.send('listo');
		} else if (args[1] == 'history') {
			// Primero leemos:
			const rawdata = fs.readFileSync('QA.history.json');
			const QAContruct4 = JSON.parse(rawdata);
			// escribimos:
			message.channel.send('✅ Historial de pregunas:');
			QAContruct4.forEach(element => {
				console.log(` <${element.User}> pregunto:  ${element.QA} `);
			});
			return;
		} else {
			return message.channel
				.send(`Para usar el modulo de QA usa el siguiente comando:
      \n !question push "tu pregunta aca" (no hace faltan las comillas , si respetar los espacios)`);
		}
	},
};

const fs = require('fs');
module.exports = {
	name: 'question',
	description: 'Modulo para ayudar en las charlas QA',
	execute(message) {

    args = message.content.split(' ');

    if(args[1] == "shift"){
      //leemos y parseamos el json
      let rawdata = fs.readFileSync('QA.json');
      let test2 = JSON.parse(rawdata);
      //sacamos el primero
      var test3 = test2.shift();
      console.log(test3);
      message.channel.send(`<@!${test3[0]['User']}>  Pregunto: **${test3[0]['QA']}** `);
      //re-parseamos el json para guardar
      let data2 = JSON.stringify(test2, null, 2);
      fs.writeFileSync('QA.json', data2);
      return;

    }else if(args[1] == "push") {
      //Primero leemos:
      let rawdata = fs.readFileSync('QA.json');
      let QAContruct = JSON.parse(rawdata);
      //ahora agregamos la Pregunta 0km
      var QA2 = [{
          "User": message.author.username,
          "QA" : message.content.split('push ')[1]
      }];
      //Pusheamos
      QAContruct.push(QA2);
      //escribimos:
      let data2 = JSON.stringify(QAContruct, null, 2);
      fs.writeFileSync('QA.json', data2);
      //GGWP ya esta
      return  message.channel.send(`✅ Tu pregunta ya se envio! `);
    } else if(args[1] == "start"){
      /* para iniciar el archivo*/
      var QA3 = '[[ {  "User": "test2", "QA": "manda otro shift, esto es solo para iniciar el array!!" } ]]';
      //escribimos:
     // let data3 = JSON.stringify(QA3, null, 2);
      fs.writeFileSync('QA.json', QA3);
      message.channel.send("Modulo Iniciado");
    }else if (args[1] == "end"){
      fs.writeFileSync('QA.json', "");
    }else {
      message.channel.send(`Para usar el modulo de QA usa el siguiente comando:
      \n !question push "tu pregunta aca" (no hace faltan las comillas , si respetar los espacios)`);
    }

	},
};
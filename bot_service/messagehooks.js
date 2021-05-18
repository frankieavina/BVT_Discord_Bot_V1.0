//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();
const {createConnection} = require('mysql2');
const { createPool } = require('mysql2/promise');


class MessageHooksService {

 static onMessagePing(msg){
    
    if (msg.content === 'ping') {
        //tags the initial user who has sent the message
        msg.reply('pong');
        //sends a message to the channel without tagging anyone
        msg.channel.send('pong');
      } 
    
      else if (msg.content.startsWith('!kick')) {
        if (msg.mentions.users.size) {
          //we can select the first mentioned user with
          const taggedUser = msg.mentions.users.first();
          msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
        } else {
          msg.reply('Please tag a valid user!');
        }
      }

}


}



module.exports = MessageHooksService
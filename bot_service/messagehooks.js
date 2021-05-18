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

  //--------------------------- message ping bot replies pong ---------------
 static onMessagePing(msg){  
     
    if (msg.content === 'ping') {
        //tags the initial user who has sent the message
        msg.reply('pong');
        //sends a message to the channel without tagging anyone
        msg.channel.send('pong');
      } 

  }

  //--------------------------- bot messages after a message is recieved ---------------
 static onMessageAfter(bot, msg){
      //Prevent bot from responding to its own messages
    if( msg.author == bot.user ){
      return
    }

    msg.channel.send("Message recieved:"+msg.content)
  }


}



module.exports = MessageHooksService
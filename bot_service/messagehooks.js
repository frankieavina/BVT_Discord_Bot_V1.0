//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();
const {createConnection} = require('mysql2');
const { createPool } = require('mysql2/promise');
const moment = require('moment');
const reportingService = require('./reportingservice');

class MessageHooksService {

  //--------------------------- message ping bot replies pong ---------------
 static onMessagePing(msg){  
     
    //Prevent bot from responding to its own messages
    if( msg.author == bot.user ){
      return;
    }

  }

//   //--------------------------- bot messages after a message is recieved ---------------
 static async onMessageAfter(msg){

    const bot = global.bot;
    const pool = global.pool;

    //Prevent bot from responding to its own messages
    if( msg.author == bot.user ){
      return;
    }

    const db = await pool.getConnection();
    db.connection.config.namedPlaceholders = true;

    //get role snowflake id of Administarator and get user_id of Administrator 
    const [[roleID]] = await db.query(`SELECT id FROM roles WHERE name = :role_name `, {role_name: 'Administrator'}); 
    const [[userID]] = await db.query(`SELECT user_id FROM user_roles WHERE role_id = :admin_role_id `, {admin_role_id: roleID.id});

    //-------------- if user hasd access perform a report for specific role --------------------------
    const msgData = msg.content.split();
    if(msgData[0] == '!report' ){
      if(msg.author.id == userID.user_id){
        
        await reportingService.fullReport(msg,db,userID);

      }
      else {msg.channel.send('You do not have authorization.')}
    }

    db.release(); 
  }


}



module.exports = MessageHooksService
// Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();
const {createConnection} = require('mysql2');
const { createPool } = require('mysql2/promise');
// hooks for fucntions below 
const MessageHooksService = require('./bot_service/messagehooks');
const ReadyHooksService = require('./bot_service/readyhooks');
const GuildMemberHooksService = require ('./bot_service/guildmembershooks');

//-------------------------------- token for bot -------------------------------------------------------------
const TOKEN = process.env.TOKEN;
//setting up bot 
const bot = new Discord.Client();
bot.login(TOKEN);

//------------------------------connect to our MySQL and will test ---------------------------------------------
let db = createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD
});

const pool = createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD});

db.connect(err => {
  if (err) return console.log(err);
  console.log(`MySQL has been connected!`);
});


//---------------------------------- sending a message -------------------------------------------------------------

bot.on('message', MessageHooksService.onMessagePing);

//------------------------------- when user tries to communicate with bot -----------------------------------------

//bot.on('message', MessageHooksService.onMessageAfter);

//------------------------------------- ready ----------------------------------------------------------------------

bot.on("ready", async () => await ReadyHooksService.onReadyPing(bot,pool));

//----------------------------------------- guildMemberAdd ---------------------------------------------------------
 
//bot.on('guildMemberAdd', async () => await GuildMemberHooksService.onGuildMemberUA(pool));

//-------------------------------------------- guildMemberUpdate -------------------------------------------------
//when users change something about their account (nickname)
bot.on("guildMemberUpdate", async (oldMember, newMember) => {

   if(await((oldMember.nickname != newMember.nickname) || (oldMember.user.username != newMember.user.username))){
      // establish db connection 
      const db = await pool.getConnection();
      db.connection.config.namedPlaceholders = true;  
  
      // insert values of user into db 
      await db.query(`UPDATE user SET user_name=:user_name, nickname=:nickname WHERE (id=:id)`, 
      {
        id: newMember.user.id,
        user_name: newMember.user.username,
        nickname: newMember.nickname
      });

      // commit and release connection 
      db.commit(); 
      db.release(); 
    }

});

//------------------------- voiceStateUpdate papameter(oldstate, newstate) of type VoiceState ----------------------
//   oldmember, newmember  (problem: when user connects to voice chat bot thinks it joined the channel)
bot.on('voiceStateUpdate', (oldState, newState) => {

  // status of the voice channel 
  let newUserChannel = newState.voiceChannelID;
  let oldUserChannel= oldState.voiceChannellID;
  let VoiceChanID = '837762614188310573';

     //User Joins a voice channel 
    if(newUserChannel !== null && oldUserChannel == null && newUserChannel == VoiceChanID) {
      console.log(`User joined channel with snowflake id: ${newState.voiceChannelID} and
      user snowflake id: ${newState.id}. Username:${newState.user.username}`);
    } 
    
    // User leaves a voice channel
    else if(newUserChannel === null && oldUserChannel !== null){
      console.log(newUserChannel);
      console.log(`User left channel with snowflake id: ${oldState.voiceChannelID} and
      user snowflake id: ${oldState.id}.`);
    }
    else{
        console.log('User changed channels.')
    }
  
});




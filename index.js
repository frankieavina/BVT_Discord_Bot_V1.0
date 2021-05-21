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
const GuildMemberAddHooksService = require ('./bot_service/guildmembershooks');
const GuildMemberUpdateService = require ('./bot_service/guildmemberUpdatehooks');
const VoiceHooksService = require ('./bot_service/voicehooks');

//-------------------------------- token for bot -------------------------------------------------------------
const TOKEN = process.env.TOKEN;
//setting up bot 
const bot = new Discord.Client();
bot.login(TOKEN);


//------------------------------connect to our MySQL and will test ---------------------------------------------
const pool = createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD});
global.pool = pool;
let db = createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD});
// db.connection.config.namedPlaceholders = true;
global.db = db;
global.bot = bot;

db.connect(err => {
  if (err) return console.log(err);
  console.log(`MySQL has been connected!`);
});


//---------------------------------- sending a message -------------------------------------------------------------

bot.on('message', MessageHooksService.onMessagePing);

//------------------------------- when user tries to communicate with bot -----------------------------------------

bot.on('message', MessageHooksService.onMessageAfter);

// bot.on('message', async (msg) => {

//   const adminRole_ID = ("844695554821718027");

//   if( msg.author == bot.user ){
//     return;
//   }

//   msg.channel.send("Message recieved:"+msg.content);

//   if(msg.content === '!report'){
//     // get snowflake id of author. call function where it fetches all the snowflake ids that have 
//     // admin role and compare it the the authors id. return true of false and allow authorization
//     //if( adminRole_ID == msg.member.roles){

//         msg.channel.send("Acknowledged");

//         // establish db connection 
//         const db = await pool.getConnection();
//         db.connection.config.namedPlaceholders = true; 

//         let [[count]] = await db.query(`SELECT COUNT(*) FROM user `);
//         console.log(count); 

//         // commit and release connection 
//         db.commit(); 
//         db.release(); 
//     // }
//     // else {
//     //   msg.channel.send("You do not have Authorization.")
//     // }
//   }

// });

//------------------------------------- ready ----------------------------------------------------------------------

bot.on("ready", ReadyHooksService.onReadyPing);

//----------------------------------------- guildMemberAdd ---------------------------------------------------------
//new user joined guild(server)
//bot.on('guildMemberAdd', async () => await GuildMemberAddHooksService.onGuildMemberAdd(pool));

//-------------------------------------------- guildMemberUpdate -------------------------------------------------
//when users change something about their account (nickname)
bot.on("guildMemberUpdate", async (oldMember, newMember) => {

   //fs.writeFileSync("memberUpdate.json",JSON.stringify(newMember._roles,null,2));
   if(await((oldMember.nickname != newMember.nickname))){
      // establish db connection 
      const db = await pool.getConnection();
      db.connection.config.namedPlaceholders = true;
      // await db.query(`DELETE FROM user WHERE (id=:id)`,{id: newMember.user.id});  
  
      // insert values of user into user table 
      await db.query(`UPDATE user SET user_name=:user_name, nickname=:nickname WHERE (id=:id)`, 
      {
        id: newMember.user.id,
        user_name: newMember.user.username,
        nickname: newMember.nickname
      });
      // await db.query(`INSERT INTO user (id, user_name, nickname) VALUES (:id, :user_name, :nickname)`, 
      // {
      // id: newMember.user.id,
      // user_name: newMember.user.username,
      // nickname: newMember.nickname
      // });

      // commit and release connection 
      db.commit(); 
      db.release(); 
    }

});
//bot.on("guildMemberUpdate", async () => GuildMemberUpdateService.onGuildMemeberUpdate);

//------------------------- voiceStateUpdate papameter(oldstate, newstate) of type VoiceState ----------------------
//   oldmember, newmember  (problem: when user connects to voice chat bot thinks it joined the channel)

bot.on('voiceStateUpdate', VoiceHooksService.onVoiceUpdate);

// audit trail (also called audit log) - is a security-relevant chronological record, set of records, 
//and/or destination and source of records that provide documentary evidence of the 
//sequence of activities that have affected at any time a specific operation, procedure, or event


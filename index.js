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

//-------------------------------- token for bot & setting up bot ----------------------------------------
const TOKEN = process.env.TOKEN;
const bot = new Discord.Client();
bot.login(TOKEN);

//------------------------------connect to our MySQL and will test ---------------------------------------------
const pool = createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD});
let db = createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD});
db.connect(err => {if (err) return console.log(err);
  console.log(`MySQL has been connected!`);
});

// global variables 
global.db = db;
global.bot = bot;
global.pool = pool;

//------------------------------------- ready ----------------------------------------------------------------------

bot.on("ready", ReadyHooksService.onReadyPing);

//---------------------------------- sending a message -------------------------------------------------------------

bot.on('message', MessageHooksService.onMessagePing);

//------------------------------- when user tries to communicate with bot -----------------------------------------

bot.on('message', MessageHooksService.onMessageAfter);

//----------------------------------------- guildMemberAdd ---------------------------------------------------------
//new user joined guild(server)
bot.on('guildMemberAdd', async () => await GuildMemberAddHooksService.onGuildMemberAdd);

//-------------------------------------------- guildMemberUpdate -------------------------------------------------
//when users change something about their account (nickname)
bot.on("guildMemberUpdate", async () => await GuildMemberUpdateService.onGuildMemberUpdate);

//------------------------- voiceStateUpdate papameter(oldstate, newstate) of type VoiceState ----------------------
//   oldmember, newmember  (problem: when user connects to voice chat bot thinks it joined the channel)
bot.on('voiceStateUpdate', VoiceHooksService.onVoiceUpdate);


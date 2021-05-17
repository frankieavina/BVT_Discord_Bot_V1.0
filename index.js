//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();
const {createConnection} = require('mysql2');
const { createPool } = require('mysql2/promise');


//prepare the mysql connection
let db = createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD
});
const pool = createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD});

// token for bot
const TOKEN = process.env.TOKEN;
//setting up bot 
const bot = new Discord.Client();
bot.login(TOKEN);

//------------------------------connect to our MySQL and will test -------------------------------------------------
db.connect(err => {
  // Console log if there is an error
  if (err) return console.log(err);

  // No error found?
  console.log(`MySQL has been connected!`);
});


//---------------------------------- sending a message -------------------------------------------------------------
bot.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
    msg.channel.send('pong');

  } 
});

//------------------33333333333333333333333333333
bot.on('message', msg =>{
  if (msg.content === 'Hello') {
    msg.reply('World');
    msg.channel.send('World');

  } 
});

//------------------------------------- ready ----------------------------------------------------------------------
bot.on("ready", async () => {
  console.info(`Logged in as ${bot.user.tag}!`);

  const channel = bot.channels.get("837762614188310573");

 //check if channel exists 
  if (!channel) return console.error("The channel does not exist!");

  // bot was able to join channel 
  channel.join().then(
    connection => {
      console.log("Successfully connected. Discord bot joined channel.");
    }).catch(e => {
    console.error(e);
  });

  //calls function to get all users in the guild at the time of running the code
  let startUpMembers = await getAllMembers();
  console.log(startUpMembers);

  // if start up users are not in database add them  
  const db = await pool.getConnection();
  db.connection.config.namedPlaceholders = true;
  await db.query(`DELETE FROM user`);
  for (let i = 0; i <= startUpMembers.length - 1; i++) {
    // if (!( await confirmUserExists(startUpMembers[i].user_id))) {
    const currentMember = startUpMembers[i];
    console.log(`user: ${currentMember.user_name} was not in the database`);

    // insert values of user into db 
    await db.query(`INSERT INTO user (id, user_name, nickname) VALUES (:id, :user_name, :nickname)`, 
      {
        id: currentMember.user_id,
        user_name: currentMember.user_name,
        nickname: currentMember.user_nick
      }
    );
  }
  // commit and release connection 
  db.commit(); 
  db.release();

});

//----------------------------------------- guildMemberAdd ---------------------------------------------------------
// if a new user joins the server 
bot.on('guildMemberAdd', async (member) => {

  //fs.writeFileSync("memberAdd.json",JSON.stringify(member,null,2));
  newUsers.set(member.id, member.user);
  console.log(member.id);

  // if user that joined server does not exist add to db 
    if(!(await confirmUserExists(member.user.id))){

      // establish db connection 
      const db = await pool.getConnection();
      db.connection.config.namedPlaceholders = true;

      // insert values of user into db 
      await db.query(`INSERT INTO user (id, user_name, nickname) VALUES (:id, :user_name, :nickname)`, 
      {
        id: member.user.id,
        user_name: member.user.username,
        nickname: member.user.nickname
      });

      // commit and release connection 
      db.commit(); 
      db.release(); 
    }
});

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

//----------------------------------------------- fucntions --------------------------------------------------------
//////////////////////////////////////// confirm User Exists ////////////////////
async function confirmUserExists(id){

  const db = await pool.getConnection();
  db.connection.config.namedPlaceholders = true;

  const [[user]] = await db.query(`SELECT * FROM user WHERE id = :user_id `, {user_id: id});
  db.release(); 
  return !!user

}

// FYI: Guilds in Discord represent an isolated collection of users and channels, 
// and are often referred to as "servers" in the UI.
///////////////////////// fetch All Users From Server ///////////////////////////
async function getAllMembers() {

  let discordGuildID = "837762614188310569"; 

  let Guild = bot.guilds.get(discordGuildID);
  const existingMembers = [];
  await Guild.members.map(member =>{
    // console.log(member);
    existingMembers.push({
      user_id: member.user.id, 
      user_name: member.user.username,
      user_nick: member.nickname});
  });
  return existingMembers; 

}

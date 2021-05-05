//Require all needed packages and files
require('dotenv').config();
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();
const {createConnection} = require('mysql2');


//prepare the mysql connection
let con = createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER, 
  database: process.env.DB_NAME, password: process.env.DB_PASSWORD
});

// token for bot
const TOKEN = process.env.TOKEN;
//setting up bot 
const bot = new Discord.Client();
bot.login(TOKEN);

//Connect to our MySQL and will test 
con.connect(err => {
  // Console log if there is an error
  if (err) return console.log(err);

  // No error found?
  console.log(`MySQL has been connected!`);
});


// //bot ready 
// bot.on('ready', () => {
//   console.info(`Logged in as ${bot.user.tag}!`);
// });

//sending a message 
bot.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
    msg.channel.send('pong');

  } else if (msg.content.startsWith('!kick')) {
    if (msg.mentions.users.size) {
      const taggedUser = msg.mentions.users.first();
      msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
    } else {
      msg.reply('Please tag a valid user!');
    }
  }
});

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);

  const channel = bot.channels.get("837762614188310573");
  if (!channel) return console.error("The channel does not exist!");
  channel.join().then(connection => {
    // Yay, it worked!
    console.log("Successfully connected. Discord bot joined channel.");
  }).catch(e => {
    // Oh no, it errored! Let's log it to console :)
    console.error(e);
  });
});

// // if a new user joins the server 
// bot.on('guildMemberAdd', (member) => {
//   newUsers.set(member.id, member.user);
//   console.log(member.id);

//   const defaultChannel = guild.channels.find(channel => channel.permissionsFor(guild.me).has("SEND_MESSAGES"));
//   const userlist = newUsers.map(u => u.toString()).join(" ");
//   defaultChannel.send("Welcome our new user!\n" + userlist);
//   newUsers.clear();

// });

// bot.on("guildMemberRemove", (member) => {
//   if(newUsers.has(member.id)) newUsers.delete(member.id);
// });


// voiceStateUpdate papameter(oldstate, newstate) of type VoiceState 
//                          oldmember, newmember 
bot.on('voiceStateUpdate', (oldState, newState) => {

  // status of the voice channel 
  let newUserChannel = newState.voiceChannelID;
  let oldUserChannel= oldState.voiceChannellID;
  let VoiceChanID = '837762614188310573';

    // ------------------- User Joins a voice channel ----------------------------- setTimestamp, newMember parameter for the right voiceChannel/voiceChannelId property.
    if(newUserChannel !== null && oldUserChannel == null && newUserChannel == VoiceChanID) {
      console.log(`User joined channel with snowflake id: ${newState.voiceChannelID} and
      user snowflake id: ${newState.id}. Username:${newState.user.username}`);
      //adding the user to our database 
      // const data1 = `INSERT INTO user (id, alias)  VALUES ('${newState.id}', '${newState.user.username}');`;
      // con.query(data1);
      // console.log(data1);
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
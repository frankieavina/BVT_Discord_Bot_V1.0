//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();

class VoiceHooksService {

    static onVoiceUpdate(oldState, newState){

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

    }

}

module.exports = VoiceHooksService
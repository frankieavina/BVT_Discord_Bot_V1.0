//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();
const moment = require('moment');

class VoiceHooksService {

  static async onVoiceUpdate(oldMember, newMember){
    // status of the voice channel
    const oldName = oldMember.nickname || oldMember.user.username;
    const newName = newMember.nickname || newMember.user.username;
    
    const db = await global.pool.getConnection();

    let SQL = `INSERT into audit_log (user_id, event_id, channel_id, channel_type_id, date_enterred) 
    VALUES (?, ?, ?, 0, NOW())`;
    try{
      if (newMember.voiceChannelID){
        await db.query(SQL,[newMember.user.id, 1, newMember.voiceChannelID]);
        console.log(`${newName}:${oldMember.id} joined the voice chat with id: ${newMember.voiceChannelID}`);
      }
      if (oldMember.voiceChannelID){
        await db.query(SQL,[oldMember.user.id, 0, oldMember.voiceChannelID]);
        console.log(`${oldName}:${oldMember.id} left the voice chat with id: ${oldMember.voiceChannelID}`);
      }
      await db.commit();
    } catch (err){
      console.log(err);
      // console.log(SQL);
    } finally {
      db.release();
    }
  }

}

module.exports = VoiceHooksService
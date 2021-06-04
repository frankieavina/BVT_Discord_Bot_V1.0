// Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const GuildMemberHooksService = require('./guildmembershooks');
// initializing the discord collection 
const newUsers = new Discord.Collection();

class GuildMemberUpdateService {

    static async onGuildMemberUpdate(oldMember, newMember){

      const pool = global.pool;

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
      
            // commit and release connection 
            db.commit(); 
            db.release(); 
          }
    }

}

module.exports = GuildMemberUpdateService
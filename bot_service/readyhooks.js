//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();


class ReadyHooksService {

  static async onReadyPing(bot,pool){

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
        let startUpMembers = await ReadyHooksService.getAllMembers(bot);
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
                { id: currentMember.user_id, user_name: currentMember.user_name, nickname: currentMember.user_nick});
        }
        // commit and release connection 
        db.commit(); 
        db.release();

    }

    // FYI: Guilds in Discord represent an isolated collection of users and channels, 
    // and are often referred to as "servers" in the UI.
    ///////////////////////// fetch All Users From Server ///////////////////////////
    static async getAllMembers(bot) {

        let discordGuildID = "837762614188310569"; 
    
        let Guild = bot.guilds.get(discordGuildID);
        const existingMembers = [];
        await Guild.members.map(member =>{
        // console.log(member);
        existingMembers.push({
            user_id: member.user.id, 
            user_name: member.user.username,
            user_nick: member.nickname,
            user_roles: member._roles});
        });
        return existingMembers; 
    
    }


}

module.exports = ReadyHooksService
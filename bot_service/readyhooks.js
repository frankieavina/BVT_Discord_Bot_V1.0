//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const { join } = require('path');
// initializing the discord collection 
const newUsers = new Discord.Collection();


class ReadyHooksService {

    //------------------------- when bot is ready and running ---------------------------
    static async onReadyPing(){
        const bot = global.bot;
        const pool = global.pool;
        console.info(`Logged in as ${bot.user.tag}!`);

        const channel = bot.channels.get("837762614188310573");
    
        //check if channel exists 
        if (!channel) return console.error("The channel does not exist!");
    
        // bot was able to join channel 
        // channel.join().then(
        // connection => {
        //     console.log("Successfully connected. Discord bot joined channel.");
        // }).catch(e => {
        // console.error(e);
        // });
    
        // if start up users are not in database add them  
        const promises = [
            ReadyHooksService.populateUsers(),
            ReadyHooksService.populateRoles()
        ];
        await Promise.all(promises);
    }

    //--------------- populats roles table ----------------------------------------------
    static async populateRoles(){

        const startUpRoles = await ReadyHooksService.getAllRoles(global.bot);
        //console.log("Hello World",startUpRoles); 
        const db = await pool.getConnection();
        db.connection.config.namedPlaceholders = true;
        await db.query(`DELETE FROM roles`);
        for (let i = 0; i <= startUpRoles.length - 1; i++) {
            const indexRole = startUpRoles[i];
            await db.query(`INSERT INTO roles (id, name) VALUES (:id, :name)`, 
            { id: indexRole.role_id, 
              name: indexRole.role_name});
        }
        db.commit();
        db.release(); 
    }

    // -------------- populate Users and users_roles tables in DB ------------------------
    static async populateUsers(){ 
        //calls function to get all users in the guild at the time of running the code
        const startUpMembers = await ReadyHooksService.getAllMembers(global.bot);
        //console.log(startUpMembers);
        const db = await pool.getConnection();
        db.connection.config.namedPlaceholders = true;
        await db.query(`DELETE FROM user`);
        await db.query(`DELETE FROM user_roles`);
        const user_roles = [];
        for (let i = 0; i <= startUpMembers.length - 1; i++) {
            // if (!( await confirmUserExists(startUpMembers[i].user_id))) {
            const currentMember = startUpMembers[i];        
            // insert values of user into db 
            await db.query(`INSERT INTO user (id, user_name, nickname) VALUES (:id, :user_name, :nickname)`, 
                { id: currentMember.user_id, user_name: currentMember.user_name, nickname: currentMember.user_nick});
            if (currentMember.user_roles && currentMember.user_roles.length){
                currentMember.user_roles.map(roleID => {
                    user_roles.push(`("${currentMember.user_id}", "${roleID}")`);
                });
            }
        }
        const SQL = `INSERT INTO user_roles (user_id, role_id) VALUES ${user_roles.join(", ")}`
        await db.query(SQL);
        // commit and release connection 
        db.commit(); 
        db.release();
        //await ReadyHooksService.getAllRoles(global.bot);
    }

    //------------------------------------- functions ---------------------------------------------------------------------------
    //----------------- fetch All Users From Server --------------------------
    static async getAllMembers(bot) {
        // NOTE: Eventually this must be listed in an ENV file
        let discordGuildID = "837762614188310569"; 
        let Guild = bot.guilds.get(discordGuildID);
        const existingMembers = [];
        await Guild.members.map(member =>{
        existingMembers.push({
            user_id: member.user.id, 
            user_name: member.user.username,
            user_nick: member.nickname,
            user_roles: member._roles});
        });
        return existingMembers; 
    }

    //-------------------- get role(s) ad role name ---------------------------
    static async getAllRoles(bot) {
        let discordGuildID = "837762614188310569"; 
        let Guild = bot.guilds.get(discordGuildID);
        const existingRoles = [];

       await Guild.roles.array().map( role => {
        existingRoles.push({
            role_name: role.name,
            role_id: role.id});
        });

        return existingRoles;
    }


}

module.exports = ReadyHooksService
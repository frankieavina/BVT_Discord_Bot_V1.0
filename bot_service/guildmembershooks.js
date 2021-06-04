//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();


class GuildMemberAddHooksService {

    static async onGuildMemberAdd(member){

        const pool = global.pool;

        //fs.writeFileSync("memberAdd.json",JSON.stringify(member,null,2));
        newUsers.set(member.id, member.user);
        

        // if user that joined server does not exist add to db 
        let userExists = await GuildMemberAddHooksService.confirmUserExists(member.user.id);
        if(!userExists){

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

    }

    //------------------------------------ Confirm User Exists Function -------------------------------//
     static async confirmUserExists(id){

        const db = await pool.getConnection();
        db.connection.config.namedPlaceholders = true;
    
        const [[user]] = await db.query(`SELECT * FROM user WHERE id = :user_id `, {user_id: id});
        db.release(); 
        return !!user
    
    }

}

module.exports = GuildMemberAddHooksService
//Require all needed packages and files
require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
// initializing the discord collection 
const newUsers = new Discord.Collection();
const moment = require('moment');


async function fullReport(msg,db,userID,pickedRole){

      if(pickedRole == 'Administrator'){
        //------getting audit log information for Administrator, name of user(s) and time of user on discord---------
        const [auditInfo] = await db.query(`SELECT * FROM audit_log WHERE user_id = :specific_user_id `, {specific_user_id: userID.user_id});
        const [[adminNames]] = await db.query(`SELECT user_name FROM user WHERE id = :specific_user_id `, {specific_user_id: userID.user_id});
        let amountTimeAdmin = await getEntry(auditInfo);
        msg.channel.send('Administrator(s)');
        msg.channel.send('Name:'+ adminNames.user_name +' Total Amout Time (min):' + amountTimeAdmin)
      }
      else if(pickedRole == 'Assistant Administrator'){
        //------getting audit log info for AssistantAdministrator, name of user(s) and time spent on discord-----------
        const [[roleID_AA]] = await db.query(`SELECT id FROM roles WHERE name = :role_name `, {role_name: 'AssistantAdministrator'}); 
        const [[userID_AA]] = await db.query(`SELECT user_id FROM user_roles WHERE role_id = :admin_role_id `, {admin_role_id: roleID_AA.id});
        const [[adminAssisNames]] = await db.query(`SELECT user_name FROM user WHERE id = :specific_user_id `, {specific_user_id: userID_AA.user_id});
        const [auditInfo_AA] = await db.query(`SELECT * FROM audit_log WHERE user_id = :specific_user_id `, {specific_user_id: userID_AA.user_id});
        let amountTimeAssis = await getEntry(auditInfo_AA);
        msg.channel.send('Assistant Administrator(s)');
        msg.channel.send('Name:'+adminAssisNames.user_name+' Total Amount Time (min):'+amountTimeAssis);
      }
      else{
        msg.channel.send("User Role Does Not Exist.")
      }
}

  //---- function to get audit_log time entry for users -----
  async function getEntry(arr){
    let entries = []; 
    let user_time =[]; 
    let curr_entries = []; 
    let active = 0; 

    // looping through the audit log data
    for (let i =0; i <= arr.length-1 ; i++ ){

      // user active or not in voice/message, increment or decrement active 1 and 3 active 0 and 2 not active 
      if(arr[i].event_id == 1 || arr[i].event_id ==3){
        active+=1;
      }
      else if(arr[i].event_id == 0 || arr[i].event_id == 2 ){
        active = Math.max(active-1,0);
      }

      // detect beginning and end of user activity 
      if(active>0 && curr_entries==0){
        curr_entries.push(moment(arr[i].date_enterred));
      }
      else if(!active && curr_entries.length){
        curr_entries.push(moment(arr[i].date_enterred));
        entries.push(curr_entries);
        curr_entries=[];
      }

    }

    // if user is still active at the time of checking set end activity to moment()
    if(curr_entries.length){
      curr_entries.push(moment());
      entries.push(curr_entries);
      curr_entries = []; 
    }

    // find total amount of minutes for time on 
    for(let j = 0; j <= entries.length-1; j++){

      let end = entries[j][1];
      let start = entries[j][0];

       //console.log(end.diff(start,'minutes'));
       user_time.push(end.diff(start,'minute'));
    }

    // might need to go inside the for loop
    user_time = Math.ceil(user_time/15.0)*15;

    //let arrSum = ((user_time)=> user_time.reduce((a,b) => a + b, 0));

    return user_time; 

   }// end of get entry fucntion 

   module.exports = { fullReport: fullReport }
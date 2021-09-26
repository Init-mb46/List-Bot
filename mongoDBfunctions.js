const fs = require("fs");
const {MessageEmbed, Message} = require("discord.js");
const { MongoClient, MongoServerClosedError } = require("mongodb");
const pass = fs.existsSync("./token.json") ? require("./token.json").dbPass : process.env.dbPass;
const uri = "mongodb+srv://Aqib:"+ pass +"@maincluster.su4sm.mongodb.net/Discord-Bots?retryWrites=true&w=majority";
const {prefix} = require("./config.json");

const dbName = "discordBots";
const colName = "List-Bot"; 

//useful
async function awaitForMessage(msg) {
    return await msg.channel.awaitMessages({filer:  m => m.author.id === msg.author.id, max: 1, time: 30000, errors: 'time'})
        .then(message => {
            return message.first().content;
        }).catch(c => {
            return null;
        })
}

async function getTimeoutEmbed(msg) {
    return new MessageEmbed()
        .setTitle("You did not respond in time")
        .setColor("DARK_BUT_NOT_BLACK")
        .setFooter(`Command called by: ${msg.author.username}`);
}

//helpers
async function checkUser(client, msg, id) {
    const x = await client.db(dbName).collection(colName).findOne({_id: id});
    if (!x) {
        //user not exists
        await client.db(dbName).collection(colName).insertOne({_id: id, name: msg.author.username, lists: {mainList: {}}});
        return;
    } else if (!x.name) {
        //user name not exists
        await client.db(dbName).collection(colName).updateOne({_id: id}, {$set: {name: msg.author.username}}, {$upsert: true});
    }
}

async function createNewList(client, listName, id) {
    let x = await client.db(dbName).collection(colName).findOne({_id: id})

    x = x.lists;
    if (x[listName]) {
        return `A list with the name ${listName} already exists`;
    }
    x[listName] = {};
    await client.db(dbName).collection(colName).updateOne({_id: id}, {$set: {lists: x}})
    return `New list created with the name: \"${listName}\"!`;
}

async function getAllLists(client, id) {
    let x = await client.db(dbName).collection(colName).findOne({_id: id});

    return x.lists;
}

async function getList(client, listName, id) {
    let x = await client.db(dbName).collection(colName).findOne({_id: id});

    x = x.lists;
    if (x[listName]) {
        return x[listName];
    } else {
        return null;
    }
}

async function deleteList(client, listName, msg, id) {
    let x = await client.db(dbName).collection(colName).findOne({_id: id});

    x = x.lists;
    if (x[listName]) {
        await msg.reply({embeds: [new MessageEmbed()
            .setTitle(`Are you sure you want to delete \"${listName}\"?`)
            .setDescription(`Contains ${Object.keys(x[listName]).length} entries | Answer 'yes' to delete`)
            .setColor("BLURPLE")]});
        resp = await awaitForMessage(msg)
        if (resp) {
            if (resp == "yes") {
                delete x[listName];
                let response = await client.db(dbName).collection(colName).updateOne({_id: id}, {$set: {lists: x}});
                return response.modifiedCount > 0 ? `List \"${listName}\" was deleted.` : `There was a problem deleting the list \"${listName}\"`;
            } else {
                return `List \"${listName}\" was not deleted.`;
            }
        } else {
            msg.channel.send({embeds: [getTimeoutEmbed()
                .setDescription(`List \"${listName}\" was not deleted`)
            ]});
            return;
            }
    } else {
        return `No list exists with the name \"${listName}\"! Use ${prefix}getlists to see all of your lists!`;
    }
}

async function addToList(client, listName, msg, id) {
    let x = await client.db(dbName).collection(colName).findOne({_id: id});

    x = x.lists;
    if (x[listName]) {
        await msg.reply({embeds: [new MessageEmbed()
            .setTitle("Enter the key you would like to add to the list")
            .setDescription("Type 'cancel' to cancel")
            .setColor("BLURPLE")]});
        resp = await awaitForMessage(msg);
        if (resp) {
            if (resp == "cancel" || resp.startsWith(prefix)) {
                return `Nothing was added to the list \"${listName}\"`;
            } else {
                let key = resp.split(" ").length > 0 ? resp.split(" ")[0] : "";
                if (key == "") {
                    return `Key \"${key}\" is invalid, make sure the key is one word and has no spaces.`;
                } else if (x[listName][key]) {
                    return `Key \"${key}\" already exists, try again with another key`;
                } else if (key.length > 20) {
                    return `Key is too long, must be under 20 characters`;
                }
                await msg.channel.send({embeds: [new MessageEmbed()
                    .setTitle("Now enter the value for this key")
                    .setDescription("Type 'cancel' to cancel")
                    .setColor("BLURPLE")]});
                resp2 = await awaitForMessage(msg);
                if (resp2) {
                    if (resp2 == "cancel" || resp2.startsWith(prefix)) {
                        return `Nothing was added to the list \"${listName}\"`
                    } else {
                        let value = resp2.length > 0 ? resp2 : "";
                        if (value == "") {
                            return `No value entered, nothing was added to the list \"${listName}\"`;
                        } else if (value.length > 150) {
                            return `Value is too long, must be under 150 characters`;
                        }
                        x[listName][key] = value;
                        let response = await client.db(dbName).collection(colName).updateOne({_id: id}, {$set: {lists: x}});
                        return response.modifiedCount > 0 ? `\"${key}\" was added to list \"${listName}\"` : `There was a problem adding \"${key}\" to the list \"${listName}\"`;
                    }
                } else {
                    msg.channel.send({embeds: [getTimeoutEmbed()
                        .setDescription(`Nothing was added to the list \"${listName}\"`)
                    ]});
                    return;
                }
            }
        } else {
            msg.channel.send({embeds: [getTimeoutEmbed()
                .setDescription(`Nothing was added to the list \"${listName}\"`)
            ]});
            return;
        }
    } else {
        return `No list exists with the name \"${listName}\"! Use ${prefix}getlists to see all of your lists!`
    }
}

async function removeFromList(client, listName, keyName, msg, id) {
    let x = await client.db(dbName).collection(colName).findOne({_id: id}); 

    x = x.lists;   
    if (!x[listName]) {
        return `List \"${listName}\" does not exist`;
    } else if (!x[listName][keyName]) {
        return `Key \"${keyName}\" does not exist in list \"${listName}\"`;
    }

    let value = x[listName][keyName]; 
    delete x[listName][keyName];
    let response = await client.db(dbName).collection(colName).updateOne({_id: id}, {$set: {lists: x}});
    if (response.modifiedCount > 0) {
        msg.channel.send({embeds: [new MessageEmbed()
            .setTitle(`Item \"${keyName}\" has been removed from list \"${listName}\"`)
            .setDescription(`Value: \"${value}\"`)
            .setColor("AQUA")
            .setFooter(`Command : ${prefix}removeitem`)
        ]});
    } else {
        return `There was an error in deleting item \"${keyName}\"`;
    }
    return;
}

async function updateListItem(client, listName, keyName, msg, id) {
    let x = await client.db(dbName).collection(colName).findOne({_id: id});

    x = x.lists;
    if (!x[listName]) {
        return `List \"${listName}\" does not exist`;
    } else if (!x[listName][keyName]) {
        return `Key \"${keyName}\" does not exist in list \"${listName}\"`;
    }

    let value = x[listName][keyName];
    await msg.channel.send({embeds: [new MessageEmbed()
        .setTitle("Update Value")
        .setDescription(`The current value of key \"${keyName}\" is:\n\"${value}\"\n**Please enter the new value. Enter 'cancel' to cancel.**`)
        .setColor("BLURPLE")
    ]});
    const resp = await awaitForMessage(msg);
    if (resp) {
        if (resp == "cancel" || resp.startsWith(prefix)) {
            return `The value of \"${keyName}\" in list \"${listName}\" was not changed`;
        } else if (resp == "") {
            return `New value cannot be empty`;
        } else if (resp.length > 150) {
            return `New value cannot be greater than 150 characters`;
        }

        x[listName][keyName] = resp;
        const response = await client.db(dbName).collection(colName).updateOne({_id: id}, {$set: {lists: x}});
        if (response.modifiedCount > 0) {
            msg.channel.send({embeds: [new MessageEmbed()
                .setTitle("Update Value")
                .setDescription(`Value of \"${keyName}\" has been changed to:\n\"${resp}\"`)
                .setColor("AQUA")
                .setFooter(`Command : ${prefix}updateitem`)
            ]});
        } else {   
            return `There was an error updating the new value.`
        }
    } else {
        msg.channel.send({embeds: [getTimeoutEmbed()
            .setDescription(`The value of \"${keyName}\" in list \"${listName}\" was not changed`)
        ]});
    }
    return;
}

module.exports = {
    async requestDB(reqType, message, name = "", secondName = "") {
        const client = new MongoClient(uri);
        let msg;
        let userID = message.author.id;

        await client.connect();

        await checkUser(client, message, userID);

        try {
            switch(reqType) {
                case "newlist":
                    msg = await createNewList(client, name, userID);

                    break;
                case "getlists":
                    msg = await getAllLists(client, userID);

                    break;
                case "getlistitems":
                    msg = await getList(client, name, userID);

                    break;
                case "deletelist":
                    msg = await deleteList(client, name, message, userID);

                    break;
                case "addtolist":
                    msg = await addToList(client, name, message, userID);

                    break;
                case "removefromlist":
                    msg = await removeFromList(client, name, secondName, message, userID);

                    break;
                case "updatelistitem":
                    msg = await updateListItem(client, name, secondName, message, userID);

                    break;
                case "getrandomitem":
                    msg

                    break;
                default:
                    console.log("no action was taken to request db");
                    break;
            }
            
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
        return msg;
    }
}
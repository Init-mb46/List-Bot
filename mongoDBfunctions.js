const fs = require("fs");
const {MessageEmbed} = require("discord.js");
const { MongoClient, MongoServerClosedError } = require("mongodb");
const pass = fs.existsSync("./token.json") ? require("./token.json").dbPass : process.env.dbPass;
const uri = "mongodb+srv://Aqib:"+ pass +"@maincluster.su4sm.mongodb.net/Discord-Bots?retryWrites=true&w=majority";
const {prefix} = require("./config.json");

async function checkUser(client, id) {
    const x = await client.db("discordBots").collection("List-Bot").findOne({_id: id});
    if (x) {
        //user exists
        return;
    } else {
        //user not exists
        await client.db("discordBots").collection("List-Bot").insertOne({_id: id, lists: {mainList: {}}});
        return;
    }
}

async function createNewList(client, listName, id) {
    const x = await client.db("discordBots").collection("List-Bot").findOne({_id: id});

    x = x.lists;
    if (x[listName]) {
        return `A list with the name ${listName} already exists`;
    }
    x[listName] = {};
    await client.db("discordBots").collection("List-Bot").updateOne({_id: id}, {$set: {lists: x}})
    return `New list created with the name: \"${listName}\"!`;
}

async function getAllLists(client, id) {
    let x = await client.db("discordBots").collection("List-Bot").findOne({_id: id});

    return x.lists;
}

async function deleteList(client, listName, msg, id) {
    let x = await client.db("discordBots").collection("List-Bot").findOne({_id: id});

    x = x.lists;
    if (x[listName]) {
        msg.reply({embeds: [new MessageEmbed()
            .setTitle(`Are you sure you want to delete \"${listName}\"?`)
            .setDescription("Answer 'yes' or 'no'")
            .setColor("BLURPLE")]});
        msg.channel.awaitMessages({filer:  m => m.author.id === msg.author.id && (m.content == "yes" || m.content == "no"), max: 1, time: 30000, errors: 'time'})
            .then(resp => {
                resp = resp.first();
                if (reps == "yes") {
                    client.db("discordBots").collection("List-Bot").updateOne({_id: id}, {$set: {lists: x}})
                        .then(() => {return `list \"${listName}\" was deleted.`});
                } else {
                    return `list \"${listName}\" was not deleted.`;
                }
            }).catch((c) => {
                msg.channel.send({embeds: [new MessageEmbed()
                    .setTitle("You did not respond in time")
                    .setDescription("List was not deleted")
                    .setColor("DARK_BUT_NOT_BLACK")
                    .setFooter(`Command called by: ${msg.author.username}`)]});
                return;
            })
    } else {
        return `No list exists with the name ${listName}! Use ${prefix}getlists to see all of your lists!`;
    }
}


module.exports = {
    async requestDB(reqType, message, name = "", filter = {}, options = {}) {
        const client = new MongoClient(uri);
        let msg;
        let userID = message.author.id;

        await client.connect();

        await checkUser(client, userID);

        try {
            switch(reqType) {
                case "newlist":
                    msg = await createNewList(client, name, message, userID);

                    break;
                case "getlists":
                    msg = await getAllLists(client, userID);

                    break;
                case "getlistitems":
                    msg 

                    break;
                case "deletelist":
                    msg = await deleteList(client, name, userID);

                    break;
                case "addtolist":
                    msg

                    break;
                case "removefromlist":
                    msg

                    break;
                case "updatelistelement":
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
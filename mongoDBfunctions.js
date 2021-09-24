const fs = require("fs");
const { MongoClient, MongoServerClosedError } = require("mongodb");
const pass = fs.existsSync("./token.json") ? require("./token.json").dbPass : process.env.dbPass;
const uri = "mongodb+srv://Aqib:"+ pass +"@maincluster.su4sm.mongodb.net/Discord-Bots?retryWrites=true&w=majority";

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
    let x = await client.db("discordBots").collection("List-Bot").findOne({_id: id})

    x = x.lists;
    if (x[listName]) {
        return `A list with the name ${listName} already exists`;
    }
    x[listName] = {};
    await client.db("discordBots").collection("List-Bot").updateOne({_id: id}, {$set: {lists: x}})
    return;
}


module.exports = {
    async requestDB(reqType, userID, name = "",filter = {}, options = {}) {
        const client = new MongoClient(uri);
        let msg;
        await client.connect();

        await checkUser(client, userID);

        try {
            switch(reqType) {
                case "newlist":
                    msg = await createNewList(client, name, userID);

                    break;
                case "getlist":
                    msg

                    break;
                case "deletelist":
                    msg

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
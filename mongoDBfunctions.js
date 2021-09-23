const fs = require("fs");
const pass = fs.existsSync("./token.json") ? require("./token.json") : process.env.dbPass;
const uri = "mongodb+srv://Aqib:"+ pass +"@maincluster.su4sm.mongodb.net/Discord-Bots?retryWrites=true&w=majority";

module.exports = {
    //functions here, and the main function which connects to the db, the function
    //to update or create documents
    async main(client, func, options = {}) {

    }
}
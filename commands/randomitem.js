const {MessageEmbed} = require("discord.js");
const {prefix} = require("../config.json");
const {requestDB} = require("../mongoDBfunctions");

module.exports = {
    data: {
        name: "randomitem",
        description: "returns a random item from the specified list or from all your lists",
        params: "optional (listName)",
        aliases: ["rai", "randi", "randomi", "raitem", "ranitem", "randitem"]
    }, 
    async execute(msg, args) {
        const em = new MessageEmbed()
            .setTitle("Random Item")
            .setColor("DARK_BUT_NOT_BLACK");

        let listName = args[0] || "";

        const resp = await requestDB("getrandomitem", msg, listName);

        if (resp) {
            return msg.channel.send({embeds: [em
                .setDescription(resp)
                .setFooter(`Command called by ${msg.author.username}`)
            ]});
        }
    }
}

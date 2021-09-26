const {MessageEmbed} = require("discord.js");
const {prefix} = require("../config.json");
const {requestDB} = require("../mongoDBfunctions.js");

module.exports = {
    data: {
        name: "deletelist",
        description: "deletes the specified list from your lists",
        params: "1 (listName)",
        aliases: ["dl", "dellist", "dlist", "deletel"]
    },
    async execute(msg, args) {
        const em = new MessageEmbed()
            .setTitle("Delete List");
        if (args.length < 1) {
            return msg.channel.send({embeds: [em
                .setDescription("Please enter the name of the list you would like to delete")
                .setColor("DARK_BUT_NOT_BLACK")
            ]});
        } else if (args[0] == "mainList"){
            return msg.channel.send({embeds: [em
                .setDescription("You cannot delete the default list")
                .setColor("DARK_BUT_NOT_BLACK")
                .setFooter(`Command called by : ${msg.author.username}`)]});
        }

        let name = args[0];
        const resp = await requestDB("deletelist", msg, name);
        if (resp) {
            return msg.channel.send({embeds: [em
                .setDescription(resp)
                .setColor("AQUA")
                .setFooter(`Command : ${prefix}deletelist`)
            ]});
        }
        return;
    }
}
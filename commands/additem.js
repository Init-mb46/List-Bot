const {MessageEmbed} = require("discord.js");
const { request } = require("https");
const {prefix} = require("../config.json");
const {requestDB} = require("../mongoDBfunctions");

module.exports = {
    data: {
        name: "additem",
        description: "adds an item to the provided list with a key and a value",
        params: "1 (listName)",
        aliases: ["addi", "addtolist", "ai", "aitem", "atl", "addtol"]
    }, 
    async execute(msg, args) {
        const em = new MessageEmbed()
            .setTitle("Add Item to a List");
        if (args.length < 1) {
            return msg.channel.send({embeds: [em
                .setDescription("Please enter the list you would like to add the item to")
                .setColor("DARK_BUT_NOT_BLACK")
            ]});
        }
        const name = args[0];
        const resp = await requestDB("addtolist", msg, name);
        if (resp) {
            return msg.channel.send({embeds: [em
                .setDescription(resp)
                .setColor("AQUA")
                .setFooter(`Command : ${prefix}additem`)
            ]});
        }
        return;
    }
}
const {MessageEmbed} = require("discord.js");
const {prefix} = require("../config.json");
const {requestDB} = require("../mongoDBfunctions");

module.exports = {
    data: {
        name: "updateitem",
        description: "updates the value of the specified item within the specified list",
        params: "2 (listName, item)",
        aliases: ["ui", "updatei", "uitem", "upitem"]
    }, 
    async execute(msg, args) {
        const em = new MessageEmbed()
            .setTitle("Update Item")
            .setColor("DARK_BUT_NOT_BLACK");
        
        let listName;
        let itemName;
        if (args[0]) {
            listName = args.shift();
            if (args[0]) {
                itemName = args.shift();
            } else {
                return msg.channel.send({embeds: [em
                    .setDescription("Please include the item that you wish to update")
                ]});
            }
        } else {
            return msg.channel.send({embeds: [em
                .setDescription("Please include the list where the item you want to update is in")
            ]});
        }

        const response = await requestDB("updatelistitem", msg, listName, itemName);
        if (response) {
            return msg.channel.send({embeds: [em
                .setDescription(response)
                .setFooter(`Command : ${prefix}updateitem`)
            ]});
        }

        return;
    }
}
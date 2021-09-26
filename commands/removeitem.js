const {MessageEmbed} = require("discord.js");
const {prefix} = require("../config.json");
const {requestDB} = require("../mongoDBfunctions");

module.exports ={
    data: {
        name: "removeitem",
        description: "remove the specified item from the specified list",
        params: "2 (listName, item)",
        aliases: ["ri", "removei","ritem", "reitem"]
    },
    async execute(msg, args) {
        const em = new MessageEmbed()
            .setTitle("Remove Item");
        
        let listName;
        let itemName;
        if (args[0]) {
            listName = args.shift();
            if (args[0]) {
                itemName = args.shift();
            } else {
                return msg.channel.send({embeds: [em
                    .setDescription("Please include the item you wish to remove from the list")
                    .setColor("DARK_BUT_NOT_BLACK")
                ]});
            }
        } else {
            return msg.channel.send({embeds: [em
                .setDescription("Please include the list you wish to remove the item from")
                .setColor("DARK_BUT_NOT_BLACK")
            ]});
        }

        const response = await requestDB("removefromlist", msg, listName, itemName);
        if (response) {
            return msg.channel.send({embeds: [em
                .setDescription(response)
                .setColor("DARK_BUT_NOT_BLACK")
                .setFooter(`Command : ${prefix}removeitem`)
            ]});
        }
        return;
    }
}
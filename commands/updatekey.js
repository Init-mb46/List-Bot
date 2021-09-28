const {MessageEmbed} = require("discord.js");
const {requestDB} = require("../mongoDBfunctions");
const {prefix} = require("../config.json");
const { execute } = require("./updateitem");

module.exports = {
    data: {
        name: "updatekey",
        description: "update the specified key",
        params: "2 (listName, keyName)",
        aliases: ["uk", "upkey", "updatek", "ukey", "upk"]
    }, 
    async execute(msg, args) {
        const em = new MessageEmbed()
            .setTitle("Update Key Value")

        let name;
        let key;
        if (args[0]) {
            name = args.shift();
            if (args[0]) {
                key = args.shift();
            } else {
                return msg.channel.send({embeds: [em
                    .setDescription("Please include the key that you wish to change")
                    .setColor("DARK_BUT_NOT_BLACK")
                ]});
            }
        } else {
            return msg.channel.send({embeds: [em
                .setDescription("Please include the list where the key you wish to change lies")
                .setColor("DARK_BUT_NOT_BLACK")    
            ]});
        } 

        const resp = await requestDB("updatelistkey", msg, name, key);
        if (resp) {
            return msg.channel.send({embeds: [em
                .setDescription(resp)
                .setColor("DARK_BUT_NOT_BLACK")
                .setFooter(`Command : ${prefix}updatekey`)
            ]});
        }
        return;
    }
}
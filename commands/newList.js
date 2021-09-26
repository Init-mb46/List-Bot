const {MessageEmbed} = require("discord.js");
const {requestDB} = require("../mongoDBfunctions");

module.exports = {
    data: {
        name: "newlist",
        description: "creates a new list with the given name (spaces in the name will not be considered)",
        params: "1 (name)",
        aliases: ["nl", "newl", "nlist"]
    },
    async execute(msg, args) {
        const {prefix} = require("../config.json");
        const embed = new MessageEmbed()
            .setTitle("New List")
            .setFooter(`Command : ${prefix}newlist`)
            .setColor("AQUA");
        
        if (args.length < 1) {
            return msg.channel.send({embeds: [embed.setDescription("Please enter a name for the new list!")]});
        }
        let name = args[0];
        const resp = await requestDB("newlist", msg, name);
        
        return resp ? msg.channel.send({embeds: [embed.setDescription(resp)]}) : msg.channel.send({embeds: [embed.setDescription(`There may have been an error in creating list \"${name}\"`)]}) ;
    }
}


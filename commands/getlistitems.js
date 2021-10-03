const {MessageEmbed} = require("discord.js");
const {requestDB} = require("../mongoDBfunctions");
const {pagify} = require("../functions");
const {prefix} = require("../config.json");

module.exports = {
    data: {
        name: "getlistitems",
        description: "returns a list of items that are within the specified list, or the default list if none is specified",
        params: "1 + optional (listName, page)",
        aliases: ["gli", "getitems", "geti"]
    }, 
    async execute(msg, args) {
        const em = new MessageEmbed()
            .setTitle("List Items");
        
        if (args.length < 1) {
            return msg.channel.send({embeds: [em
                .setDescription("Please include the list you wish to get the items of")
                .setColor("DARK_BUT_NOT_BLACK")
            ]});
        } 
        
        let name = args.shift();
        let page = 1
        if (args.length > 0) {
            page = Number.isNaN(parseInt(args[0])) ? page : args[0];
        }

        const listObj = await requestDB("getlistitems", msg, name);

        if (listObj) {
            const list = Object.keys(listObj);
            if (list.length < 1) {
                return msg.channel.send({embeds: [em.setDescription(`There are no items in this list`)
                    .setFooter(`Command : ${prefix}getlistitems`)
                    .setColor("DARK_BUT_NOT_BLACK")
                ]});
            }
            const listPages = await pagify(list, 10);
            const totalPages = listPages.length;

            if (!(page > 0 && page <= totalPages)) {
                page = 1;
            }

            listPages[page - 1].forEach(itemName => {
                const value = listObj[itemName];
                em.addField(`\"${itemName}\"`, value);
            })

            return msg.channel.send({embeds: [em.setDescription(`Listing items for list \"${name}\"`)
                .setColor("AQUA")
                .setFooter(`Page ${page} of ${totalPages}`)
            ]});
        } else {
            return msg.channel.send({embeds: [em
                .setDescription(`The list you entered does not exist. Use ${prefix}getlists to see all of your lists`)
                .setColor("DARK_BUT_NOT_BLACK")
                .setFooter(`Command : ${prefix}getlistitems`)
            ]});
        }
    }
}
const {MessageEmbed} = require("discord.js");
const {listify, pagify} = require("../functions.js");
const {requestDB} = require("../mongoDBfunctions");
const {prefix} = require("../config.json");

module.exports = {
    data: {
        name: "getlists",
        description: "returns all the lists that you have created",
        params: "(optional) page number",
        aliases: ["getl", "gl", "glists", "getlis"]
    },
    async execute(msg, args) {
        let page = undefined;
        if (args.length > 0) {
            if (Number.isNaN(parseInt(args[0]))) {
                page = undefined;
            } else {
                page = parseInt(args[0]);
            }
        }

        const lists = await requestDB("getlists", msg);
        const listKeys = Object.keys(lists);
        const pages = await pagify(listKeys, 5);

        let totalLists = 0;
        pages.forEach(p => {
            p.forEach(l => totalLists++);
        })
        
        const totalPages = pages.length;
        if (page) {
            if (!(page-1 < totalPages && page-1 >= 0)) {
                //invalid page sent 
                page = 1;
            }
        } else {
            page = 1;
        }

        const em = new MessageEmbed()
            .setTitle("All of Your Lists")
            .setDescription(`If you have more than 5 lists, use page numbers after the command to navigate to the right page. You have **${totalLists}** lists!`)
            .setColor("AQUA")
            .setFooter(`Page ${page} of ${totalPages}`);
            
        pages[page-1].forEach(listName => {
            em.addField(`\"${listName}\"`,`Entries: ${Object.keys(lists[listName]).length}`)
        })
        return await msg.channel.send({embeds: [em]});
    }
}
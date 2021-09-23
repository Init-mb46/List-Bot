const fs = require("fs");
const {MessageEmbed} = require("discord.js");
const commandsPerPage = 5;

const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith(".js") && file != "help.js");
let commands = new Map();

for (const f of commandFiles) {
    const cmd = require(`./${f}`);
    commands.set(cmd.data.name, cmd);
}

module.exports = {
    data: {
        name: "help",
        description: "returns a list of all commands.",
        params: "optional (page number / command name)",
        aliases: ["h"]
    }, 
    async execute(msg, args) {
        let arg;
        let prefix = require("../config.json").prefix

        if (args.length >= 1) arg = args[0];
        let embed = new MessageEmbed()
            .setColor("AQUA")
            .setTitle("Commands")
            .setDescription("All the commands Listed here");
        
        let counter = 0, curPage = 0, pages = [];
        for (const [name, command] of commands.entries()) {
            if (counter % commandsPerPage == 0) {
                pages.push([]);
            }
            pages[curPage].push(command);
            counter++;
            curPage = Math.floor(counter/commandsPerPage);
        }
        
        embed.setFooter(`Page 1 of ${pages.length}.`);

        if (arg) {
            if (Number.isNaN(parseInt(arg))) {
                // page number not sent, command sent instead
                if (commands.has(arg.toLowerCase())) {
                    // command specified exists
                    let cmd = commands.get(arg.toLowerCase());
                    let param =  cmd.data.params ? "- parameters: " + cmd.data.params : "";
                    embed.setTitle(cmd.data.name + param)
                        .setDescription(cmd.data.description)
                        .setFooter("");
                } else {
                    embed.setTitle("Command does not exist")
                        .setDescription(`Use ${prefix}help to get a list of commands.`)
                        .setFooter("");
                }
            } else {
                arg = arg <= pages.length && arg >= 1 ? arg : 1
                let page = pages[arg-1];
                embed.setDescription(`Commands on page ${arg}`)
                    .setFooter(`Page ${arg} of ${pages.length}`);
                page.forEach(cmd => {
                    let param =  cmd.data.params ? "- parameters: " + cmd.data.params : "";
                    embed.addField(cmd.data.name + param, cmd.data.description)
                });
            }
        } else {
            //no arg 
            page = pages[0];
            page.forEach(cmd => {
                let param =  cmd.data.params ? "- parameters: " + cmd.data.params : "";
                embed.addField(cmd.data.name + param, cmd.data.description)
            });
        }
        return msg.channel.send({embeds : [embed]});
    }
}
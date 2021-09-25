const {Client, MessageEmbed, Intents, Collection} = require("discord.js");
const fs = require("fs");
const token = fs.existsSync("./token.json") ? require("./token.json").token : process.env.token;
const {prefix} = require("./config.json");

const client = new Client({intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]});
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const f of commandFiles) {
    const cmd = require(`./commands/${f}`);
    client.commands.set(cmd.data.name, cmd);
    console.log(`${prefix}${cmd.data.name} loaded. Description: ${cmd.data.description}`);
}

async function parseMessage(msg) {
    let args = msg.content.replace(/\s+/g,' ').trim().split(" ");
    let cmdWPref = args.shift().toLowerCase();
    return { args: args, cmdWPref: cmdWPref };
}

async function makeEmbed(title, desc) {
    let embed = new MessageEmbed()
    return embed.setTitle(title).setDescription(desc);
}

client.on("ready", async () =>{
    console.log(`Bot logged in as ${client.user.username} on ${client.guilds.cache.size} servers.`);
})

client.on("messageCreate", async msg => {
    if (msg.author.bot) return;

    let {args, cmdWPref} = await parseMessage(msg);
    if (!cmdWPref.startsWith(prefix)) return;
    let cmd = cmdWPref.slice(prefix.length);
    let actualCommand = client.commands.get(cmd);
    
    try {
        if (!actualCommand) {
            let matched = false;
            let cmdName;
            for(const [name, command] of client.commands.entries()) {
                command.data.aliases.forEach(v => cmd == v ? matched = true : "");
                if (matched) {
                    actualCommand = client.commands.get(name);
                    await actualCommand.execute(msg,args);
                    return;
                }
            }

            await msg.reply({embeds: [await makeEmbed("Command not found", `Type ${prefix}help for a list of commands.`)]});
            return;
        }
        
        await actualCommand.execute(msg, args);
    }catch (e) {
        console.log(e);
    }
})

client.login(token);

async function checkOnline() {
    console.log("online: " + new Date());
}
const CheckTO = setInterval(() => checkOnline(), 300000)
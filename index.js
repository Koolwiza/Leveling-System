const Discord = require('discord.js'),
    db = require('quick.db'),
    canvas = require('canvacord')

const client = new Discord.Client()
const {
    color,
    PREFIX,
    token,
    emoji,
    img
} = require('./config.json')

client.on('ready', () => {
    console.clear()
    console.log(client.user.tag + ' is online!')
})

client.on('message', async message => {

    if (message.author.bot) return;
    if (message.author.id === message.client.user.id) return;
    if (message.channel.type === "dm" || !message.guild) return;

    db.set(`level1`, 50)
    db.set(`level2`, 170)
    db.set(`level3`, 400)
    db.set(`level4`, 500)
    db.set(`level5`, 750)
    db.set(`level6`, 850)
    db.set(`level7`, 950)
    db.set(`level8`, 1000)
    db.set(`level9`, 1250)
    db.set(`level10`, 1500)

    db.add(`messages_${message.guild.id}_${message.author.id}`, 1)
    let msgs = await db.fetch(`messages_${message.guild.id}_${message.mentions.users.first() ? message.mentions.users.first().id : message.author.id}`)

    let rank = 1

    var reqXP = 50

    let levelUpChannel = db.fetch(`channel_${message.guild.id}`)
    if (message.content.startsWith(PREFIX) && levelUpChannel === null) {
        if (message.content.startsWith(PREFIX + 'channel')) {
            let channel = message.mentions.channels.first() || message.channel || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name.startsWith(args[0]))
            if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply("you don't have permission to use this command")
            db.set(`channel_${message.guild.id}`, channel.id)
            await message.channel.send('New channel set as ' + channel)
        }
        return message.reply('commands are not set up')
    }

    // There's probably a more efficient way of doing this but yk im lazy so yea :)

    if (msgs > await db.fetch(`level1`)) reqXP = (await db.fetch(`level2`)), rank = 2/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 2!`)*/
    if (msgs > await db.fetch(`level2`)) reqXP = (await db.fetch(`level3`)), rank = 3/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 3!`)*/
    if (msgs > await db.fetch(`level3`)) reqXP = (await db.fetch(`level4`)), rank = 4/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 4!`)*/
    if (msgs > await db.fetch(`level4`)) reqXP = (await db.fetch(`level5`)), rank = 5/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 5!`)*/
    if (msgs > await db.fetch(`level5`)) reqXP = (await db.fetch(`level6`)), rank = 6/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 6!`)*/
    if (msgs > await db.fetch(`level6`)) reqXP = (await db.fetch(`level7`)), rank = 7/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 7!`)*/
    if (msgs > await db.fetch(`level7`)) reqXP = (await db.fetch(`level8`)), rank = 8/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 8!`)*/
    if (msgs > await db.fetch(`level8`)) reqXP = (await db.fetch(`level9`)), rank = 9/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 9!`)*/
    if (msgs > await db.fetch(`level9`)) reqXP = (await db.fetch(`level10`)), rank = 10/*, message.guild.channels.cache.get(levelUpChannel).send(`${message.author} leveled up to level 10!`)*/


    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "rank") {
        let user = message.mentions.users.first() || message.author

        let rankMsg = db.fetch(`messages_${message.guild.id}_${user.id}`)
        let lbMessage = db.all().filter(data => data.ID.startsWith(`messages_${message.guild.id}`)).sort((a, b) => b.data - a.data)

        let place = lbMessage.findIndex(p => p.ID === `messages_${message.guild.id}_${user.id}`)

        const rankCard = new canvas.Rank()
            .setAvatar(user.displayAvatarURL({
                format: 'png'
            }))
            .setCurrentXP(rankMsg)
            .setRequiredXP(reqXP)
            .setStatus(user.presence.status)
            .setProgressBar(color, "COLOR")
            .setUsername(user.username)
            .setDiscriminator(user.discriminator)
            .setBackground("IMAGE", img)
            .setLevel(rank, 'Level: ', true)
            .setRank(place + 1, 'Rank: ', true)

        rankCard.build()
            .then(data => {
                const attachment = new Discord.MessageAttachment(data, "RankCard.png");
                message.channel.send(attachment);
            });
    }

    if (command === "leaderboard") {
        let lbMessage = db.all().filter(data => data.ID.startsWith(`messages_${message.guild.id}`)).sort((a, b) => b.data - a.data)
        lbMessage.length = 10;
        var finalLb = ""

        for (var i in lbMessage) {
            finalLb += `**${lbMessage.indexOf(lbMessage[i])+1}. <@${message.client.users.cache.get(lbMessage[i].ID.split('_')[2]) ? message.client.users.cache.get(lbMessage[i].ID.split('_')[2]).id : "Unknown User#0000"}>** • ${chat}  ${lbMessage[i].data}\n`;
        }
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${message.guild.name}'s Message Leaderboard`)
            .setColor("#7289da")
            .setDescription(finalLb)
            .setFooter(message.client.user.username, message.client.user.displayAvatarURL())
            .setTimestamp()
        message.channel.send(embed);
    }

    if (command === "resetmessages") {
        if (!message.member.hasPermission("ADMINISTRATOR")) return

        db.all().filter(d => d.ID.startsWith(`messages_${message.guild.id}`)).forEach(d => db.delete(d.ID))
        message.channel.send(':white_check_mark: Cleared all messages!')
    }

})

client.login(token)
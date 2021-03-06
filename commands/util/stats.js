const Discord = require('discord.js');
const winstonLogHandler = require('../../handler/util/winstonLogHandler');
const configHandler = require('../../handler/util/configHandler');
const package = require('../../package.json');
const os = require('os');
const logger = winstonLogHandler.getLogger();

let generalConfig;

module.exports = {
    name: 'stats',
    description: 'Show stats about the bot.',
    disabled: false,
    requireDB: false,
    execute(client, message) {
        generalConfig = configHandler.getGeneralConfig();
        const uptime = convertUptime(process.uptime());
        const usedRAM = Math.floor(process.memoryUsage().rss / 1000000);
        logger.silly('status: sending message...');
        const embed = new Discord.MessageEmbed()
            .setTitle(`${generalConfig.botName} Statistics`)
            .setThumbnail(client.user.avatarURL())
            .setColor('DARK_GREEN')
            .addField('❯Uptime', uptime, true)
            .addField('❯RAM', `${usedRAM}MB`, true)
            .addField('❯Version', `v${package.version}`, true)
            .addField('❯Host', os.hostname(), true)
            .addField('❯Source', '[Click here!](https://github.com/weebs-online/Monika)', true)
        ;
        message.channel.send(embed).catch(error => {
            logger.error(`stats: Error: ${error}`);
        });
    },
};

function convertUptime(uptimeSeconds) {
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }

    const days = Math.floor(uptimeSeconds / (60 * 60) / 24);
    const hours = Math.floor(uptimeSeconds / (60 * 60) % 24);
    const minutes = Math.floor(uptimeSeconds % (60 * 60) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}
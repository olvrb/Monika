const winstonLogHandler = require('../../handler/util/winstonLogHandler');
const mariadbHandler = require('../../handler/util/mariadbHandler');
const cacheHandler = require('../../handler/util/cacheHandler');
const logger = winstonLogHandler.getLogger();

module.exports = {
    name: 'setguildprefix',
    description: 'Sets the Prefix for the Guild the author is in if he has the Permissions to do so.',
    disabled: false,
    async execute(client, message, args) {
        if (!message.guild) return;
        if (message.member.hasPermission('MANAGE_GUILD')) {
            const guildId = message.guild.id;
            const prefix = args.join(' ');
            try {
                await mariadbHandler.functions.setGuildPrefix(prefix, guildId);
                cacheHandler.createPrefixCache(guildId, prefix);
                message.channel.send(`Set the Prefix to **${prefix}**`).catch(error => logger.error(`SetGuildPrefix: error sending message: ${error}`));
            } catch (error) {
                logger.error(`SetGuildPrefix: ${error}`);
            }
        } else {
            message.channel.send('You don\'t have the Permission (MANAGE_GUILD) to set the Prefix for this Server!').catch(error => logger.error(`SetGuildPrefix: error sending message: ${error}`));
        }
    },
};
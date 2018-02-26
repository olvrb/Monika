const winstonLogHandler = require('../../handler/util/winstonLogHandler');
const mariadbHandler = require('../../handler/util/mariadbHandler');
const config = require('../../configuration/config');
const logger = winstonLogHandler.getLogger();
const cacheHandler = require('../../handler/util/cacheHandler');

module.exports = {
    name: 'showguildprefix',
    description: 'Shows the Prefix for the Guild the message author is in.',
    async execute(client, message) {
        if (!message.guild) return;
        const guildId = message.guild.id;
        let prefix;
        if (cacheHandler.getCache().has(guildId)) {
            prefix = cacheHandler.getCache().get(guildId).prefix;
        } else {
            try {
                const result = await mariadbHandler.functions.getGuildPrefix(guildId);
                if (result.length === 1) {
                    prefix = result[0].prefix;
                } else {
                    prefix = config.commandPrefix;
                    logger.verbose(`Use default Prefix ${prefix}`);
                }
            } catch (error) {
                logger.error(`showGuildPrefix: ${error.code} ${error.sqlMessage}`);
                prefix = config.commandPrefix;
            }
        }
        try {
            await message.channel.send(`The Prefix is ${prefix}`);
        } catch (error) {
            logger.error(`showGuildPrefix: Error while trying to send Prefix: ${error}`);
        }
    },
};
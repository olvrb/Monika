const winstonLogHandler = require('../handler/util/winstonLogHandler');
const logger = winstonLogHandler.getLogger();
const configHandler = require('../handler/util/configHandler');

exports.run = async (client) => {
    logger.info('Ready: I\'m ready to follow your orders');
    await configHandler.initialize(client);
    try {
        const response = await client.user.setActivity(configHandler.getGeneralConfig().presenceGame, { type: 'WATCHING' });
        logger.info('Ready: Presence set to: ' + response.activity.name);
    } catch (error) {
        logger.error(`Ready: I failed to set the Presence! Error: ${error}`);
    }
};
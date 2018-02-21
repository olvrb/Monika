const mariadbHandler = require('../../handler/mariadbHandler');
const winstonLogHandler = require('../../handler/winstonLogHandler');
const logger = winstonLogHandler.getLogger();

module.exports = {
    name: 'listleagueaccounts',
    description: 'List all LeagueOfLegends accounts that are linked with your Discord account.',
    execute(client, message) {
        mariadbHandler.functions.getLeagueAccountsOfDiscordId(message.author.id).then(data => {
            logger.silly(`listLeagueAccounts: Data: \n ${data}`);
            for(let i = 0; i < data.length;i++) {
                message.channel.send(`${data[i].summonerName} ${data[i].region} ${data[i].isMain}`);
            }
        }).catch(error => {
            logger.error(`listLeagueAccounts: Error: ${error}`);
        });
    },
};
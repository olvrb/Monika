const Discord = require('discord.js');
const config = require('../../configuration/config');
const lolApi = require('league-api-2.0');
const secretHandler = require('../../handler/util/secretHandler');
const configHandler = require('../../handler/util/configHandler');
const winstonLogHandler = require('../../handler/util/winstonLogHandler');
const logger = winstonLogHandler.getLogger();

module.exports = {
    name: 'lolinfo',
    description: 'Display information about the specified summoner.',
    disabled: true,
    requireDB: false,
    execute(client, message, args) {
        const leagueConfig = configHandler.getLeagueConfig();
        lolApi.base.setBaseURL(leagueConfig.baseURL);
        lolApi.base.setRateLimit(leagueConfig.rateLimit);
        lolApi.base.setKey(secretHandler.getApiKey('LOL_KEY'));
        lolApi.base.setRegion('euw1');

        logger.debug('Lolinfo: Trying to execute lol api getSummonerBySummonerName call');
        lolApi.executeCall('Summoner', 'getSummonerBySummonerName', args.join(' ')).then((responseSummoner) => {
            logger.debug('Lolinfo: Api getSummonerBySummonerName call executed successfully');
            logger.silly(`Lolinfo: Result: ${responseSummoner}`);
            const embed = new Discord.MessageEmbed()
                .setTitle('Lolinfo command:')
                .setColor('DARK_GREEN')
                .setThumbnail('http://avatar.leagueoflegends.com/euw/' + args.join('%20') + '.png')
                .addField('SummonerName', responseSummoner.name)
                .addField('Summonerlevel', responseSummoner.summonerLevel)
                .addField('AccountID', responseSummoner.accountId)
                .setFooter('By ' + config.botName)
                .setTimestamp()
            ;
            logger.debug('Lolinfo: Trying to execute lol api getEloOfSummonerName call');
            lolApi.executeCall('Special', 'getEloOfSummonerName', args.join(' ')).then((response) => {
                logger.debug('Lolinfo: Api getEloOfSummonerName call executed successfully');
                logger.silly(`Lolinfo: Response: ${response}`);
                for (let i = 0; i < response.length; i++) {
                    embed.addField(response[i].queueType, response[i].leagueName + ' ' + response[i].tier + ' ' +
                        response[i].rank + ' | ' + response[i].leaguePoints + 'LP | Wins:' +
                        response[i].wins + ' | Losses: ' + response[i].losses);
                }
                message.channel.send({ embed });
            }).catch((error) => {
                logger.error(`Lolinfo: Error executing API call Error: ${error}`);
            });
        }).catch((error) => {
            logger.error(`Lolinfo: Error executing API call Error: ${error}`);
        });
    },
};
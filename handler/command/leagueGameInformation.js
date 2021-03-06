/*
//TODO I know. Reuse this stuff later
const lolApi = require('league-api-2.0');

const mariadbHandler = require('../util/mariadbHandler');
const winstonLogHandler = require('../util/winstonLogHandler');
const logger = winstonLogHandler.getLogger();
const secretHandler = require('../util/secretHandler');
const configHandler = require('../util/configHandler');


// TODO remove webhook if prod
// Might be needed in the future
// const tierIconURL = 'https://raw.githubusercontent.com/RiotAPI/Riot-Games-API-Developer-Assets/master/tier-icons/tier-icons-base/';


exports.run = (client, discordUserId) => {
    const leagueConfig = configHandler.getLeagueConfig();
    lolApi.base.setBaseURL(leagueConfig.baseURL);
    lolApi.base.setRateLimit(leagueConfig.rateLimit);
    lolApi.base.setKey(secretHandler.getApiKey('LOL_KEY'));

    logger.info('leagueGameInformation: Requesting Data...');
    main(client, discordUserId).then(response => {
        if (response) {
            logger.info('leagueGameInformation: Successful!');
        } else {
            logger.info('leagueGameInformation: Aborted!');
        }
    });
};

async function main(client, discordUserId) {
    if (!await isFlagEnabled(discordUserId)) {
        logger.error(`leagueGameInformation: EnableLiveGameStats is not enabled for User with discordId: ${discordUserId}`);
        return false;
    }
    const accounts = await getAccounts(discordUserId);
    if (!(accounts.length === 0)) {
        const mainAccount = getMain(accounts);
        let result;
        if (mainAccount) {
            result = await handleMainAccount(mainAccount, accounts);
        } else {
            result = await tryOtherAccounts(accounts);
        }
        if (result) {
            await sendResult(client, result);
            return true;
        } else {
            logger.info(`leagueGameInformation: No Account for User with discordId: ${discordUserId} in-game!`);
            return false;
        }
    } else {
        logger.info(`leagueGameInformation: No Accounts found for User with discordId: ${discordUserId}`);
        return false;
    }
}

async function isFlagEnabled(discordUserId) {
    const resultList = await mariadbHandler.functions.getEnableLiveGameStatsForDiscordId(discordUserId);
    for (const item of resultList) {
        if (item.enableLiveGameStats === 0) {
            return false;
        }
    }
    return true;
}

async function getAccounts(discordUserId) {
    let accounts;
    try {
        accounts = await mariadbHandler.functions.getLeagueAccountsOfDiscordId(discordUserId);
    } catch (error) {
        logger.error(`leagueGameInformation: Error requesting accounts from DB. Error: ${error}`);
    }
    return accounts;
}

function getMain(list) {
    return list.find(summonerNames => summonerNames.isMain === 1);
}

async function handleMainAccount(mainAccount, accounts) {
    let result;
    lolApi.base.setRegion(mainAccount.region);
    try {
        result = await lolApi.executeCall('Special', 'getCurrentGameParticipantElo', mainAccount.SummonerName);
    } catch (error) {
        if (error.status === 404) {
            logger.debug(`leagueGameInformation: League Account: ${mainAccount.summonerName} not in Game. Trying next...`);
            result = await tryOtherAccounts(accounts);
        } else {
            logger.error(`leagueGameInformation: Error requesting game information. Status: ${error.status} Message: ${error.message}`);
        }
    }
    return result;
}

async function tryOtherAccounts(accountList) {
    const otherAccounts = getAllWithoutMain(accountList);
    const result = await callEachAccount(otherAccounts);
    if (result !== 'default') {
        return result;
    }
}

function getAllWithoutMain(list) {
    return list.filter(function(user) {
        return user.isMain !== 1;
    });
}

async function callEachAccount(accountList) {
    for (const account of accountList) {
        lolApi.base.setRegion(account.region);
        try {
            return await lolApi.executeCall('Special', 'getCurrentGameParticipantElo', account.summonerName);
        } catch (error) {
            if (error.status === 404) {
                logger.debug(`leagueGameInformation: League Account: ${account.summonerName} not in Game. Trying next...`);
            } else {
                logger.error(`leagueGameInformation: Error requesting game information. Status: ${error.status} Message: ${error.message}`);
            }
        }
    }
    return 'default';
}

async function sendResult(client, result) {
    // const fields = await buildEmbedFields(result);
    // discordCustomEmbedHandler.run(client, 'Live Game Stats', fields, debugHook);
}

async function buildEmbedFields(result) {
    let blueTeamValue = '';
    let redTeamValue = '';
    for (const summoner of result) {
        if (summoner.TeamId === 100) {
            blueTeamValue = blueTeamValue.concat(`__${summoner.SummonerName}__: \n`);
            if (summoner.SummonerElo.length === 0) {
                blueTeamValue = redTeamValue.concat('*UNRANKED*');
                blueTeamValue = redTeamValue.concat('\n');
            } else {
                for (const elo of summoner.SummonerElo) {
                    blueTeamValue = blueTeamValue.concat(`*${elo.queueType}*: **${elo.tier}** **${elo.rank}**`);
                    blueTeamValue = blueTeamValue.concat('\n');
                }
            }
            blueTeamValue = blueTeamValue.concat('\n');
        } else {
            redTeamValue = redTeamValue.concat(`__${summoner.SummonerName}__: \n`);
            if (summoner.SummonerElo.length === 0) {
                redTeamValue = redTeamValue.concat('*UNRANKED*');
                redTeamValue = redTeamValue.concat('\n');
            } else {
                for (const elo of summoner.SummonerElo) {
                    redTeamValue = redTeamValue.concat(`*${elo.queueType}*: **${elo.tier}** **${elo.rank}**`);
                    redTeamValue = redTeamValue.concat('\n');
                }
            }
            redTeamValue = redTeamValue.concat('\n');
        }
    }

    const fields = [];
    const redTeam = {};
    redTeam.name = '__**Red Team**__';
    redTeam.value = redTeamValue;

    const blueTeam = {};
    blueTeam.name = '__**Blue Team**__';
    blueTeam.value = blueTeamValue;

    fields.push(redTeam);
    fields.push(blueTeam);

    return fields;
}*/

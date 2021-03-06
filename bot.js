const Discord = require('discord.js');
const client = new Discord.Client();

const winstonLogHandler = require('./handler/util/winstonLogHandler');
const logger = winstonLogHandler.createLogger(`Shard ${client.shard.client.options.shardId}`);

const discordEventHandler = require('./handler/util/discordEventHandler');
const discordLoginHandler = require('./handler/util/discordLoginHandler');
const discordMessageHandler = require('./handler/util/discordMessageHandler');

initialize();

async function initialize() {

    await discordLoginHandler.run(client);
    await discordEventHandler.run(client);
    await discordMessageHandler.run(client);

    process.on('unhandledRejection', err => logger.error(`Uncaught Promise Rejection: \n${err.stack}`));
    process.on('SIGINT', () => client.destroy());
}

/*
Every day, I imagine a future where I can be with you
In my hand is a pen that will write a poem of me and you
The ink flows down into a dark puddle
Just move your hand - write the way into his heart!
But in this world of infinite choices
What will it take just to find that special day?
What will it take just to find that special day?

Have I found everybody a fun assignment to do today?
When you're here, everything that we do is fun for them anyway
When I can't even read my own feelings
What good are words when a smile says it all?
And if this world won't write me an ending
What will it take just for me to have it all?

Does my pen only write bitter words for those who are dear to me?
Is it love if I take you, or is it love if I set you free?
The ink flows down into a dark puddle
How can I write love into reality?
If I can't hear the sound of your heartbeat
What do you call love in your reality?
And in your reality, if I don't know how to love you
I'll leave you be.
*/
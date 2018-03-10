const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const winstonLogHandler = require('../../handler/util/winstonLogHandler');
const logger = winstonLogHandler.getLogger();

const cacheHandler = require('../../handler/util/cacheHandler');
const musicCache = cacheHandler.getMusicCache();
const apiKeyConfig = require('../../configuration/apiKeyConfig');

const youtube = new YouTube(apiKeyConfig.youtube);

module.exports = {
    name: 'play',
    description: 'Play music.',
    disabled: false,
    async execute(client, message, args) {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.channel.send('You need to be in a voice channel!');
        if(!await checkPermissions(client, message, voiceChannel)) return;
        if(await isYoutubeLink(args[0])) return await handleYoutubeLink(args[0], message, voiceChannel);
        // start search
        return await youtubeSearch(args.join(' '), message, voiceChannel);
    },
};

async function checkPermissions(client, message, voiceChannel) {
    const permissions = voiceChannel.permissionsFor(client.user);
    if(!permissions.has('CONNECT')) {
        logger.debug('play: Bot can not join Channel (MISSING_CONNECT_PERMISSION).');
        message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
        return false;
    }
    if(!permissions.has('SPEAK')) {
        logger.debug('play: Bot can not join Channel (MISSING_SPEAK_PERMISSION).');
        message.channel.send('I cannot speak in your voice channel, make sure I have the proper permissions!');
        return false;
    }
    logger.debug('Bot can join Channel.');
    return true;
}

async function isYoutubeLink(link) {
    if(link.match(/^https?:\/\/(www.youtube.com|youtube.com)\/(.*)$/)) {
        return true;
    } else {
        return false;
    }
}

async function isYoutubePlaylist(link) {
    if(link.match((/^https?:\/\/(www.youtube.com|youtube.com)\/.*list(.*)$/))) {
        return true;
    } else {
        return false;
    }
}

async function handleYoutubeLink(youtubeLink, message, voiceChannel) {
    if(await isYoutubePlaylist(youtubeLink)) return await handleYoutubePlaylist(youtubeLink, message, voiceChannel);
    const videoObject = await youtube.getVideo(youtubeLink);
    await handleYoutubeVideo(videoObject, message, voiceChannel);
}

async function handleYoutubePlaylist(youtubePlaylistLink, message, voiceChannel) {
    logger.debug('Indexing playlist');
    const playlist = await youtube.getPlaylist(youtubePlaylistLink);
    const videos = await playlist.getVideos();
    message.channel.send(`The Playlist **${playlist.title}** has been added to the queue!`);
    for(const video of videos) {
        await handleYoutubeVideo(video, message, voiceChannel, true);
    }
}

async function youtubeSearch(searchString, message, voiceChannel) {
    let video;
    try {
        const videos = await youtube.searchVideos(searchString, 10);
        let index = 1;
        message.channel.send(`
___**Search results:**___
${videos.map(searchVideo => `**${index++} -** ${searchVideo.title}`).join('\n')}
    
***Usage: 1-10 (Timeout 10sec)***`);
        try {
            const response = await message.channel.awaitMessages(m => m.content > 0 && m.content < 11, {
                max: 1,
                time: 10000,
                errors: ['time'],
            });
            const videoIndex = parseInt(response.first().content);
            video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
            logger.error(`play: Error: ${err}`);
            return message.channel.send('No or invalid value entered, cancelling video selection.');
        }
    } catch (err) {
        logger.error(`play: Error: ${err}`);
        return message.channel.send('I could not obtain any search results.');
    }
    await handleYoutubeVideo(video, message, voiceChannel);
}

async function handleYoutubeVideo(video, message, voiceChannel, playlist = false) {
    let musicQueue = musicCache.get(message.guild.id);
    const song = {
        id: video.id,
        title: video.title,
        url: `https://youtube.com/watch?v=${video.id}`,
        requested_by: message.author,
        type: video.kind,
        thumbnail: video.thumbnails.default.url,
        publishedAt: video.publishedAt,
        uploader: video.channel.title,
    };
    if(!musicQueue) {
        cacheHandler.createMusicQueueCache(message.guild.id);
        musicQueue = await musicCache.get(message.guild.id);
        musicQueue.textChannel = message.channel;
        musicQueue.voiceChannel = message.member.voiceChannel;
        musicQueue.songs.push(song);

        try {
            musicQueue.connection = await voiceChannel.join();
            play(message.guild, musicQueue.songs[0]);
            musicQueue.playing = true;
        } catch (error) {
            logger.error(error);
            musicCache.delete(message.member.guild.id);
            message.channel.send('I could not join the voice channel!');
        }
    } else {
        musicQueue.songs.push(song);
        if(!playlist) return message.channel.send(`**${song.title}** has been added to the queue!`);
    }
}

function play(guild, song) {
    const musicQueue = musicCache.get(guild.id);
    if(!song) {
        musicQueue.voiceChannel.leave();
        musicCache.delete(guild.id);
        return;
    }
    const dispatcher = musicQueue.connection.play(ytdl(song.url, { filter: 'audio' }))
        .on('end', () => {
            logger.debug('play: Dispatcher.end() triggered.');
            if(!musicQueue.loop) musicQueue.songs.shift();
            play(guild, musicQueue.songs[0]);
        })
        .on('error', error => logger.error(`play: Error: ${error}`))
        .on('debug', debug => logger.debug(`play: Error: ${debug}`))
    ;
    dispatcher.setVolume(musicQueue.volume);
    const startPlayingEmbed = new Discord.MessageEmbed()
        .setTitle('🎵 Start Playing:')
        .setColor('DARK_RED')
        .setTimestamp(song.publishedAt)
        .setFooter(`By ${song.uploader}`)
        .setThumbnail(song.thumbnail)
        .addField('Title', `[${song.title}](${song.url})`)
        .addField('Requested by:', song.requested_by)
    ;
    musicQueue.textChannel.send(startPlayingEmbed);
}
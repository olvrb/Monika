const danbooruHandler = require('../../handler/command/danbooruHelperXml');

module.exports = {
    name: 'rule34',
    description: 'Get a random image from rule34.xxx',
    disabled: false,
    execute(client, message, args) {
        danbooruHandler.run(client, message, args, 'https://rule34.xxx/', 'Rule34', '');
    },
};
//includes a bunch of consts and settings

let CHANNEL = 'waterdance',
    CHANNEL_ID = getChannelID(CHANNEL),
    IGNORE_LIST = ['mogballbot', 'waterdance'],
    BTTV_EMOTES = CHANNEL_ID.then((id) => {
        return getBttvEmotes(id);
    });

/* Takes a Twitch channel name and get's it's ID in the form of a promise.
 * Uses the decapi.me api.
 * 
 * (channel): usename of the channel
 * 
 * return: a promise to the channel id
 * */
async function getChannelID(channel) {
    console.log(`Getting ${channel}'s ID...`);
    //use api to get id
    let id = fetch(`https://decapi.me/twitch/id/${channel}`)
        .then((response) => {
            if (response.status !== 200) {
                //request to get id failed
                console.log(`Could not get id. Status Code: ${response.status}`);
            }
            //got id successfully
            return response.text().then((data) => {
                return data;
            });
        });

    return id;
}

/* Takes a Twitch channel id and get's the global and channel BTTV emotes in the form of a promise.
 * Uses the BTTV api.
 * 
 * (id): id of the channel
 * 
 * return: a promise of an array of bttv emote id's and nicks
 * */
async function getBttvEmotes(id) {
    var emotes = new Map()

    console.log('Getting BTTV Global...');
    //use api to get global emotes
    fetch('https://api.betterttv.net/3/cached/emotes/global')
        .then((response) => {
            if (response.status !== 200) {
                //request to get global emotes failed
                console.log(`Could not get BTTV Global Emotes. Status Code: ${response.status}`);
            }

            return response.json().then((data) => {
                //parse json
                //loop through json array
                for (let mote of data) {
                    emotes.set(mote.code, getBttvEmoteUrl(mote.id));
                }
            });
        });

    console.log('Getting BTTV Channel...');
    //use api to get channel emotes
    fetch(`https://api.betterttv.net/3/cached/users/twitch/${id}`)
        .then((response) => {
            if (response.status !== 200) {
                //request to get channel emotes failed
                console.log(`Could not get BTTV Channel Emotes. Status Code: ${response.status}`);
            }

            return response.json().then((data) => {
                //parse json
                //loop through channel json array
                for (let mote of data.channelEmotes) {
                    emotes.set(mote.code, getBttvEmoteUrl(mote.id));
                }   
                //loop through shared json array
                for (let mote of data.sharedEmotes) {
                    emotes.set(mote.code, getBttvEmoteUrl(mote.id));
                }
            });
        });

    console.log('Success! Got BTTV emotes!')
    return emotes;
}

/* Gives a new emote url for BTTV emotes.
 * 
 * (id): id of the emote
 * 
 * return: a url of bttv emote
 * */
function getBttvEmoteUrl(id) {
    return `https://cdn.betterttv.net/emote/${id}/1x`;
}
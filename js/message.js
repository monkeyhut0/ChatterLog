/*
* Takes where the emotes are, and returns an array of sorted Emote objects.
* 
* emote_set: array of where the emotes are in the message, and what the id for them is.
* 
* return: map of emotes, in the form of "nick": "url"
* */
function parseTwitchEmotes(message, emote_set) {
    var map = new Map();

    //check arg
    if (!emote_set) {
        //no emotes in message
        return map;
    }

    //loop through each emote
    for (let [id, area] of Object.entries(emote_set)) {
        // {number: 'start-end'}
        //parse emote position
        let pos = area[0].match(/(\d+)-(\d+)/i);
        //check
        if (pos.length < 3) {
            console.error('Could not get emotes');
            return null;
        }
        //get emote nick
        temp = message.slice(pos[1], parseInt(pos[2]) + 1);
        //add emote
        map.set(temp, getTwitchEmoteUrl(id));
    }

    return map;
}

/*
    * Takes a twitch message + where the emotes are, and gives back an array of html objects of span and img
    * msg: Raw twitch message, string
    * emote_set: array of where the emotes are in the message, and what the id for them is, array of json
    * 
    * return: array of message fragments or emotes, in the order they belong. strings or links to images.
    * */
async function getMessageHTML(message, emote_set) {
    var html = [],
        emotes;
    let word_arr;

    //get twitch emotes and store in map
    emotes = parseTwitchEmotes(message, emote_set);
    //check
    if (!emotes) {
        console.error('Error getting emotes');
        return null;
    }

    //get bbtv emotes
    try {
        emotes = new Map([...emotes].concat([...await BTTV_EMOTES]));

    } catch (err) {
        console.error('Could not get bttv emotes.');
    }

    //get ffz emotes
    try {
        emotes = new Map([...emotes].concat([...await FFZ_EMOTES]));

    } catch (err) {
        console.error('Could not get ffz emotes.');
    }

    if (emotes.length === 0) { //no emotes in message
        html.push(stringToHTML(message));
        return html;
    }

    //split message into individual words
    word_arr = message.split(" ");
    var msg_frag = '';
    //check to see if words are an emote
    for (const word of word_arr) {
        let temp = emotes.get(word);
        if (temp) {
            //word is an emote
            if (msg_frag !== '') {
                //add message fragment before emote
                html.push(stringToHTML(msg_frag));
                //reset
                msg_frag = '';
            }

            html.push(emoteToHTML(temp));
        } else {
            //word is not an emote, add to msg fragment
            msg_frag += ` ${word}`;
        }
    }
    //add last part of message if it exists
    if (msg_frag !== '') {
        html.push(stringToHTML(msg_frag));
    }

    //all set
    return html;
}

function stringToHTML(message) {
    let temp;

    temp = document.createElement("span");
    temp.classList.add('message-part');
    temp.appendChild(document.createTextNode(message));

    return temp;
}

function emoteToHTML(emote_url) {
    let temp;

    temp = document.createElement("img");
    temp.classList.add('emote');
    temp.src = emote_url;

    return temp;
}


function getTwitchEmoteUrl(id){
    return `https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0`;
}
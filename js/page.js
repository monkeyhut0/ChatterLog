const client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    channels: [CHANNEL]
});

//triggers on new message
client.on('message', (channel, tags, message, self) => {
    if (isIgnored(tags.username)) return;

    handleMessage(message, tags);
});

//triggers on new sub
client.on('subscription', (channel, display, method, message, tags) => {
    if (isIgnored(tags.username)) return;

    console.log("Sub");
    console.log(JSON.parse(JSON.stringify(tags)));

    tags.username = display.toLowerCase();

    if (!message) {
        //no message given
        message = `${display} just subscribed for the first time!`;
    }

    handleMessage(message, tags);
});

//triggers on resub
client.on('resub', (channel, display, months, message, tags, methods) => {
    if (isIgnored(tags.username)) return;

    console.log("resub");
    console.log(JSON.parse(JSON.stringify(tags)));

    tags.username = display.toLowerCase();

    if (!message) {
        if (!tags['system-msg']) {
            //no message given
            message = `${display} has subscribed for ${tags['msg-param-cumulative-months']} months!`;
        } else {
            message = tags['system-msg'];
        }
    }

    handleMessage(message, tags);
});

//triggers when someone gifts a sub.
client.on("subgift", (channel, display, streakMonths, recipient, methods, tags) => {
    if (isIgnored(tags.username)) return;

    let message = `${display} gifted a sub to ${recipient}!`;
    tags.username = display.toLowerCase();
    handleMessage(message, tags);
});

//triggers on cheer
client.on('cheer', (channel, tags, message) => {
    if (isIgnored(tags.username)) return;

    console.log("cheer");
    console.log(JSON.parse(JSON.stringify(tags)));

    handleMessage(message, tags);
});

//triggers on new connection
client.on('connection', (addr, port) => {
    console.log('* Connected to $(addr):$(port)');
});

//connect to channel
client.connect().catch(console.error);

class Message {
    constructor(text, time) {
        this.text = text;
        this.time = time;
    }
}

class User {
    constructor(name, paint, message, time) {
        this.username = name;
        this.color = paint;
        this.num = 1;
        this.messages = [new Message(message, time)];
    }
    newMessage(message, time) {
        this.num += 1;
        this.messages.push(new Message(message, time));
    }
    updateHistory() {
        let container = document.getElementById(this.username + '_history');

        for (let line of this.messages) {
            var template = document.getElementById('history_line').content.cloneNode(true).firstElementChild;

            //insert message and time
            template.querySelector(".message").innerHTML = line.text;
            template.querySelector(".timestamp").textContent = line.time;
            //insert into doc
            container.prepend(template);
        }
    }
    clearHistory() {
    let container = document.getElementById(this.username + '_history');

    //clear history
    container.innerHTML = '';
    }
}

var chatters = [],
    total_message = 0;


//tags needs username, display-name, tmi-sent-ts, emotes, color
async function handleMessage(message, tags) {
    let username = tags.username,
        time = convertDate(tags["tmi-sent-ts"]),
        display = tags["display-name"],
        emotes = tags.emotes,
        color = tags.color;
    //check username
    if (!username && display) {
        //no username found
        username = display.toLowerCase();
        console.log('No username given.');
    }
    //check time
    if (!tags["tmi-sent-ts"]) {
        //no time sent
        time = 'N/A';
        console.log('No time given');
    }

    //check to see if they're already in the list
    if (chatters.length > 0) {
        for (var i = 0; i < chatters.length; i++) {
            if (username == chatters[i].username) {
                //they are on the list
                let container = document.getElementById(username + '_msg'),
                    timestamp = document.getElementById(username + '_time').querySelector('span');

                //add previous message to history
                /*var template = document.getElementById('history_line').content.cloneNode(true).firstElementChild;

                //insert message and time
                template.querySelector(".message").innerHTML = container.innerHTML;
                template.querySelector(".timestamp").textContent = timestamp.textContent;
                //insert into doc
                document.getElementById(username + '_history').prepend(template);*/

                //update html

                document.getElementById('total_msgs').textContent = 'Total Messages: ' + ++total_message;
                //update message,
                container.innerHTML = '';
                try {
                    //get html objects
                    let stuff = await getMessageHTML(message, emotes);

                    for (const part of stuff) {
                        //append to message container
                        container.appendChild(part);
                    }

                    chatters[i].newMessage(container.innerHTML, time);
                } catch (err) {
                    console.error(err);
                    //just use raw message
                    let frag = document.createElement("span");
                    frag.classList.add('message-part');
                    frag.appendChild(document.createTextNode(message))
                    container.append(frag);


                    chatters[i].newMessage(container.innerHTML, time);
                }

                //increment their message number
                document.getElementById(username + '_num').textContent = chatters[i].num;
                timestamp.textContent = time;

                //check to see if color changed
                if ((color != chatters[i].color) && (chatters[i].color)) {
                    //new color
                    var temp = getColor(color);
                    chatters[i].color = temp;
                    document.getElementById(username).style.color = temp;
                }

                //check unlurk
                let unlurk = /!unlurk(?!\S)/i,
                    ele = document.getElementById(username),
                    animation;
                if (unlurk.test(message)) {
                    //move to top of page
                    document.getElementById('table').prepend(ele);
                    //flash init background
                    animation = 'init_animation'
                    //remove init animation
                    setTimeout(() => {
                        ele.classList.remove('init_animation');
                    }, 3000); //3sec
                } else {
                    //flash regular background
                    animation = 'update_animation'
                }
                //flash
                ele.classList.remove(animation);
                void ele.offsetWidth;
                ele.classList.add(animation);
                return;
            }
        }
    }

    //user not found in list
    if (!color)
        color = 'white'; //no color set, put as default
    else
        color = getColor(color); //check color for contrast

    //copy template
    var template = document.getElementById('user_init_box').innerHTML;
    //add vars from template
    var item = eval('`' + template + '`');
    //insert into doc
    document.getElementById('table').insertAdjacentHTML("afterbegin", item);

    //add list click
    document.getElementById(username).addEventListener("click", () => {
        let ele = document.getElementById(username + '_history'),
            user = chatters.find(element => element.username == username);

        //toggle
        if (ele.style.maxHeight) {
            ele.style.maxHeight = null;
            user.clearHistory();
        } else {
            //update content
            user.updateHistory();
            ele.style.maxHeight = '10em';
        }
    });

    //add name click
    document.getElementById(username + '_name').querySelector('span').addEventListener("click", (event) => {
        window.open("https://www.twitch.tv/popout/waterdance/viewercard/" + username);
        event.stopPropagation();
    });

    //message
    //add emotes
    try {
        //get html objects
        let stuff = await getMessageHTML(message, emotes),
            container = document.getElementById(username + '_msg');

        for (const part of stuff) {
            //append to message container
            container.appendChild(part);
        }

        addChatter(username, tags.color, container.innerHTML, time); //use true color
    } catch (err) {
        console.error(err);
        //just use raw message
        let frag = document.createElement("span");
        frag.classList.add('message-part');
        frag.appendChild(document.createTextNode(message))
        document.getElementById(username + '_msg').append(frag);
    }

    //update totals
    document.getElementById('total_chat').innerHTML = 'Total Chatters: ' + chatters.length;
    document.getElementById('total_msgs').innerHTML = 'Total Messages: ' + ++total_message;

    //remove init animation
    setTimeout(() => {
        document.getElementById(username).classList.remove('init_animation');
    }, 3000); //3sec
}

//adds new chatter to the chatter array
function addChatter(name, paint, message, time) {
    //make new json
    let user = new User(name, paint, message, time);

    //add to array
    chatters.push(user);
}

function convertDate(time) {
    var date = new Date(parseInt(time));
    return date.toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isIgnored(name) {
    //check to see if name is in ignore list
    for (var i = 0; i < IGNORE_LIST.length; i++) {
        if (IGNORE_LIST[i] == name)
            return true; //found
    }
    return false; //not found
}

//search function
document.getElementById('input').addEventListener('keyup', () => {
    let results = document.getElementById("input").value.toLowerCase(),
        peeps = document.getElementsByClassName('list');

    for (const user of peeps) {
        //check results against users
        if (user.id.includes(results)) {
            //match found, reset display
            user.style.display = null;
        } else {
            //does not match, hide
            user.style.display = 'none';
            user.classList.remove('update_animation', 'init_animation');
        }
    }
});
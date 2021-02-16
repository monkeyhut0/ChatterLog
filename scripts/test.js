
async function testFunction() {
    //get current date
    var date = new Date();
    let day = date.getDate();

    //check
    if (day == 15 || day == 16) {
        //yay happy birthday
        const colors = ['red', 'orange', 'yellow', 'green', 'rgb(97,97,255)',
            '#AA33FF', 'violet'];

        let newt = document.createElement('div');
        newt.id = 'overlay';
        newt.style.cssText = `
        display: block;
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(0,0,0,50%);
        color: white;
        text-align: center;
        font-size: 52px;
        padding-top: calc(50vh - 52px);
        animation: changeColor 9s infinite;`;
        newt.textContent = "Happy Birthday!";

        document.body.append(newt);

        let cute = document.createElement('img');
        cute.id = 'cute';
        cute.src = 'https://static-cdn.jtvnw.net/emoticons/v1/197401/3.0'
        cute.style.cssText = `
        position: fixed;
        top: calc(50vh + 52px);
        left: calc(50vw - 112px / 2);
        z-index: 2;
        `;

        document.body.append(cute);

        let close = document.createElement('div');
        close.id = 'close';
        close.style.cssText = `
        position: fixed;
        color: white;
        font-size: 32px;
        top: 0;
        right: 32px;
        cursor: pointer;
        z-index: 2;
        `;
        close.textContent = 'X';

        close.addEventListener('click', () => {
            //remove everything
            document.getElementById('overlay').remove();
            document.getElementById('cute').remove();
            document.getElementById('close').remove();
        });

        document.body.append(close);
    }
}

testFunction();
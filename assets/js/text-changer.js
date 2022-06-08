const editable = document.querySelector('.changing-text');

const words = [
    'CO2',
    'Biomasse',
    'Tonnen',
    'Kompost',
    'Menschen',
    'Biogas',
    'Wertstoffe',
    'Ressourcen',
    'Lebensmittel',
    'Erde',
    'Zukunft'
];
const animationTimeInms = 100;
const delayInms = 2000;

function close(index) {
    editable.textContent = words[index % words.length];
    const interval = setInterval(function() {
        const text = editable.textContent;
        if (!text) {
            clearInterval(interval);
            setTimeout(function() {
                open(++index);
            }, 100);
        }
        editable.textContent = text.slice(0, -1);
    }, animationTimeInms);
}

function open(index) {
    const initialText = words[index % words.length];
    let i = 1;
    editable.textContent = '';
    const interval = setInterval(function() {
        const text = editable.textContent;
        //console.log(text.length === initialText.length);
        if (text.length === initialText.length) {
            clearInterval(interval);
            setTimeout(function() {
                close(index);
            }, delayInms);
        }
        editable.textContent = initialText.slice(0, i++);
    }, animationTimeInms);
}

function writeWords() {
    const i = 0;
    open(i);
}

writeWords();

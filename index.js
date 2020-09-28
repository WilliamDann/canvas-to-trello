var { readFileSync, writeFileSync } = require('fs');
var { getUserTodos, getUserCourses, getCourseInfo } = require('./src/canvas');
var trelloRequest = require('./src/trello');

String.prototype.decodeHTML = function() {
    var map = {"gt":">" /* , … */};
    return this.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function($0, $1) {
        if ($1[0] === "#") {
            return String.fromCharCode($1[1].toLowerCase() === "x" ? parseInt($1.substr(2), 16)  : parseInt($1.substr(1), 10));
        } else {
            return map.hasOwnProperty($1) ? map[$1] : $0;
        }
    });
};

function trimCourseCode(code) {
    return code.split('-')[0].trim();
}

// load config gile
var config = JSON.parse(readFileSync('config.json'));
if (!config['trello-list-create-to']) {
    console.log("Please specify 'trello-list-create-to'\n Lists listed below:\n")

    getLists(
        config['trello-key'],
        config['trello-token'],
        config['trello-board-id']
    ).then((data) => {
        console.log(data);
        process.exit();
    });

}

// get the todo & course info from canvas
async function getCanvasData() {
    return await getUserTodos(config['canvas-key']);
}

// get cards in a board
async function getTrelloCards(boardId) {
    return await trelloRequest(`/1/boards/${boardId}/cards`, 'GET', config['trello-key'], config['trello-token'], {});
}

// get canvas course info
async function getCanvasCourse(course_id) {
    return await getCourseInfo(config['canvas-key'], course_id);
}

// get lables from trello
async function getTrelloLables() {
    return await trelloRequest(`/1/boards/${config["trello-board-id"]}/labels`, 'GET', config['trello-key'], config['trello-token'], {});
}

// create a card in trello from canvas data
async function createCard(todo, labelId) {
    var data = {
        name: todo.assignment.name,
        desc: "",
        due: todo.assignment.due_at,
        idLabels: labelId,
        idList: config['trello-list-create-to']
    }

    if (todo.assignment.locked_for_user) {
        data.desc = "Assignment Descreption Unavalible - Assignment Locked\n\n";
        data.desc += todo.assignment.lock_explanation.replace(/(<([^>]+)>)/gi, "").decodeHTML();
    }
    
    if (todo.assignment.description) {
        data.desc += todo.assignment.description.replace(/(<([^>]+)>)/gi, "").decodeHTML();
    }
    data.desc += "\n\nurl: " + todo.assignment.html_url;

    return await trelloRequest('/1/cards', 'POST', config['trello-key'], config['trello-token'], data);
}

// create cards from canvas data
async function createCards() {
    let labels = await getTrelloLables();
    let todos  = await getCanvasData();
    let cards  = await getTrelloCards(config['trello-board-id']);

    let courseInfo = {}
    for (let todo of todos) {
        // if card already exists, skip
        let skip = false;
        for (let card of cards) {
            if (card.name == todo.assignment.name) {
                skip = true;
                break;
            }
        }
        if (skip) continue;

        // get course code for ids
        if (!courseInfo[todo.course_id]) 
            courseInfo[todo.course_id] = trimCourseCode((await getCanvasCourse(todo.course_id)).course_code);

        // set labels
        let labelId = ""
        for (let label of labels) {
            if (courseInfo[todo.course_id] == label.name) {
                labelId = label.id;
            }
        }

        createCard(todo, labelId);
    }
}

createCards();
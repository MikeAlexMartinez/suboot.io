
const save = require('../saveToMongo.js').insertOne;

const enter = { "id":17856695,
                "entry_name":"fantasyhippie11",
                "event_total":59,
                "player_name": "Joe Preston",
                "movement":"down",
                "own_entry":false,
                "rank":499964,
                "last_rank":447056,
                "rank_sort":500007,
                "total":2023,
                "entry":3143778,
                "league":313,
                "start_event":1,
                "stop_event":38,
                "got_picks": false
            };

save("users", enter)
    .then((r) => {
        console.log(r.insertedCount + " inserted!");
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });
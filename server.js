const express = require('express');
const cors = require('cors');

require('./services/telegramService'); // start telegram bot

const topupRoutes = require('./routes/topup');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/topup", topupRoutes);

app.listen(3000, ()=>{
    console.log("TopUp Service running on port 3000");
});


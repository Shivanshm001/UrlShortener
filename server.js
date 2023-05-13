require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const rootRouter = require('./routes/root');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", rootRouter);


app.get("*", (req, res) => {
    res.sendStatus(404);
})

const PORT = process.env.PORT || process.env.LOCAL_PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
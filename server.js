require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const rootRouter = require('./routes/root');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", rootRouter);

app.use("/*", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
const PORT = process.env.PORT || process.env.LOCAL_PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
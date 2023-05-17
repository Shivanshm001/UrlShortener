const dbconnection = require('../database/connect');
const crypto = require('crypto');
const VALID_URL_REGEX = /^https?:\/\//;

function urlSafeShortUrl(length) {
    const buffer = crypto.randomBytes(length).toString('hex');
    return buffer;
};


const createShortUrl = async (req, res) => {
    const { longUrl } = req.body;
    console.log(req.body);
    if (!longUrl) return res.sendStatus(422);
    const isValidUrl = VALID_URL_REGEX.test(longUrl);
    if (!isValidUrl) return res.sendStatus(400);


    try {
        const client = await dbconnection();
        const results = await client.query({
            text: 'SELECT * FROM "urls" WHERE "long_url" = $1',
            values: [longUrl]
        });
        if (results && results.rowCount > 0) return res.sendStatus(409);

        //In no duplicates found create a new short url
        const shortUrl = urlSafeShortUrl(16);

        await client.query({
            text: 'INSERT INTO "urls"("short_url","long_url") VALUES($1,$2)',
            values: [shortUrl, longUrl],
        });
        client.release();
        return res.status(201).json({ shortUrl });

    } catch (error) {
        if (error) {
            console.log(error?.message);
            console.log(error);
            res.status(500).json({ error });
        }
    }
};


const openShortUrlWebsite = async (req, res) => {
    const { shortUrl } = req.params;
    console.log();
    if (!shortUrl) return res.sendStatus(400);
    try {
        const client = await dbconnection();

        const results = await client.query({
            text: 'SELECT "short_url","long_url" FROM "urls" WHERE "short_url" = $1',
            values: [shortUrl]
        });
        const { rows } = results;
        const data = rows[0];

        if (rows.length <= 0 || Object.keys(data).length <= 0) return res.sendStatus(404);
        client.release();
        return res.status(301).redirect(data.long_url);
    } catch (error) {
        if (error) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }
};

const deleteUrlAfter24Hours = async (req, res) => {
    try {
        const client = await dbconnection();
        await client.query('DELETE FROM "urls" WHERE "expiresin" < NOW()');
        res.sendStatus(204);
    } catch (error) {
        if (error) {
            console.log("Error deleting urls after 24 hours");
            console.log(error.message);
        }
    }
};


module.exports = {
    createShortUrl,
    openShortUrlWebsite,
    deleteUrlAfter24Hours
}
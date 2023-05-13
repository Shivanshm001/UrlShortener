const dbconnection = require('../database/connect');
const bcrypt = require('bcrypt');

async function urlSafeShortUrl(longUrl, saltCount) {
    const hash = await bcrypt.hash(longUrl, saltCount);
    const urlSafeHash = hash.replace(/\//g, "_b").replace(/\+/g, "_p");
    return urlSafeHash;
};


const createShortUrl = async (req, res) => {
    const { longUrl } = req.body;
    console.log(req.body);
    try {
        const client = await dbconnection();
        const results = await client.query({
            text: 'SELECT * FROM "urls" WHERE "long_url" = $1',
            values: [longUrl]
        });
        if (results && results.rowCount > 0) return res.sendStatus(409);

        //In no duplicates found create a new short url
        const shortUrl = await urlSafeShortUrl(longUrl, 1);

        await client.query({
            text: 'INSERT INTO "urls"("short_url","long_url") VALUES($1,$2)',
            values: [shortUrl, longUrl],
        });
        client.release();
        return res.status(201).json({ shortUrl });

    } catch (error) {
        if (error) {
            console.log(error?.message);
            res.status(500).json({ error });
        }
    }
};


const openShortUrlWebsite = async (req, res) => {
    const { shortUrl } = req.params;
    console.log();
    if (!shortUrl) return res.sendStatus(400);
    console.log("Short URL: " + shortUrl);
    try {
        const client = await dbconnection();

        const results = await client.query({
            text: 'SELECT "short_url","long_url" FROM "urls" WHERE "short_url" = $1',
            values: [shortUrl]
        });
        const { rows } = results;
        const data = rows[0];

        if (rows.length <= 0 || Object.keys(data).length <= 0) return res.sendStatus(404);
        const website_url = data.long_url;
        client.release();
        return res.status(302).redirect(website_url);
    } catch (error) {
        if (error) {
            console.log(error.message);
            res.status(500).json({ error });
        }
    }
}
module.exports = {
    createShortUrl,
    openShortUrlWebsite
}
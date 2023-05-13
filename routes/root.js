const router = require('express').Router();
const rootController = require('../controller/rootController');


router.route("/").post(rootController.createShortUrl);
router.route("/:shortUrl").get(rootController.openShortUrlWebsite);

module.exports = router;
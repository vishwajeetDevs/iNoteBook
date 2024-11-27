const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    obj = {
        a : 'vishwajeet',
        number : 91
    }
    res.json (obj)
})

module.exports = router;
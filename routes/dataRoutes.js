const router = require('express').Router()
const { ObjectId } = require('mongodb')

// Query strings are used to filter results.

// Lists all databases in Mongodb cluster
router.get('/', async (req, res) => {
    const databases = await req.getDatabases()
    res.send(databases)
})

// Gets collections in a database
router.get('/:db', async (req, res) => {
    const collections = await req.listCollections(req.params.db, req.query)
    res.send(collections)
})

// Gets documents in a collection 
router.get('/:db/:col', async (req, res) => {
    if(req.query._id) {
        if(req.query._id.length == 24) {
            req.query._id = ObjectId(req.query._id)
        }
    }
    const data = await req.findMany(req.params.db, req.params.col, req.query)
    res.send(data)
})

// Deletes documents from collection
router.delete('/:db/:col', async (req, res) => {
    if(req.query._id) {
        if(req.query._id.length == 24) {
            req.query._id = ObjectId(req.query._id)
        }
    }
    await req.deleteItems(req.params.db, req.params.col, req.query)
    res.send('Document deleted')
})

// Adds document to collection
router.put('/:db/:col', async (req, res) => {
    const data = req.body
    const inserted = await req.addItem(req.params.db, req.params.col, data)
    const document = await req.findItem(req.params.db, req.params.col, {_id: inserted.insertedId})
    res.send(document[0])
})

// Updates document
router.post('/:db/:col', async (req, res) => {
    if(req.query._id) {
        if(req.query._id.length == 24) {
            req.query._id = ObjectId(req.query._id)
        }
    }
    const data = req.body
    const updated = await req.updateItem(req.params.db, req.params.col, req.query, data)
    res.send('Document Updated')
})

module.exports = router
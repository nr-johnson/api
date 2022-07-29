const {ObjectId} = require('mongodb');

function dataOps() {
    return (req, res, next) => {
        req.listCollections = (db, data) => {
            return new Promise(resolve => {
                data = data || {}
                resolve(req.mongo.db(db).listCollections(data).toArray())
            })
        }
        // Pulled from another app of mine. May not be needed.
        req.getRandom = (db, col, cond, count) => {
            return new Promise(resolve => {
                resolve(req.mongo.db(db).collection(col).aggregate([{$match: cond}, {$sample: {size: count}}]).toArray())
            })
        }
        // Pulled from another app of mine. May not be needed.
        req.findItem = (db, col, data, index) => {
            return new Promise(resolve => {
                if(index) resolve(req.mongo.db(db).collection(col).find(data).collation(index).limit(1).toArray())
                else resolve(req.mongo.db(db).collection(col).find(data).limit(1).toArray())
            })
        }
        req.addCollection = (db, col) => {
            return new Promise((resolve, reject) => {
                req.mongo.db(db).createCollection(col, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })
        }
        req.addItem = (db, col, data) => {
            return new Promise((resolve, reject) => {
                if(data._id) data._id = ObjectId(data._id)
                req.mongo.db(db).collection(col).insertOne(data, function(err, items) {
                    if (err) reject(err)
                    else resolve(items)
                })
            })
        }
        req.updateItem = (db, col, item, data) => {
            return new Promise((resolve, reject) => {
                req.mongo.db(db).collection(col).updateMany(item, {$set: data}, function(err, result) {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
        }
        req.findMany = (db, col, data) => {
            return new Promise(resolve => {
                data = data || {}
                resolve(req.mongo.db(db).collection(col).find(data).toArray())
            })
        }
        req.findCollection = (db, col, data) => {
            return new Promise(resolve => {
                data = data || {}
                resolve(req.mongo.db(db).collection(col).find(data).toArray())
            })
        }
        req.dropCollection = (db, col) => {
            return new Promise((resolve, reject) => {
                req.mongo.db(db).collection(col).drop((err, succ) => {
                    if(err) reject(err)
                    else if(succ) resolve()
                })
            })
        }
        req.deleteItems = (db, col, data) => {
            return new Promise(resolve => {
                resolve(req.mongo.db(db).collection(col).deleteMany(data))
            })
        }
        req.getDatabases = async () => {
            return new Promise(async resolve => {
                const resp = await req.mongo.db('Reviews').admin().listDatabases()
                resolve(resp.databases)
            })
        }

        next()
    }
}

module.exports = { dataOps }
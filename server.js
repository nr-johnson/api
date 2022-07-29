require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const boolParser = require('express-query-boolean')
const connectMongo = require('./functions/connect-mongo')
const http = require('http')
const ops = require('./functions/ops')

const app = express()

// Security check to ensure only authorized requests are made to the API. This is done using a whitelist stored as an enviornment variable.
app.use((req, res, next) => {
    const ip = req.headers['x-real-ip'] || req.header('x-forwarded-for') || req.connection.remoteAddress
    const whitelist = process.env.WHITELIST.split(',')
    let message = `Incoming Request. IP: ${ip}`
    
    if(whitelist.includes(ip)) {
        console.log(`${message} - Granted`)
        next()
    } else if(whitelist.includes(req.headers.origin)) {
        console.log(`${message} - Granted`)
        next()
    } else {
        console.log(`${message} - Denied`)
        res.status(403).send({status: 403, message: 'Access Denied'})
    }    
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

app.use(connectMongo(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}));
app.use(ops.dataOps())
app.use(boolParser())

const dataRoutes = require('./routes/dataRoutes')
app.use('/data', dataRoutes)

app.use('/', (req, res) => {
    res.send({
        data_functions : {
            url_structure: '/data/<database>/<collection>?<queries>',
            integration: 'MongoDB',
            methods: 'get, put, post, delete',
            note: "'/data' will return a list of all databases. '/data/<database>' will return a list of all collections in that database. '/data/<database>/<collection>' will return all documents within that collection. Query parameters are used to get/modify specfic documents or collections."
        }
    })
})


//  -- Server
const PORT = process.env.PORT || 9000

app.set('port', PORT)

const server = http.createServer(app)

server.listen(PORT, () => console.log(`API Server listening on port ${PORT}.`))
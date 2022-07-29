require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const boolParser = require('express-query-boolean')
const connectMongo = require('./functions/connect-mongo')
const http = require('http')
const ops = require('./functions/ops')
const pkg = require('./package.json')

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
    res.json({
        message: `Welcome to ${pkg.author}'s API!`,
        description: pkg.description,
        author: pkg.author,
        routes: {
            database: {
                databases: '/data',
                collections: '/data/<database>?<query?',
                documents: '/data/<database>/<collection>?<query>'
            }
        },
        notes: "See README for more information."
    })
})


//  -- Server
const PORT = process.env.PORT || 9000

app.set('port', PORT)

const server = http.createServer(app)

server.listen(PORT, () => console.log(`API Server listening on port ${PORT}.`))
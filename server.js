const express = require('express') // importing a CommonJS module
const hubsRouter = require('./hubs/hubs-router.js')
const helmet = require('helmet')
const morgan = require('morgan')

const server = express()

server.use(morgan('dev'))
server.use(methodLogger)
server.use(express.json())
server.use('/api/hubs', hubsRouter)
server.use(helmet())
server.use(addName)
// server.use(lockout)
server.use(gateKeeper)
server.use(validateId)
server.use(requireBody)

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? `${req.name}` : ''
  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome to the Lambda Hubs API${nameInsert}!</p>
    `)
})

function methodLogger(req, res, next) {
  console.log(`${req.method} request received`)
  next()
}

function addName(req, res, next) {
  console.log('Adding name to API...')
  const name = req.header('x-customName')
  req.name = `, ${name}`
  next()
}

// function lockout(req, res, next) {
//   res.status(402).json({ message: 'API locked out!' })
// }

function gateKeeper(req, res, next) {
  const seconds = new Date().getSeconds()

  console.log(`the seconds are: ${seconds}`)

  if (seconds % 3 === 0) {
    res.status(403).json({ message: "I hate 3..." })
  } else {
    next()
  }
}

async function validateId(req, res, next) {
  try {
    console.log(req.params)
    const { id } = req.params

    const hub = await Hubs.findById(id)

    if (hub) {
      req.hub = hub
      next()
    } else {
      res.status(404).json({ message: "id not found" })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

function requireBody(req, res, next) {
  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
    res.status(400).json({message:'Pleaes include a body in your request.'});
  }
}

module.exports = server
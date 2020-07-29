const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})


// const http = require('http')
// const express = require('express')
// const app = express()
// const cors = require('cors')
// const mongoose = require('mongoose')
// require('dotenv').config()

// const blogSchema = mongoose.Schema({
//   title: String,
//   author: String,
//   url: String,
//   likes: Number
// })

// blogSchema.set('toJSON', {
//     transform: ( document, returnedObject ) => {
//         returnedObject.id = returnedObject._id.toString()
//         delete returnedObject._id
//         delete returnedObject.__v
//     }
// })

// const Blog = mongoose.model('Blog', blogSchema)

// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// app.use(cors())
// app.use(express.json())


// app.get('/api/blogs', (request, response) => {
//   Blog
//     .find({})
//     .then(blogs => {
//       response.json(blogs)
//     })
// })

// app.get('/api/blogs/:id', (request, response) => {
//     Blog
//         .findById(request.params.id)
//         .then((returnedBlog) => {
//             response.json(returnedBlog)
//         })
// })

// app.post('/api/blogs', (request, response) => {
//   const blog = new Blog(request.body)
//   blog
//     .save()
//     .then(result => {
//       response.status(201).json(result)
//     })
// })

// app.delete('/api/blogs/:id', (request, response) => {
//     Blog.findByIdAndDelete(request.params.id).then(()=>{
//         response.status(204).send('Successfully Deleted')
//     })
// })

// const PORT = process.env.PORT
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })
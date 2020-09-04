const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/',async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username : 1, name : 1 })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if(blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const token = request.token
    // eslint-disable-next-line no-undef
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if(!token && !decodedToken.id) {
        return response.status(401).send({ 'error': 'Token missing r invalid' })
    }

    const user = await User.findById(decodedToken.id)
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url : body.url,
        likes : body.likes || 0,
        user : user._id
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog)
    await user.save()

    response.json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = await Blog.findById(request.params.id)
    blog.likes = body.likes

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
    const body = request.body
    if(body.comment === '' ) {
        return response.status(401).send({ 'error': 'empty comment' })
    }
    const blog = await Blog.findById(request.params.id)
    blog.comments.push(body.comment)
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)

})

blogsRouter.delete('/:id', async (request, response) => {
    // eslint-disable-next-line no-undef
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if(!decodedToken) {
        return response.status(401).send({ 'error': 'Invalid token or missing token' })
    }

    const blog = await Blog.findById(request.params.id)
    if(blog.user.toString() === decodedToken.id) {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } else {
        return response.status(401).send({ 'error': 'You dont have access' })
    }
})

module.exports = blogsRouter
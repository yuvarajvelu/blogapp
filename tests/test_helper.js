const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
    {
        'title': 'React hooks',
        'author': 'Esteban Herrera',
        'url': 'https://blog.logrocket.com/a-guide-to-usestate-in-react-ecb9952e406c/',
        'likes': 55
    },
    {
        'title': 'Murphy Law',
        'author': 'Wikepedia',
        'url': 'https://en.wikipedia.org/wiki/Murphy%27s_law',
        'likes': 38
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const nonExistingId = async () => {
    const blog = new Blog({
        title: 'something',
        url: 'something.com'
    })

    await blog.save()
    await blog.remove()

    return blog.id
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb, nonExistingId, usersInDb
}
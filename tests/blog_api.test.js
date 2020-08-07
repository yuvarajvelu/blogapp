const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const helper = require('./test_helper')
const supertest = require('supertest')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')


beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObject = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObject.map(blog => blog.save())

    await Promise.all(promiseArray)
})

describe('when there is initially some notes to be saved', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type',/application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('a specific blog is returned', async () => {
        const response = await api.get('/api/blogs')
        const title = response.body.map(blog => blog.title)

        expect(title).toContain('React hooks')
    })

    test('every blog has id property', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach(blog => {
            expect(blog.id).toBeDefined()
        })
    })
})

describe('viewing a single note', () => {
    test('a specific blog can be viewed', async () => {
        const blogsAtEnd = await helper.blogsInDb()
        const blogToView = blogsAtEnd[0]

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type',/application\/json/)

        expect(resultBlog.body.title).toBe(blogToView.title)
    })

    test('fails with statuscode 404 if it doesnt exist', async () => {
        const validNonExistingId = await helper.nonExistingId()

        console.log('hello',validNonExistingId)

        await api
            .get(`/api/blogs/${validNonExistingId}`)
            .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
        const invalidId = '5f142abd5a855cd06'

        await api
            .get(`/api/blogs/${invalidId}`)
            .expect(400)
    })
})

describe('addition of a note',() => {
    test('a valid blog can be added', async () => {
        const tokenforUser = {
            username: 'root',
            password: 'sekret'
        }
        const userDetails = await api.post('/api/login').send(tokenforUser).expect(200)
        //console.log(userDetails.body.token)
        const newBlog = {
            'title': 'Fullstackopen',
            'author': 'helsinki university',
            'url': 'fullstackopen.com',
            'likes': 89
        }

        await api
            .post('/api/blogs')
            .set('authorization',`bearer ${userDetails.body.token}`)
            .send(newBlog)
            .expect(200)
            .expect('Content-Type',/application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
        const titles = blogsAtEnd.map(blog => blog.title)

        expect(titles).toContain('Fullstackopen')
    })

    test('If likes property is missing should default to zero', async () => {
        const tokenforUser = {
            username: 'root',
            password: 'sekret'
        }
        const userDetails = await api.post('/api/login').send(tokenforUser).expect(200)
        const newBlog = {
            title : 'freecodecamp',
            author : 'freecodecamp',
            url : 'freecodecamp.com'
        }

        await api
            .post('/api/blogs')
            .set('authorization',`bearer ${userDetails.body.token}`)
            .send(newBlog)
            .expect(200)
            .expect('Content-Type',/application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
        expect(blogsAtEnd[helper.initialBlogs.length].likes).toBeDefined()
        expect(blogsAtEnd[helper.initialBlogs.length].likes).toBe(0)
    })

    test('if title and url are missing should not be saved', async () => {
        const tokenforUser = {
            username: 'root',
            password: 'sekret'
        }
        const userDetails = await api.post('/api/login').send(tokenforUser).expect(200)
        const newBlog = {
            author : 'someone',
            likes : 33
        }
        await api
            .post('/api/blogs')
            .set('authorization',`bearer ${userDetails.body.token}`)
            .send(newBlog)
            .expect(400)
    })

    test('Creating a blog fails if token is invalid or missing', async () => {
        const tokenforUser = {
            username: 'root',
            password: 'sekret'
        }
        const userDetails = await api.post('/api/login').send(tokenforUser).expect(200)
        const newBlog = {
            title : 'freecodecamp',
            author : 'freecodecamp',
            url : 'freecodecamp.com'
        }
        await api
            .post('/api/blogs')
            .set('authorization',`bearer ksd${userDetails.body.token}`)
            .send(newBlog)
            .expect(401)
            .expect('Content-Type',/application\/json/)
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type',/application\/json/)
    })
})

describe('updating a blog', () => {
    test('No of likes in a blog can be updated', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]
        blogToUpdate.likes = 88

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate)
            .expect(200)
            .expect('Content-Type',/application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        const updatedBlog = blogsAtEnd[0]

        expect(updatedBlog.likes).toBe(88)
    })
})

describe('deletion of a blog', () => {
    test('a blog can be deleted', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

        const title = blogsAtEnd.map(blog => blog.title)
        expect(title).not.toContain(blogToDelete.title)
    })
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation suceed with a new user', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username : 'Yuvi',
            name : 'Yuvaraj',
            password : 'Madrid'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type',/application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(user =>  user.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('username and password should be atleast 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser1 = {
            username : 'ab',
            password : 'secret'
        }
        const newUser2 = {
            username : 'name',
            password : '12'
        }
        await api
            .post('/api/users')
            .send(newUser1)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        await api
            .post('/api/users')
            .send(newUser2)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).not.toContain(newUser1.username)
        expect(usernames).not.toContain(newUser2.username)
    })

})

afterAll(() => {
    mongoose.connection.close()
})
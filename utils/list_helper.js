const dummy = () => {
    return 1
}

const totalLikes = (blogs) => {
    const result = blogs.reduce((total, blog) => {
        return total + blog.likes
    },0)

    return result
}

const favoriteBlog = (blogs) => {
    const mostLiked = blogs.reduce((result, blog, i) => {
        if(i === 0) {
            result = blog
        } else if (result.likes < blog.likes) {
            result = blog
        }
        return result
    },{})
    const resultObject = {
        title : mostLiked.title,
        author : mostLiked.author,
        likes : mostLiked.likes
    }
    return resultObject
}

const mostNoOfBlogs = (blogs) => {
    const authors = blogs.reduce((total, blog) => {
        if(total.indexOf(blog.author) === -1) {
            total.push(blog.author)
        }
        return total
    },[])

    const result = authors.reduce((res,author,i) => {
        const name =  author
        const counter = blogs.reduce((final, blog) => {
            if(blog.author === name) {
                final += 1
            }
            return final
        },0)
        if(i === 0) {
            res.author = name
            res.blogs = counter
        } else if(counter > res.blogs) {
            res.author = name
            res.blogs = counter
        }
        return res
    },{})
    return result
}

const mostLikedAuthor = (blogs) => {
    const authors = blogs.reduce((total, blog) => {
        if(total.indexOf(blog.author) === -1) {
            total.push(blog.author)
        }
        return total
    },[])

    const result = authors.reduce((res,author,i) => {
        const name =  author
        const counter = blogs.reduce((total, blog) => {
            if(blog.author === name) {
                total += blog.likes
            }
            return total
        },0)
        if(i === 0) {
            res.author = name
            res.likes = counter
        } else if(counter > res.likes) {
            res.author = name
            res.likes = counter
        }
        return res
    },{})
    return result
}

module.exports = { dummy, totalLikes, favoriteBlog, mostNoOfBlogs, mostLikedAuthor }
import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

app.set('views', './views');
app.set('view engine', 'ejs');

// Load posts from local storage (file)
const postsFilePath = 'posts.json';
let posts = [];

if (fs.existsSync(postsFilePath)) {
    const data = fs.readFileSync(postsFilePath);
    posts = JSON.parse(data);
}

app.get('/', (req, res) => {
    // Sort posts by createdAt in descending order
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.render('index', { posts: posts });
});

app.get('/addBlog', (req, res) => {
    res.render('addBlog');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.post('/submit', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
    const postTitle = req.body.title;
    const postBody = req.body.body;
    const nameOfPoster = req.body.poster;
    const imageUrl = req.files.image ? '/uploads/' + req.files.image[0].filename : '';
    const videoUrl = req.files.video ? '/uploads/' + req.files.video[0].filename : '';
    const timestamp = new Date();

    const newPost = {
        title: postTitle,
        body: postBody,
        poster: nameOfPoster,
        imageUrl: imageUrl,
        videoUrl: videoUrl,
        createdAt: timestamp  // Assigning createdAt here
    };
    posts.push(newPost);

    // Save posts to local storage (file)
    fs.writeFileSync(postsFilePath, JSON.stringify(posts));

    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

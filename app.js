const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Secret key untuk JWT
const JWT_SECRET = 'library_secret_key_2025';

// Database simulasi (dalam aplikasi real, gunakan database seperti MongoDB/MySQL)
let books = [
    { id: 1, title: 'Laskar Pelangi', author: 'Andrea Hirata', year: 2005, category: 'Novel', available: true },
    { id: 2, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', year: 1980, category: 'Novel', available: true },
    { id: 3, title: 'Cantik Itu Luka', author: 'Eka Kurniawan', year: 2002, category: 'Novel', available: false },
    { id: 4, title: 'Negeri 5 Menara', author: 'Ahmad Fuadi', year: 2009, category: 'Novel', available: true }
];

let admins = [
    { id: 1, username: 'admin', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' } // password: password
];

let nextBookId = 5;

// Middleware untuk autentikasi admin
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes untuk halaman publik
app.get('/', (req, res) => {
    res.render('index', { books: books.filter(book => book.available) });
});

app.get('/books', (req, res) => {
    const availableBooks = books.filter(book => book.available);
    res.render('books', { books: availableBooks });
});

app.get('/about', (req, res) => {
    res.render('about');
});

// Routes untuk autentikasi admin
app.get('/admin/login', (req, res) => {
    res.render('admin/login');
});

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    const admin = admins.find(a => a.username === username);
    if (!admin) {
        return res.status(401).render('admin/login', { error: 'Username atau password salah' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
        return res.status(401).render('admin/login', { error: 'Username atau password salah' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('admin_token', token, { httpOnly: true });
    res.redirect('/admin/dashboard');
});

// Middleware untuk halaman admin (cek cookie)
const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.admin_token;
    
    if (!token) {
        return res.redirect('/admin/login');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect('/admin/login');
        }
        req.user = user;
        next();
    });
};

// Middleware untuk parsing cookies
app.use(require('cookie-parser')());

// Routes untuk dashboard admin
app.get('/admin/dashboard', authenticateAdmin, (req, res) => {
    const stats = {
        totalBooks: books.length,
        availableBooks: books.filter(b => b.available).length,
        borrowedBooks: books.filter(b => !b.available).length
    };
    res.render('admin/dashboard', { books, stats, user: req.user });
});

app.get('/admin/books', authenticateAdmin, (req, res) => {
    res.render('admin/books', { books, user: req.user });
});

app.get('/admin/books/add', authenticateAdmin, (req, res) => {
    res.render('admin/add-book', { user: req.user });
});

app.post('/admin/books/add', authenticateAdmin, (req, res) => {
    const { title, author, year, category } = req.body;
    
    const newBook = {
        id: nextBookId++,
        title,
        author,
        year: parseInt(year),
        category,
        available: true
    };
    
    books.push(newBook);
    res.redirect('/admin/books');
});

app.get('/admin/books/edit/:id', authenticateAdmin, (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).render('admin/error', { message: 'Buku tidak ditemukan' });
    }
    res.render('admin/edit-book', { book, user: req.user });
});

app.post('/admin/books/edit/:id', authenticateAdmin, (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).render('admin/error', { message: 'Buku tidak ditemukan' });
    }
    
    const { title, author, year, category, available } = req.body;
    
    books[bookIndex] = {
        ...books[bookIndex],
        title,
        author,
        year: parseInt(year),
        category,
        available: available === 'on'
    };
    
    res.redirect('/admin/books');
});

app.post('/admin/books/delete/:id', authenticateAdmin, (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Buku tidak ditemukan' });
    }
    
    books.splice(bookIndex, 1);
    res.redirect('/admin/books');
});

app.post('/admin/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.redirect('/');
});

// API Routes untuk frontend yang menggunakan AJAX
app.get('/api/books', (req, res) => {
    const availableBooks = books.filter(book => book.available);
    res.json(availableBooks);
});

app.get('/api/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).json({ error: 'Buku tidak ditemukan' });
    }
    res.json(book);
});

// API Routes untuk admin (dengan autentikasi)
app.get('/api/admin/books', authenticateToken, (req, res) => {
    res.json(books);
});

app.post('/api/admin/books', authenticateToken, (req, res) => {
    const { title, author, year, category } = req.body;
    
    const newBook = {
        id: nextBookId++,
        title,
        author,
        year: parseInt(year),
        category,
        available: true
    };
    
    books.push(newBook);
    res.status(201).json(newBook);
});

app.put('/api/admin/books/:id', authenticateToken, (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Buku tidak ditemukan' });
    }
    
    const { title, author, year, category, available } = req.body;
    
    books[bookIndex] = {
        ...books[bookIndex],
        title,
        author,
        year: parseInt(year),
        category,
        available
    };
    
    res.json(books[bookIndex]);
});

app.delete('/api/admin/books/:id', authenticateToken, (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Buku tidak ditemukan' });
    }
    
    books.splice(bookIndex, 1);
    res.json({ message: 'Buku berhasil dihapus' });
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    const admin = admins.find(a => a.username === username);
    if (!admin) {
        return res.status(401).json({ error: 'Username atau password salah' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Username atau password salah' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin: { id: admin.id, username: admin.username } });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Terjadi kesalahan server' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { message: 'Halaman tidak ditemukan' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log('Login admin: username = admin, password = password');
});

module.exports = app;
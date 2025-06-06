# Aplikasi Cek Buku Perpustakaan
Aplikasi web lengkap untuk manajemen perpustakaan yang dibangun dengan Express.js dan EJS. Aplikasi ini memiliki halaman publik untuk pengunjung umum dan dashboard admin untuk mengelola data buku dengan fitur CRUD lengkap.

## 🚀 Fitur Utama
### Halaman Publik (User Umum)

Landing Page: Menampilkan informasi perpustakaan dan buku-buku unggulan
Katalog Buku: Daftar lengkap buku yang tersedia untuk dipinjam
Halaman Tentang: Informasi tentang perpustakaan
Responsive Design: Dapat diakses dari desktop dan mobile

### Dashboard Admin

Sistem Login: Autentikasi aman dengan JWT
Dashboard: Statistik dan overview perpustakaan
Manajemen Buku: CRUD (Create, Read, Update, Delete) data buku
Form Tambah/Edit Buku: Interface yang user-friendly
Proteksi Route: Hanya admin yang dapat mengakses dashboard

## 🛠️ Teknologi yang Digunakan

Backend: Node.js + Express.js
Template Engine: EJS
Authentication: JWT (JSON Web Token)
Password Hashing: bcryptjs
Frontend: Bootstrap 5, Font Awesome
CSS: Custom styling dengan animasi
JavaScript: Interaktivitas dan UX enhancement

## 📋 Persyaratan Sistem

Node.js (versi 14 atau lebih baru)
npm atau yarn
Browser modern (Chrome, Firefox, Safari, Edge)

## Instalasi
1. Clone repository:
```bash
git clone [URL_REPOSITORY]
cd CEKUP_PROJECT_LAB_PPL
```

2. Install dependencies:
```bash
# Initialize npm
npm init -y

# Install dependencies
npm install express ejs bcryptjs jsonwebtoken cookie-parser

# Install dev dependencies
npm install --save-dev nodemon
```

3. Jalankan server development
```bash
node app.js   
```

4. Struktur Website
```bash
aplikasi-perpustakaan/
├── app.js
├── package.json
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── navbar.ejs
│   ├── admin/
│   │   ├── layout.ejs
│   │   ├── login.ejs
│   │   ├── dashboard.ejs
│   │   ├── books.ejs
│   │   ├── add-book.ejs
│   │   ├── edit-book.ejs
│   │   └── error.ejs
│   ├── index.ejs
│   ├── books.ejs
│   ├── about.ejs
│   └── error.ejs
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
└── README.md
```

# MakeMeUp! - Web Application Platform

MakeMeUp! adalah platform *web application* yang dirancang sebagai solusi digital terintegrasi untuk menghubungkan klien dengan *Make Up Artist* (MUA) secara profesional dan personal. Produk ini berfokus pada hiper-personalisasi layanan, di mana sistem tidak hanya berfungsi sebagai media pemesanan, tetapi juga sebagai asisten cerdas yang mencocokkan profil unik klien dengan spesialisasi MUA.

---

## Fitur Unggulan

* **Smart Style Matching**: Sistem kurasi yang memungkinkan klien menemukan MUA berdasarkan kecocokan gaya riasan (misalnya: *Natural*, *Glam*, *Bridal*, atau *Editorial*) dan portofolio visual yang telah terverifikasi.
* **Automated Skin Compatibility Warning**: Fitur keamanan yang secara otomatis mendeteksi dan memberikan peringatan jika bahan *skinprep* yang digunakan MUA berpotensi memicu alergi atau iritasi berdasarkan profil sensitivitas kulit klien.
* **Custom Tiered Packages**: Model paket layanan dinamis yang terinspirasi dari platform global, memungkinkan MUA menawarkan paket fleksibel yang dapat dikustomisasi oleh klien sesuai kebutuhan *event* dan anggaran mereka.
* **Real-time Schedule & Booking**: Kalender ketersediaan yang diperbarui secara otomatis untuk mencegah *double booking* dan memastikan koordinasi jadwal yang presisi antara klien dan penyedia jasa.

---

##  Perancangan Produk

###  Arsitektur Sistem
MakeMeUp! dirancang menggunakan **Layered Client-Server Architecture** dalam satu kesatuan unit *monolithic* yang efisien.
* **Diagram Arsitektur**: Memetakan hubungan antara *Frontend* (React), *Backend* (Express), dan *Database* (PostgreSQL) yang dideploy menggunakan layanan **Railway** untuk menjamin *high availability*.
* **Alur Proses**: Menggantikan proses pencarian MUA manual dengan sistem kurasi berbasis data yang menjamin kecocokan gaya riasan dan keamanan bahan produk.

###  Analisis Kebutuhan Pengguna 
* **Kebutuhan Fungsional**: Mencakup fitur autentikasi pengguna, manajemen profil sensitivitas kulit, filter spesialisasi MUA (model Fiverr), serta sistem penahanan dana aman.
* **Kebutuhan Non-Fungsional**: Menetapkan standar keamanan data klien, responsivitas antarmuka di bawah 2 detik, serta spesifikasi pengembangan menggunakan Node.js dan Docker.

### Pemodelan Sistem
* **Use Case Diagram**: Memetakan akses kontrol antara *Client* (pencarian & booking), *MUA* (manajemen paket & jadwal), dan *Admin* (verifikasi & audit).
* **Sequence Diagram**: Menunjukkan urutan interaksi saat fitur *Automated Skin Compatibility Warning* bekerja, mulai dari pengambilan data profil hingga pemunculan notifikasi konflik bahan kimia.

###  Perancangan Basis Data
* **Entity Relationship Diagram (ERD)**: Mengintegrasikan tabel *user*, profil detail kulit, portofolio MUA, serta log transaksi pembayaran.
* **Struktur Tabel**: Menggunakan **Prisma ORM** untuk mendefinisikan tipe data yang ketat, termasuk penggunaan *Primary Key* (PK) dan *Foreign Key* (FK) pada setiap relasi tabel.

###  Perancangan Antarmuka Pengguna
* **User Flow**: Alur navigasi yang dimulai dari pengisian data alergi oleh klien hingga proses *checkout* layanan MUA yang aman.
* **Mockup (Hi-Fi)**: Desain visual yang menekankan kemudahan pemilihan gaya riasan (*Style Matching*) dengan palet warna yang bersih dan profesional.

### Perancangan Keamanan Sistem
* **Autentikasi & Otorisasi**: Implementasi **JWT (JSON Web Token)** untuk sesi pengguna dan enkripsi *password* menggunakan algoritma **bcrypt**.
* **Keamanan Data**: Penggunaan protokol **HTTPS** melalui Railway dan penanganan data sensitif klien agar tidak terekspos secara publik pada *API response*.

### Link Website 
* link public kita yang ini https://makemeup.up.railway.app/login
# Rekap Kehadiran Kajian Orang Tua Siswa

Aplikasi web modern untuk mengelola, merekap, dan menghitung poin kehadiran orang tua (Ayah & Bunda) pada kegiatan Kajian.

## 🚀 Fitur Utama

- **Login Admin**: Halaman login yang aman dengan password default `Simumtaz123`.
- **Impor Excel Kehadiran**:
  - Input **Nama Kajian** dan **Tanggal Kajian** sebelum mengimpor file `.xlsx` / `.xls`.
  - Template Excel siap unduh langsung dari aplikasi.
- **Logika Perhitungan Poin Otomatis**:
  - Format data Excel: `Ayah (nama siswa)` atau `Bunda (nama siswa)`.
  - Jika **Ayah** OR **Bunda** OR **keduanya** berstatus `"Hadir"` $\rightarrow$ Siswa mendapat **+1 poin**.
  - Jika **Ayah** AND **Bunda** keduanya berstatus `"Belum Hadir"` (dan tidak ada yang Hadir) $\rightarrow$ Siswa mendapat **-1 poin**.
- **Rekap & Filter Divisi**:
  - Tabel rekap otomatis diurutkan berdasarkan **Divisi**.
  - Dropdown filter per Divisi & fitur pencarian nama siswa.
  - Menampilkan: **Nama Siswa**, **Divisi**, **Poin Kehadiran**, dan **Daftar Nama Kajian**.
  - Detail riwayat lengkap per kajian untuk setiap siswa.
- **Ekspor Excel per Divisi**: Menu mengunduh rekap hasil filter per divisi ke file `.xlsx`.
- **Siap Deploy Vercel & Aiven PostgreSQL**: Menggunakan Next.js 14 App Router + Prisma ORM.

---

## 🛠️ Panduan Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js v18+ dan npm

### 2. Instalasi & Setup Database
```bash
# Clone/buka folder proyek
cd "d:\antigravity project\rekap kehadiran kajian"

# Install dependensi
npm install

# Push schema Prisma ke database (Aiven PostgreSQL atau PostgreSQL lokal)
npx prisma db push

# Jalankan server pengembangan
npm run dev
```
Buka browser di `http://localhost:3000`. Password login admin: `Simumtaz123`.

---

## 🌐 Panduan Deployment ke Vercel & Aiven PostgreSQL

### Step 1: Buat Database di Aiven
1. Login ke dashboard [Aiven.io](https://aiven.io/).
2. Buat service baru: **PostgreSQL**.
3. Setelah database aktif, masuk ke tab **Overview** dan salin **Service URI / Connection String**. Formatnya:
   ```env
   DATABASE_URL="postgresql://avnadmin:YOUR_PASSWORD@YOUR_AIVEN_HOST:PORT/defaultdb?sslmode=require"
   ```

### Step 2: Deploy ke Vercel
1. Push project ini ke repository GitHub/GitLab Anda.
2. Buka [Vercel Dashboard](https://vercel.com/) dan pilih **Add New Project**.
3. Impor repository proyek ini.
4. Di bagian **Environment Variables**, tambahkan variabel berikut:

   | Key | Value | Description |
   | --- | --- | --- |
   | `DATABASE_URL` | `postgresql://avnadmin:...@...:port/defaultdb?sslmode=require` | Connection String dari Aiven |
   | `ADMIN_PASSWORD` | `Simumtaz123` | Password Login Admin |
   | `JWT_SECRET` | `simumtaz_super_secret_key_2026` | Secret Token JWT |

5. Klik **Deploy**. Vercel akan otomatis menjalankan `prisma generate` dan membangun aplikasi Next.js.
6. Setelah deploy selesai, jalankan perintah migrasi database pertama kali jika diperlukan:
   ```bash
   npx prisma db push
   ```

---

## 📑 Format File Excel Input

File Excel yang diunggah harus memiliki header kolom (nama kolom tidak sensitif huruf besar/kecil):

| Nama Peserta | Divisi | Status Kehadiran |
| --- | --- | --- |
| Ayah Ahmad Fauzi | SD IT Mumtaz | Hadir |
| Bunda Ahmad Fauzi | SD IT Mumtaz | Hadir |
| Ayah Fatimah Az-Zahra | TK Mumtaz | Belum Hadir |
| Bunda Fatimah Az-Zahra | TK Mumtaz | Hadir |
| Ayah Rayhan Pratama | SMP IT Mumtaz | Belum Hadir |
| Bunda Rayhan Pratama | SMP IT Mumtaz | Belum Hadir |

*Catatan: Anda dapat mengunduh file template contoh langsung dari tombol **"Unduh Template Excel"** di dalam aplikasi.*

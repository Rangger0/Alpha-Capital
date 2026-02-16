# Alpha Capital

Aplikasi manajemen keuangan pribadi modern dengan fitur lengkap untuk mencatat, mengelola, dan menganalisis transaksi keuangan Anda.

## Fitur

### 🔐 Sistem Autentikasi
- Register dengan email dan password
- Login/Logout
- Reset password via email
- Session aman dengan Supabase Auth

### 📊 Dashboard
- Total saldo saat ini
- Total pemasukan & pengeluaran bulan berjalan
- Grafik 7 hari terakhir
- Ringkasan transaksi terbaru

### 💰 Pencatatan Transaksi
- Tambah, edit, hapus transaksi
- Kategori custom (bisa tambah/edit/hapus)
- Filter berdasarkan tanggal, jenis, kategori
- Pencarian transaksi
- Format mata uang Rupiah otomatis

### 📅 Kalender Interaktif
- Tampilan bulanan
- Klik tanggal untuk lihat detail transaksi
- Indikator warna (Hijau = Pemasukan, Merah = Pengeluaran)

### 📈 Laporan
- Rekap harian, bulanan, tahunan
- Grafik statistik
- Breakdown kategori
- Export ke CSV

### 🎨 Tema
- Mode Terang & Gelap
- Preferensi tersimpan di local storage
- Desain modern warm minimalis

## Teknologi

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React

## Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd alpha-capital
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy Project URL dan Anon Key dari Settings > API
3. Buat file `.env` berdasarkan `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Jalankan SQL schema di SQL Editor Supabase:
   - Buka SQL Editor di dashboard Supabase
   - Copy isi file `supabase-schema.sql`
   - Jalankan query

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Struktur Database

### Tables

**transactions**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `type` (text: 'income' | 'expense')
- `category` (text)
- `amount` (numeric)
- `description` (text, optional)
- `date` (date)
- `created_at` (timestamp)

**categories**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `name` (text)
- `type` (text: 'income' | 'expense')
- `created_at` (timestamp)

## Deployment

### Vercel

1. Push code ke GitHub
2. Import project di Vercel
3. Tambah environment variables
4. Deploy

### Environment Variables

Pastikan untuk menambahkan environment variables di platform deployment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## License

MIT License - Alpha Capital © 2026
Powered by Rose Alpha

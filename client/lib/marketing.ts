// Sumber tunggal untuk konten halaman publik (landing & katalog).
// Ubah harga, fitur, atau nomor WhatsApp di sini, kedua halaman ikut berubah.

export const WA_NUMBER = "628976337088";
export const INSTAGRAM_URL = "https://www.instagram.com/nantikitadigitalwedding";
export const DEMO_SLUG = "budi-dan-riri";

export const waLink = (text?: string) =>
  text
    ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${WA_NUMBER}`;

export type TemplateItem = {
  key: string; // dipakai di ?theme= dan harus sama dengan key di lib/themes.ts
  title: string;
  image: string;
  special?: boolean;
};

export const TEMPLATES: TemplateItem[] = [
  {
    key: "rustic",
    title: "Rustic",
    image: "/themes/rustic/assets/img/rustic-thumbnail.jpeg",
  },
  {
    key: "floral_luxury",
    title: "Floral Luxury",
    // Placeholder sementara sampai screenshot aslinya ada
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=500",
    special: true,
  },
  {
    key: "sage",
    title: "Sage Green & Botanical",
    image: "/themes/sage/assets/img/cover-sage-botanical.jpg",
  },
  {
    key: "japandi",
    title: "Japandi",
    image: "/themes/japandi/assets/img/cover-japandi.jpg",
  },
  {
    key: "cinematic",
    title: "Cinematic",
    image: "/themes/cinematic/assets/img/cover-cinematic.jpg",
  },
  {
    key: "midnight",
    title: "Midnight & Romance",
    image: "/themes/midnight/assets/img/cover-midnight.jpg",
  },
];

export const PACKAGES = {
  basic: { name: "Paket Basic", price: "Rp 99.000", sub: "Aktif 3 bulan" },
  // Katalog lama menulis "Aktif Selamanya / 1 Tahun". Ganti kalimat ini kalau masa aktif sudah pasti.
  premium: { name: "Paket Premium", price: "Rp 149.000", sub: "Masa aktif lebih lama" },
};

export const BASIC_FEATURES = [
  { text: "Custom nama tamu", ok: true },
  { text: "Teks & protokol kesehatan", ok: true },
  { text: "Navigasi peta lokasi (Google Maps)", ok: true },
  { text: "Galeri foto (maks 5 foto)", ok: true },
  { text: "Fitur angpao digital / rekening", ok: true },
  { text: "Tanpa background musik custom", ok: false },
  { text: "Tanpa fitur RSVP & ucapan", ok: false },
];

export const PREMIUM_FEATURES = [
  "Semua fitur Paket Basic",
  "Masa aktif lebih lama",
  "Galeri foto & video tanpa batas",
  "Background musik bebas request",
  "Fitur RSVP & konfirmasi kehadiran",
  "Kolom ucapan & doa restu (live)",
  "Fitur spesial story / kisah cinta",
];

export const STEPS = [
  {
    title: "Pilih desain",
    desc: "Lihat tema di katalog, buka demo versi Basic atau Premium, lalu tentukan yang paling cocok.",
  },
  {
    title: "Kirim data lewat WhatsApp",
    desc: "Konsultasikan nama mempelai, foto, lokasi acara, dan musik latar langsung dengan admin.",
  },
  {
    title: "Undangan siap dikirim",
    desc: "Setelah selesai, Anda menerima link undangan untuk disebarkan ke seluruh tamu.",
  },
];

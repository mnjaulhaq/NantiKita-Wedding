// Pengganti SweetAlert2 via CDN di app.blade.php. Install dulu: npm i sweetalert2
import Swal from "sweetalert2";

const BRAND_GREEN = "#2f3e36";

// Pengganti flash session('success') -> popup "Berhasil!"
export function successPopup(text: string) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil!",
    text,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    confirmButtonColor: BRAND_GREEN,
  });
}

export function errorPopup(text: string) {
  return Swal.fire({ icon: "error", title: "Gagal", text, confirmButtonColor: BRAND_GREEN });
}

// Toast kecil di pojok kanan atas (dulu dipakai tombol Copy link)
export function toastSuccess(title: string) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  return Toast.fire({
    icon: "success",
    title,
    background: "#ffffff",
    customClass: { popup: "rounded-lg shadow-md border border-emerald-100" },
  });
}

export async function confirmDelete() {
  const result = await Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Semua data RSVP milik client ini juga akan terhapus permanen!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: BRAND_GREEN,
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Hapus Data!",
    cancelButtonText: "Batal",
    background: "#ffffff",
    customClass: { popup: "rounded-xl shadow-lg border border-gray-100" },
  });
  return result.isConfirmed;
}

export async function confirmAction(title: string, text: string, confirmText: string) {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: BRAND_GREEN,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    background: "#ffffff",
    customClass: { popup: "rounded-xl shadow-lg border border-gray-100" },
  });
  return result.isConfirmed;
}

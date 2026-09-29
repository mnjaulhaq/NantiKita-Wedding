import Link from "next/link";
import WeddingForm from "@/components/WeddingForm";

export default function CreateWeddingPage() {
  return (
    <div>
      <div className="adm-head">
        <div>
          <Link href="/admin/weddings" className="adm-back">← Kembali ke Data Client</Link>
          <h2>Buat undangan baru</h2>
          <p>Isi data pengantin untuk membuat undangan digital.</p>
        </div>
      </div>
      <div className="adm-card" style={{ maxWidth: 820, padding: 32 }}>
        <WeddingForm mode="create" />
      </div>
    </div>
  );
}

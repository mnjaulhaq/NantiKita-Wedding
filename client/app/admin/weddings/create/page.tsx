import WeddingForm from "@/components/WeddingForm";

export default function CreateWeddingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tambah Klien Baru</h1>
      <WeddingForm mode="create" />
    </div>
  );
}

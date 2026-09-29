-- Semua akun aplikasi saat ini adalah owner.
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'owner';

-- Hubungkan data wedding ke owner pembuatnya.
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_weddings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "nama_pria" TEXT NOT NULL,
    "nama_wanita" TEXT NOT NULL,
    "tanggal_acara" DATETIME NOT NULL,
    "lokasi_acara" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "paket" TEXT NOT NULL DEFAULT 'basic',
    "musik_url" TEXT,
    "user_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "weddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_weddings" ("id", "slug", "nama_pria", "nama_wanita", "tanggal_acara", "lokasi_acara", "tema", "paket", "musik_url", "created_at", "updated_at")
SELECT "id", "slug", "nama_pria", "nama_wanita", "tanggal_acara", "lokasi_acara", "tema", "paket", "musik_url", "created_at", "updated_at"
FROM "weddings";
DROP TABLE "weddings";
ALTER TABLE "new_weddings" RENAME TO "weddings";
CREATE UNIQUE INDEX "weddings_slug_key" ON "weddings"("slug");
CREATE INDEX "weddings_user_id_idx" ON "weddings"("user_id");
PRAGMA foreign_keys=ON;

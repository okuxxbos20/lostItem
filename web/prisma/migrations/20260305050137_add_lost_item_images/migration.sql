-- CreateTable
CREATE TABLE "lost_item_images" (
    "id" TEXT NOT NULL,
    "lostItemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lost_item_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lost_item_images" ADD CONSTRAINT "lost_item_images_lostItemId_fkey" FOREIGN KEY ("lostItemId") REFERENCES "lost_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

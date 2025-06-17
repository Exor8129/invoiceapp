-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "code" INTEGER,
    "contact" TEXT,
    "credit" DOUBLE PRECISION,
    "dlno" TEXT,
    "gst" TEXT,
    "state" TEXT,
    "type" TEXT,
    "shipping_address" TEXT,
    "credit_period" TEXT,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Courier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hsn" INTEGER,
    "min" INTEGER,
    "rate" DOUBLE PRECISION,
    "tax" DOUBLE PRECISION,
    "vendor" TEXT,
    "mrp" DECIMAL(10,2),

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inRegister" (
    "id" SERIAL NOT NULL,
    "regNo" INTEGER NOT NULL,
    "party" TEXT,
    "item" TEXT,
    "qty" INTEGER NOT NULL,
    "department" TEXT,
    "deptRef" TEXT,
    "remark" TEXT,
    "others" TEXT,
    "courier" TEXT,
    "complete" TEXT DEFAULT 'Open',
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saleEntry" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "party_name" VARCHAR(255) NOT NULL,
    "invoice_number" VARCHAR(100) NOT NULL,
    "item_name" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sell_rate" DECIMAL(10,2) NOT NULL,
    "profit" DECIMAL(10,2),

    CONSTRAINT "sale_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salesbyitem" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "itemname" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "salesbyitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saledata2425" (
    "party_name" TEXT,
    "invoice_date" DATE,
    "invoice_no" TEXT,
    "item_name" TEXT,
    "quantity" INTEGER,
    "rate" DECIMAL(65,30),
    "uid" TEXT,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    CONSTRAINT "saledata2425_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stockitem" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hsncode" TEXT,
    "buyingprice" DOUBLE PRECISION NOT NULL,
    "supplier" TEXT,
    "tax" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "stockitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permanentitem" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT,
    "reorder_level" INTEGER,
    "product_note" TEXT,
    "supplier" TEXT,
    "udrl" TEXT,

    CONSTRAINT "permanentitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saleTempEntry" (
    "id" SERIAL NOT NULL,
    "partyname" TEXT,
    "invcdt" TIMESTAMP(3),
    "itemName" TEXT,
    "disc" TEXT,
    "qty" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION,
    "shpAdd" TEXT,

    CONSTRAINT "saleTempEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPricingRule" (
    "id" SERIAL NOT NULL,
    "party_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "min_qty" INTEGER,
    "fixed_price" DECIMAL(10,2) NOT NULL,
    "effective_from" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" DATE,

    CONSTRAINT "CustomerPricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_batch" (
    "id" SERIAL NOT NULL,
    "stockitemId" INTEGER NOT NULL,
    "batch_no" TEXT NOT NULL,
    "serial_no" TEXT,
    "expiry_date" TIMESTAMP(3),
    "mfg_date" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseEntry" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "partyName" VARCHAR(255) NOT NULL,
    "purchaseNumber" VARCHAR(100) NOT NULL,
    "itemName" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchaseRate" DECIMAL(10,2) NOT NULL,
    "purchaseReferenceNumber" VARCHAR(100),

    CONSTRAINT "PurchaseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courier_name_key" ON "Courier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "inRegister_regNo_key" ON "inRegister"("regNo");

-- CreateIndex
CREATE UNIQUE INDEX "stockitem_uid_key" ON "stockitem"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "permanentitem_uid_key" ON "permanentitem"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPricingRule_party_id_item_id_min_qty_key" ON "CustomerPricingRule"("party_id", "item_id", "min_qty");

-- CreateIndex
CREATE INDEX "product_batch_expiry_date_idx" ON "product_batch"("expiry_date");

-- CreateIndex
CREATE INDEX "product_batch_serial_no_idx" ON "product_batch"("serial_no");

-- CreateIndex
CREATE UNIQUE INDEX "product_batch_stockitemId_serial_no_key" ON "product_batch"("stockitemId", "serial_no");

-- CreateIndex
CREATE UNIQUE INDEX "product_batch_stockitemId_batch_no_key" ON "product_batch"("stockitemId", "batch_no");

-- CreateIndex
CREATE INDEX "PurchaseEntry_partyName_purchaseNumber_idx" ON "PurchaseEntry"("partyName", "purchaseNumber");

-- AddForeignKey
ALTER TABLE "permanentitem" ADD CONSTRAINT "permanentitem_uid_fkey" FOREIGN KEY ("uid") REFERENCES "stockitem"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPricingRule" ADD CONSTRAINT "CustomerPricingRule_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPricingRule" ADD CONSTRAINT "CustomerPricingRule_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_batch" ADD CONSTRAINT "product_batch_stockitemId_fkey" FOREIGN KEY ("stockitemId") REFERENCES "stockitem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

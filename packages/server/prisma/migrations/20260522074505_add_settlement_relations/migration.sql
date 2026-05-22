-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

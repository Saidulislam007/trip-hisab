import { FileDown } from "lucide-react";
import { AppButton } from "@/components/common/button";

export function PdfPage() {
  return (
    <section className="px-7 pt-10">
      <p className="text-sm font-black text-gold">Offline Export</p>
      <h1 className="mt-1 text-4xl font-black">PDF Export</h1>
      <div className="app-card mt-8 p-5">
        <FileDown className="mb-6 text-gold" size={42} />
        <h2 className="text-2xl font-black">Final hisab save koren</h2>
        <p className="mt-3 text-sm leading-6 text-goldSoft/80">
          Mobile browser print option diye current hisab PDF hisebe save korte parben.
        </p>
        <AppButton className="mt-7 w-full py-4" onClick={() => window.print()}>
          Save PDF
        </AppButton>
      </div>
    </section>
  );
}

import "server-only";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { requireBillingCustomer } from "./service";
import { billingHandle, billingResponseHeaders } from "./http";
export function testingQrisResponse() {
  return billingHandle(async () => {
    await requireBillingCustomer();
    // Asset privat; respons langsung menghindari cache/optimizer gambar publik Next.
    const file = await open(join(process.cwd(), "assets/payment/testing-qris.jpg"), "r");
    const stream = Readable.toWeb(file.createReadStream()) as ReadableStream<Uint8Array>;
    return new Response(stream, {
      headers: {
        ...billingResponseHeaders,
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'inline; filename="qris-pengujian.jpg"',
        "Cross-Origin-Resource-Policy": "same-origin",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  });
}

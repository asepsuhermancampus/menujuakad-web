import { describe, expect, it } from "vitest";
import { countdownDuration } from "./countdown";
describe("durasi countdown contoh", () => {
  it("menghitung waktu WIB terhadap clock fixture tetap", () => {
    expect(countdownDuration("2026-10-08T15:00")).toEqual({
      state: "WAITING",
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
  it("clamp waktu lampau menjadi zero-state dan menolak tanggal tidak sah", () => {
    expect(countdownDuration("2026-10-06T15:00")).toEqual({
      state: "REACHED",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expect(countdownDuration("2026-02-30T10:00").state).toBe("INVALID");
    expect(countdownDuration("").state).toBe("INVALID");
  });
});

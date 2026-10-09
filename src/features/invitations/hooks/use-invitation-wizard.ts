"use client";
import { useState } from "react";
import { templatesFixture } from "@/features/design-preview/data/fixtures";
export function useInvitationWizard() {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState(templatesFixture[0].id);
  const [names, setNames] = useState({
    one: "Sarah Contoh",
    two: "Dimas Contoh",
    date: "2026-12-12",
    venue: "Gedung Acara Contoh",
    greeting: "Dengan penuh kebahagiaan, kami mengundang Anda.",
  });
  const [message, setMessage] = useState("");
  const next = () => {
    if (step === 2 && (!names.one.trim() || !names.two.trim())) {
      setMessage("Lengkapi nama pasangan.");
      return;
    }
    if (step === 3 && (!names.date || !names.venue.trim())) {
      setMessage("Lengkapi tanggal dan lokasi contoh.");
      return;
    }
    setMessage("");
    setStep((previous) => Math.min(5, previous + 1));
  };
  return {
    step,
    setStep,
    template,
    setTemplate,
    names,
    setNames,
    message,
    next,
    finish: () => setMessage("Draft contoh ditinjau lokal. Tidak ada undangan dibuat pada server."),
  };
}

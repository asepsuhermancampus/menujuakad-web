"use client";
import { useState } from "react";
import { previewContext, type OrderPreviewDto } from "@/features/design-preview/data/fixtures";
import { checkoutState, paymentStatusMessage } from "../lib/presentation";

export type ExamplePaymentMethod = "QRIS" | "VA" | "CARD";
export function usePaymentPreview(order: OrderPreviewDto, initialExpired = false) {
  const [method, setMethod] = useState<ExamplePaymentMethod>("QRIS");
  const [message, setMessage] = useState("");
  const state = checkoutState(order, previewContext.now, initialExpired);
  return {
    method,
    setMethod,
    message,
    setMessage,
    state,
    inspectStatus: () => setMessage(paymentStatusMessage(state.status)),
  };
}

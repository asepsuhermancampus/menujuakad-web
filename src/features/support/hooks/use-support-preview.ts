"use client";
import { useState, type FormEvent } from "react";
import {
  supportFixture,
  type SupportTicketPreviewDto,
} from "@/features/design-preview/data/fixtures";
export function useSupportPreview() {
  const [tickets, setTickets] = useState(supportFixture);
  const [selected, setSelected] = useState(supportFixture[0].id);
  const [filter, setFilter] = useState("ALL");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = String(data.get("body") || "").trim();
    if (!body) return;
    if (creating) {
      const id = `local-ticket-${tickets.length + 1}`;
      const ticket: SupportTicketPreviewDto = {
        id,
        subject: String(data.get("subject") || "Pertanyaan contoh"),
        category: "DESIGN",
        status: "OPEN",
        createdAt: "2026-10-07T08:00:00.000Z",
        updatedAt: "2026-10-07T08:00:00.000Z",
        messages: [
          {
            id: `${id}-message`,
            author: "CUSTOMER_EXAMPLE",
            body,
            createdAt: "2026-10-07T08:00:00.000Z",
          },
        ],
      };
      setTickets((previous) => [...previous, ticket]);
      setSelected(id);
      setCreating(false);
    } else
      setTickets((previous) =>
        previous.map((ticket) =>
          ticket.id === selected
            ? {
                ...ticket,
                messages: [
                  ...ticket.messages,
                  {
                    id: `local-message-${ticket.messages.length + 1}`,
                    author: "CUSTOMER_EXAMPLE",
                    body,
                    createdAt: "2026-10-07T08:00:00.000Z",
                  },
                ],
              }
            : ticket,
        ),
      );
    setMessage("Pesan hanya ditambahkan pada pratinjau lokal. Tidak dikirim ke dukungan.");
    event.currentTarget.reset();
  };
  return {
    tickets,
    selected,
    setSelected,
    filter,
    setFilter,
    creating,
    setCreating,
    message,
    submit,
  };
}

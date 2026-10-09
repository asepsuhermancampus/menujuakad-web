import { expect, it } from "vitest";
import { editorPayload } from "./editor-payload";
it("builds supported editor payload without hidden owner or publication flags", () => {
  const data = new FormData();
  data.set("groomFullName", "Pria Uji");
  data.set("storyText", "<b>Teks biasa</b>");
  data.set("eventTime", "10:00");
  data.set("rsvpEnabled", "on");
  data.set("ownerUserId", "intruder");
  data.set("isPublished", "true");
  const result = editorPayload(data);
  expect(result).toMatchObject({
    couple: { groomFullName: "Pria Uji" },
    sections: {
      event: { date: null, time: "10:00" },
      story: { text: "<b>Teks biasa</b>" },
      rsvp: { enabled: true, deadline: null },
    },
  });
  expect(Object.keys(result)).toEqual(["couple", "sections"]);
});
it("preserves unchecked RSVP as false for save/reload", () =>
  expect(editorPayload(new FormData()).sections.rsvp.enabled).toBe(false));

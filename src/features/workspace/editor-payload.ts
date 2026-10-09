export function editorPayload(data: FormData) {
  const value = (name: string) => String(data.get(name) ?? "");
  return {
    couple: {
      groomFullName: value("groomFullName"),
      groomNickname: value("groomNickname"),
      groomParents: value("groomParents"),
      groomBio: value("groomBio"),
      brideFullName: value("brideFullName"),
      brideNickname: value("brideNickname"),
      brideParents: value("brideParents"),
      brideBio: value("brideBio"),
    },
    sections: {
      cover: { heading: value("coverHeading"), message: value("coverMessage") },
      event: {
        name: value("eventName"),
        date: value("eventDate") || null,
        time: value("eventTime"),
        venue: value("eventVenue"),
        address: value("eventAddress"),
      },
      story: { text: value("storyText") },
      rsvp: { enabled: data.get("rsvpEnabled") === "on", deadline: value("rsvpDeadline") || null },
    },
  };
}

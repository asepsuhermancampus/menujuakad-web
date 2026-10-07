import type { EditorPreviewDto } from "@/features/design-preview/data/fixtures";
import type { EditorFieldProps } from "./editor-field";
import { CoverPanel, CouplePanel, StoryPanel, EventPanel } from "./editor-content-panels";
import { RsvpPanel, MusicPanel, DressPanel, CountdownPanel } from "./editor-settings-panels";
import { VideoPanel, LivePanel, HashtagPanel } from "./editor-media-panels";
import { GalleryPanel } from "./gallery-panel";
import { PublishPanel } from "./publish-panel";
const panels = {
  "EDT-01": CoverPanel,
  "EDT-02": CoverPanel,
  "EDT-03": CouplePanel,
  "EDT-04": StoryPanel,
  "EDT-05": EventPanel,
  "EDT-07": RsvpPanel,
  "EDT-09": MusicPanel,
  "EDT-10": DressPanel,
  "EDT-11": VideoPanel,
  "EDT-12": CountdownPanel,
  "EDT-13": LivePanel,
  "EDT-14": HashtagPanel,
} as const;
export function EditorPanel({
  code,
  fixture,
  notify,
  ...props
}: EditorFieldProps & {
  code: string;
  fixture: EditorPreviewDto;
  notify: (message: string) => void;
}) {
  if (code === "EDT-06") return <GalleryPanel fixture={fixture} />;
  if (code === "EDT-08") return <PublishPanel notify={notify} />;
  const Panel = panels[code as keyof typeof panels];
  return Panel ? <Panel {...props} /> : null;
}

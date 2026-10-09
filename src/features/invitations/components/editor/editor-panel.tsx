import type { EditorPreviewDto } from "@/features/design-preview/data/fixtures";
import type { EditorFieldProps } from "./editor-field";
import { CoverPanel, CouplePanel, StoryPanel, EventPanel } from "./editor-content-panels";
import { RsvpPanel, MusicPanel, DressPanel, CountdownPanel } from "./editor-settings-panels";
import { VideoPanel, LivePanel, HashtagPanel } from "./editor-media-panels";
import {
  LocationPanel,
  VersePanel,
  RundownPanel,
  ProtocolPanel,
  ContactPanel,
  ColophonPanel,
} from "./editor-extended-panels";
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
/* Panel EDT-15..20 memerlukan fixture untuk data terstruktur (rundown/kontak). */
const extendedPanels = {
  "EDT-15": LocationPanel,
  "EDT-16": VersePanel,
  "EDT-17": RundownPanel,
  "EDT-18": ProtocolPanel,
  "EDT-19": ContactPanel,
  "EDT-20": ColophonPanel,
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
  if (code in extendedPanels) {
    const Panel = extendedPanels[code as keyof typeof extendedPanels];
    return <Panel {...props} fixture={fixture} />;
  }
  const Panel = panels[code as keyof typeof panels];
  return Panel ? <Panel {...props} /> : null;
}

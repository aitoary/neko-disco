import DiscoPage from "./disco-page";
import { getDiscoPageData } from "./disco-page-data";

export default function Home() {
  return <DiscoPage {...getDiscoPageData("ja")} />;
}

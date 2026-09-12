import { useLocation } from "react-router-dom";
import { ThresholdScreen } from "@/pages/dev/design/toolScreens";

export default function ThresholdPage() {
  const { pathname } = useLocation();
  return <ThresholdScreen chrome={false} result={pathname.includes("/result")} />;
}

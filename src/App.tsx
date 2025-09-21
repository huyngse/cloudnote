import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/sonner";
import { EditorProvider } from "./contexts/EditorContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { useNavigation } from "./hooks/useNavigation";
import NoticeBoard from "./pages/NoticeBoard";

const App = () => {
  const { path } = useNavigation();
  return (
    <ThemeProvider defaultTheme="light">
      <EditorProvider>
        <SettingsProvider>
          {path === "/" && <NoticeBoard />}
          <Toaster richColors position="bottom-center"/>
        </SettingsProvider>
      </EditorProvider>
    </ThemeProvider>
  );
};

export default App;

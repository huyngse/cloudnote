import { EditorProvider } from "./contexts/EditorContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { useNavigation } from "./hooks/useNavigation";
import { ToastProvider } from "./hooks/useToast";
import NoticeBoard from "./pages/NoticeBoard";

const App = () => {
  const { path } = useNavigation();
  return (
    <EditorProvider>
      <SettingsProvider>
        <ToastProvider>{path === "/" && <NoticeBoard />}</ToastProvider>
      </SettingsProvider>
    </EditorProvider>
  );
};

export default App;

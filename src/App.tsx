import { EditorProvider } from "./contexts/EditorContext";
import { useNavigation } from "./hooks/useNavigation";
import { ToastProvider } from "./hooks/useToast";
import Main from "./pages/Main";

const App = () => {
  const { path } = useNavigation();
  return (
    <EditorProvider>
      <ToastProvider>{path === "/" && <Main />}</ToastProvider>
    </EditorProvider>
  );
};

export default App;

import { EditorProvider } from "./contexts/EditorContext";
import { useNavigation } from "./hooks/useNavigation";
import { ToastProvider } from "./hooks/useToast";
import Emerald from "./pages/Emerald";
import Heliodor from "./pages/Heliodor";

const App = () => {
  const { path } = useNavigation();
  return (
    <EditorProvider>
      <ToastProvider>
        {path === "/" && <Heliodor />}
        {path === "/heliodor" && <Heliodor />}
        {path === "/emerald" && <Emerald />}
      </ToastProvider>
    </EditorProvider>
  );
};

export default App;

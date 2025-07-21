import { EditorProvider } from "./contexts/EditorContext";
import { useNavigation } from "./hooks/useNavigation";
import Emerald from "./pages/Emerald";
import Heliodor from "./pages/Heliodor";

const App = () => {
  const { path } = useNavigation();
  return (
    <EditorProvider>
      {path === "/" && <Heliodor />}
      {path === "/heliodor" && <Heliodor />}
      {path === "/emerald" && <Emerald />}
    </EditorProvider>
  );
};

export default App;

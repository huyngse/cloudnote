import { useNavigation } from "./hooks/useNavigation";
import Emerald from "./pages/Emerald";
import Heliodor from "./pages/Heliodor";

const App = () => {
  const { path } = useNavigation();
  return (
    <>
      {path === "/" && <Heliodor />}
      {path === "/heliodor" && <Heliodor />}
      {path === "/emerald" && <Emerald />}
    </>
  );
};

export default App;

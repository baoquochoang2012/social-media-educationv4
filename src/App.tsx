import "./App.css";
import Pages from "./Components/Pages/Pages";
import { BrowserRouter } from "react-router-dom";
import AppContext from "./Components/AppContext/AppContext";
import { AppProvider } from "./AppContext";

function App() {
  return (
    <h1 className="App">
      <BrowserRouter>
        <AppProvider>
          <AppContext>
            <Pages></Pages>
          </AppContext>
        </AppProvider>
      </BrowserRouter>
    </h1>
  );
}

export default App;

import TextEditor from "./Components/TextEditor";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./Components/LandingPage";

function App() {
    return (

        <Router>
            <Routes>
                <Route exact path="/" element={<LandingPage />} />
                <Route path="/documents/:id" element={<TextEditor />} />
            </Routes>
        </Router>
    );
}

export default App;

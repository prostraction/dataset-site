import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Menu from "./components/menu";
import SignIn from "./components/signIn";
import ViewDS from "./components/viewDS";
import AddDS from "./components/addDS";

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <div className="main-container">
                    <aside className="sidebar">
                        <Menu />
                    </aside>
                    <main className="content">
                        <Routes>
                            <Route path="/" element={<div className="view"><h1>Add new element here later</h1></div>} />
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/set/:datasetId" element={<ViewDS />} />
                            <Route path="/add" element={<AddDS />} />
                            <Route path="/about" element={<div className="view"><h1>About</h1><p>Add about desciption</p></div>} />
                        </Routes>
                    </main>
                </div>
                <footer>
                    <div className="wrapper-footer">
                        <p>qoph.org since 2023</p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
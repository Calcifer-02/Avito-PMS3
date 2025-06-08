import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import BoardsPage from "./pages/BoardsPage";
import BoardPage from "./pages/BoardPage";
import IssuesPage from "./pages/IssuesPage";
import TaskPage from "./pages/TaskPage";
function App() {
   return (
      <>
         <BrowserRouter>
            <Header />
            <Routes>
               <Route path="/boards" element={<BoardsPage />} />
               <Route path="/board/:id" element={<BoardPage />} />
               <Route path="/issues" element={<IssuesPage />} />
               <Route path="*" element={<Navigate to="/issues" />} />
               {/* Доп компоненты */}
               <Route path="/task/:id" element={<TaskPage />} />
            </Routes>
         </BrowserRouter>
      </>
   );
}

export default App;

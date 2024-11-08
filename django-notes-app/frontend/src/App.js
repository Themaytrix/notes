import{
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import './App.css';
import Header from './components/Header';
import NoteListPage from './pages/NoteListPage';
import NotePage from "./pages/NotePage";



function App() {
  return (
    <Router>
      <div className="container dark">
        <div className="app">
          <Header />
          <Routes>
          <Route path="/" element={ <NoteListPage/>} />
          <Route path="/notes/:id" element={<NotePage/>}/>
          </Routes>
          
      </div>
    </div>
    </Router>
    
  );
}

export default App;

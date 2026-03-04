import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 기본 주소일 때 메인페이지 표시 */}
        <Route path="/" element={<MainPage />} />
        {/* /admin 주소일 때 관리자페이지 표시 */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
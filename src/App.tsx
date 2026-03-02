import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lancamentos from './pages/Lancamentos';
import Historico from './pages/Historico';
import Configuracoes from './pages/Configuracoes';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/lancamentos" element={<Layout><Lancamentos /></Layout>} />
          <Route path="/historico" element={<Layout><Historico /></Layout>} />
          <Route path="/configuracoes" element={<Layout><Configuracoes /></Layout>} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

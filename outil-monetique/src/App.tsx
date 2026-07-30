import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Projets } from './pages/Projets';
import { ProjetDetail } from './pages/ProjetDetail';
import { Tests } from './pages/Tests';
import { CahierDetail } from './pages/CahierDetail';
import { Environnements } from './pages/Environnements';
import { EnvironnementDetail } from './pages/EnvironnementDetail';
import { Patchs } from './pages/Patchs';
import { PatchDetail } from './pages/PatchDetail';
import { Run } from './pages/Run';
import { Parametres } from './pages/Parametres';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projets" element={<Projets />} />
        <Route path="/projets/:id" element={<ProjetDetail />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/tests/:id" element={<CahierDetail />} />
        <Route path="/environnements" element={<Environnements />} />
        <Route path="/environnements/:id" element={<EnvironnementDetail />} />
        <Route path="/patchs" element={<Patchs />} />
        <Route path="/patchs/:id" element={<PatchDetail />} />
        <Route path="/run" element={<Run />} />
        <Route path="/parametres" element={<Parametres />} />
      </Routes>
    </AppShell>
  );
}

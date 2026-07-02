import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Inscription from "./pages/Inscription"
import DashboardMembre from "./pages/DashboardMembre"
import DashboardCollecteur from "./pages/DashboardCollecteur"
import DashboardAdmin from "./pages/DashboardAdmin"
import DemandeRetrait from "./pages/DemandeRetrait"
import BackOffice from "./pages/BackOffice"
import ChoisirMicrofinance from "./pages/ChoisirMicrofinance"
import ChoisirRole from "./pages/ChoisirRole"
import InscriptionMembre from "./pages/InscriptionMembre"
import InscriptionCollecteur from "./pages/InscriptionCollecteur"
import AdminInscriptions from "./pages/AdminInscriptions"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/membre" element={<DashboardMembre />} />
        <Route path="/membre/retrait" element={<DemandeRetrait />} />
        <Route path="/collecteur" element={<DashboardCollecteur />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/backoffice" element={<BackOffice />} />
        <Route path="/choisir-microfinance" element={<ChoisirMicrofinance />} />
<Route path="/inscription-role/:microfinanceId" element={<ChoisirRole />} />
<Route path="/inscription-membre/:microfinanceId" element={<InscriptionMembre />} />
<Route path="/inscription-collecteur/:microfinanceId" element={<InscriptionCollecteur />} />
<Route path="/admin/inscriptions" element={<AdminInscriptions />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
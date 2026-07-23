import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Disponibilites from "./pages/Disponibilites.jsx";
import Reserver from "./pages/Reserver.jsx";
import Masterclass from "./pages/Masterclass.jsx";
import Sessions from "./pages/Sessions.jsx";
import Studio from "./pages/Studio.jsx";
import Contact from "./pages/Contact.jsx";
import Agenda from "./pages/Agenda.jsx";

// Routes du site public (avec le layout : footer, nav basse, boutons flottants)
function SiteRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/disponibilites" element={<Disponibilites />} />
        <Route path="/reserver" element={<Reserver />} />
        <Route path="/masterclass" element={<Masterclass />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}

// L'agenda (espace ingénieurs) est hors layout
export default function App() {
  return (
    <Routes>
      <Route path="/agenda" element={<Agenda />} />
      <Route path="/*" element={<SiteRoutes />} />
    </Routes>
  );
}

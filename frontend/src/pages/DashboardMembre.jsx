import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard, History, Banknote, User, LogOut,
  ChevronLeft, ChevronRight, Bell, ArrowRight,
  CheckCircle2, Clock, TrendingUp, Flame, Shield,
  MapPin, AlertTriangle, Wallet
} from "lucide-react"
import ChoixPaiement from "../components/ChoixPaiement"
import SimulationUSSD from "../components/SimulationUSSD"
import ChoixMontant from "../components/ChoixMontant"

export default function DashboardMembre() {
  const [compte, setCompte] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOuverte, setSidebarOuverte] = useState(true)
  const [ongletActif, setOngletActif] = useState("dashboard")
  const [etapeCotisation, setEtapeCotisation] = useState(null)
  const [modeChoisi, setModeChoisi] = useState(null)
  const [messageSucces, setMessageSucces] = useState("")
  const [peutRetirer, setPeutRetirer] = useState(null)
  const [solde, setSolde] = useState(0)
  const [montantRetrait, setMontantRetrait] = useState("")
  const [modeRetrait, setModeRetrait] = useState(null)
  const [etapeRetrait, setEtapeRetrait] = useState(null)
  const [messageRetrait, setMessageRetrait] = useState("")
  const [retraits, setRetraits] = useState([])
  const [filtreHistorique, setFiltreHistorique] = useState("aujourd_hui")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const chargerCompte = () => {
    fetch("http://localhost:5000/api/membres/mon-compte", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => { setCompte(data); setLoading(false) })
    .catch(() => navigate("/"))
  }

  useEffect(() => {
    if (!token) { navigate("/"); return }
    chargerCompte()
    fetch("http://localhost:5000/api/membres/peut-retirer", {
      headers: { Authorization: "Bearer " + token }
    }).then(r => r.json()).then(d => { setPeutRetirer(d.peutRetirer); setSolde(d.solde) })
    fetch("http://localhost:5000/api/membres/mes-retraits", {
      headers: { Authorization: "Bearer " + token }
    }).then(r => r.json()).then(d => setRetraits(Array.isArray(d) ? d : []))
  }, [])

  const deconnexion = () => { localStorage.clear(); navigate("/") }

  const handleChoixPaiement = (mode) => { setModeChoisi(mode); setEtapeCotisation("ussd") }

  const handleConfirmeUSSD = async () => {
    setEtapeCotisation(null)
    const res = await fetch("http://localhost:5000/api/membres/cotiser", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ mode_paiement: modeChoisi })
    })
    const data = await res.json()
    if (data.besoinMontant) { setEtapeCotisation("choix-montant"); return }
    setMessageSucces(data.message || data.error)
    chargerCompte()
    setTimeout(() => setMessageSucces(""), 4000)
  }

  const handleChoixMontant = async (montantChoisi) => {
    setEtapeCotisation(null)
    const res = await fetch("http://localhost:5000/api/membres/cotiser", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ mode_paiement: modeChoisi, montant_choisi: montantChoisi })
    })
    const data = await res.json()
    setMessageSucces(data.message || data.error)
    chargerCompte()
    setTimeout(() => setMessageSucces(""), 4000)
  }

  const confirmerRetrait = async () => {
    if (!montantRetrait || montantRetrait <= 0) {
      setMessageRetrait("Montant invalide")
      return
    }
    if (!modeRetrait) {
      setMessageRetrait("Choisissez un mode de paiement")
      return
    }
    setEtapeRetrait("ussd")
  }

  const handleConfirmeRetraitUSSD = async () => {
    setEtapeRetrait(null)
    const res = await fetch("http://localhost:5000/api/membres/demande-retrait", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ montant: parseInt(montantRetrait), mode_paiement: modeRetrait })
    })
    const data = await res.json()
    setMessageRetrait(data.message || data.error)
    fetch("http://localhost:5000/api/membres/mes-retraits", {
      headers: { Authorization: "Bearer " + token }
    }).then(r => r.json()).then(d => setRetraits(Array.isArray(d) ? d : []))
  }

  if (loading || !compte) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-soft border-t-primary rounded-full animate-spin" />
        <p className="text-muted text-sm">Chargement...</p>
      </div>
    </div>
  )

  const membre = compte.membre || compte
  const cotisations = compte.cotisations || []
  const activiteRecente = compte.activiteRecente || cotisations.slice(0, 7)
  const nom = membre.nom || ""
  const prenom = membre.prenom || ""
  const email = membre.email || ""
  const soldeMembre = parseFloat(membre.solde || 0)
  const montantJournalier = parseFloat(membre.montant_cotisation || 0)
  const cotiseMois = cotisations.filter(c => c.statut === "valide").length
  const aujourdhui = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const joursValides = new Set(cotisations.filter(c => c.statut === "valide").map(c => new Date(c.date_cotisation).getDate()))
  const cotiseAujourdhui = joursValides.has(aujourdhui)
  const cotisationsManquees = cotisations.filter(c => c.statut === "manque" || (!joursValides.has(new Date(c.date_cotisation).getDate()) && new Date(c.date_cotisation).getDate() < aujourdhui))
  const premierJourManque = Array.from({length: aujourdhui - 1}, (_, i) => i + 1).find(j => !joursValides.has(j))

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { id: "historique", icon: History, label: "Historique" },
    { id: "retraits", icon: Banknote, label: "Retraits" },
    { id: "profil", icon: User, label: "Profil" },
  ]

  const couleurJour = (jour) => {
    if (jour > aujourdhui) return "text-gray-300 bg-transparent"
    if (jour === aujourdhui) return "bg-primary text-white font-bold rounded-xl"
    if (joursValides.has(jour)) return "bg-green-100 text-green-600 rounded-xl"
    return "bg-red-100 text-red-400 rounded-xl"
  }

  const montantsRapides = [5000, 10000, 25000, 50000]

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">

      {/* ── SIDEBAR ── */}
      <aside className={`bg-primary flex flex-col justify-between transition-all duration-300 flex-shrink-0 ${sidebarOuverte ? "w-56" : "w-[72px]"}`}>
        <div>
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {sidebarOuverte && <span className="text-white font-bold text-base tracking-tight">CotiPay</span>}
          </div>
          <nav className="px-3 space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setOngletActif(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left ${
                  ongletActif === item.id ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/8"
                }`}
              >
                <item.icon size={17} />
                {sidebarOuverte && (
                  <span className={`text-sm ${ongletActif === item.id ? "font-semibold" : "font-normal"}`}>{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3 pb-5 space-y-1">
          <div className="border-t border-white/10 mb-3" />
          {sidebarOuverte ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-bold">{prenom.charAt(0)}{nom.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{prenom} {nom}</p>
                <p className="text-white/40 text-xs">Membre</p>
              </div>
              <button onClick={deconnexion} className="text-white/40 hover:text-white transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={deconnexion} className="w-full flex justify-center py-2 text-white/40 hover:text-white">
              <LogOut size={17} />
            </button>
          )}
          <button
            onClick={() => setSidebarOuverte(!sidebarOuverte)}
            className="w-full flex items-center justify-center py-2 text-white/30 hover:text-white/60 transition-colors"
          >
            {sidebarOuverte ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-main">{navItems.find(n => n.id === ongletActif)?.label}</h1>
            <p className="text-muted text-xs mt-0.5">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-muted hover:bg-gray-100 transition-colors relative">
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{prenom.charAt(0)}{nom.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-main">{prenom} {nom}</p>
                <p className="text-xs text-muted">Membre · CECAV</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">

          {/* ── TABLEAU DE BORD ── */}
          {ongletActif === "dashboard" && (
            <div className="space-y-6">

              {/* Greeting + badge */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-main">Bonjour, {prenom} 👋</h2>
                  <p className="text-muted text-sm mt-0.5">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Compte actif
                </span>
              </div>

              {/* Message succès */}
              {messageSucces && (
                <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl font-medium">{messageSucces}</div>
              )}

              {/* Alerte cotisation manquée */}
              {premierJourManque && (
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-5 py-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">
                      Cotisation manquée le <strong>{premierJourManque} {new Date().toLocaleDateString("fr-FR", { month: "long" })}</strong> — régularisez pour éviter le blocage de votre compte.
                    </p>
                  </div>
                  <button
                    onClick={() => setEtapeCotisation("choix-paiement")}
                    className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-600 transition-colors flex-shrink-0 ml-4"
                  >
                    Régulariser →
                  </button>
                </div>
              )}

              {/* 3 Hero cards */}
              <div className="grid grid-cols-3 gap-4">

                {/* Solde */}
                <div className="bg-primary rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full" />
                  <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Solde total</p>
                  <p className="text-white font-bold text-3xl mb-1">{soldeMembre.toLocaleString("fr-FR")} <span className="text-lg">FCFA</span></p>
                  <div className="mb-1">
                    <div className="flex justify-between text-white/50 text-xs mb-1">
                      <span>Objectif {new Date().toLocaleDateString("fr-FR", { month: "long" })}</span>
                      <span>{(cotiseMois * montantJournalier).toLocaleString("fr-FR")} / {(daysInMonth * montantJournalier).toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-1.5">
                      <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${Math.min((cotiseMois / daysInMonth) * 100, 100)}%` }} />
                    </div>
                    <p className="text-white/40 text-xs mt-1">{Math.round((cotiseMois / daysInMonth) * 100)}% de l'objectif mensuel</p>
                  </div>
                  <button
                    onClick={() => setEtapeCotisation("choix-paiement")}
                    disabled={cotiseAujourdhui}
                    className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cotiseAujourdhui ? "✓ Cotisé aujourd'hui" : "Cotiser aujourd'hui"}
                  </button>
                </div>

                {/* Statut */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">Statut aujourd'hui</p>
                  {cotiseAujourdhui ? (
                    <>
                      <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 size={28} className="text-green-500" />
                      </div>
                      <p className="text-green-600 font-bold text-lg mb-2">Cotisé</p>
                      <div className="bg-green-50 rounded-xl px-4 py-2">
                        <p className="text-xs text-green-500 uppercase tracking-wide mb-0.5">Montant validé</p>
                        <p className="text-green-600 font-bold text-xl">+{montantJournalier.toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                        <Clock size={28} className="text-amber-500" />
                      </div>
                      <p className="text-amber-600 font-bold text-lg mb-1">En attente</p>
                      <p className="text-muted text-xs">Vous n'avez pas encore cotisé aujourd'hui</p>
                    </>
                  )}
                </div>

                {/* Régularité */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide">Régularité</p>
                    <TrendingUp size={14} className="text-primary" />
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-1">🔥</div>
                    <p className="text-4xl font-bold text-main">{cotiseMois}</p>
                    <p className="text-muted text-xs mt-1">jours consécutifs</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Ce mois</span>
                      <span className="text-xs font-semibold text-main">{cotiseMois} / {aujourdhui} jours</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min((cotiseMois / aujourdhui) * 100, 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Série record</span>
                      <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                        🏆 28 jours (juin)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendrier + Activité */}
              <div className="grid grid-cols-2 gap-6">

                {/* Calendrier */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-main text-sm">Calendrier de cotisation</h3>
                      <p className="text-muted text-xs">{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{cotiseMois} payés</span>
                      {premierJourManque && <span className="text-xs font-semibold text-red-400 bg-red-50 px-2 py-0.5 rounded-full">{Array.from({length: aujourdhui - 1}, (_, i) => i + 1).filter(j => !joursValides.has(j)).length} manqué(s)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {[{ color: "bg-green-100", label: "Cotisé" }, { color: "bg-red-100", label: "Manqué" }, { color: "bg-primary", label: "Aujourd'hui" }, { color: "bg-gray-100", label: "À venir" }].map((l, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded ${l.color}`} />
                        <span className="text-xs text-muted">{l.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {["L","M","M","J","V","S","D"].map((j, i) => (
                      <div key={i} className="text-center text-xs text-muted font-semibold py-1">{j}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(jour => (
                      <div key={jour} className={`aspect-square flex items-center justify-center text-xs transition-colors ${couleurJour(jour)}`}>
                        {jour > aujourdhui ? <span className="text-gray-300">{jour}</span> : jour}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activité récente */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-main text-sm">Activité récente</h3>
                      <p className="text-muted text-xs">Vos dernières transactions</p>
                    </div>
                    <button className="flex items-center gap-1 text-primary text-xs font-semibold hover:underline">
                      Tout voir <ArrowRight size={11} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {cotisations.slice(0, 7).map((c, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${c.statut === "valide" ? "bg-green-50" : "bg-red-50"}`}>
                          {c.statut === "valide"
                            ? <CheckCircle2 size={15} className="text-green-500" />
                            : <Clock size={15} className="text-red-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-main">Cotisation {c.statut === "valide" ? "validée" : "en attente"}</p>
                          <p className="text-xs text-muted flex items-center gap-1">
                            <Clock size={10} />
                            {c.heure_validation
                              ? new Date(c.heure_validation).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + " · " + new Date(c.heure_validation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                              : new Date(c.date_cotisation).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                            }
                          </p>
                        </div>
                        <p className={`text-sm font-bold ${c.statut === "valide" ? "text-green-600" : "text-muted"}`}>
                          {c.statut === "valide" ? "+" : ""}{parseFloat(c.montant || montantJournalier).toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    ))}
                    {cotisations.length === 0 && (
                      <p className="text-muted text-sm text-center py-6">Aucune activité pour le moment</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORIQUE ── */}
          {ongletActif === "historique" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-main">Historique</h2>
                <p className="text-muted text-sm mt-0.5">Toutes vos transactions</p>
              </div>

              {/* Résumé */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Cotisations entrantes</p>
                  <p className="text-2xl font-bold text-green-600">+{(cotiseMois * montantJournalier).toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Retraits effectués</p>
                  <p className="text-2xl font-bold text-red-400">
                    -{retraits.filter(r => r.statut === "validee").reduce((s, r) => s + parseFloat(r.montant || 0), 0).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              </div>

              {/* Filtres */}
              <div className="flex items-center gap-2 mb-6">
                {[
                  { id: "aujourd_hui", label: "Aujourd'hui" },
                  { id: "semaine", label: "Cette semaine" },
                  { id: "mois", label: "Ce mois" },
                  { id: "tout", label: "Tout" },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFiltreHistorique(f.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      filtreHistorique === f.id
                        ? "bg-white border border-gray-200 text-main shadow-sm"
                        : "text-muted hover:text-main"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Transactions groupées */}
              <div className="space-y-4">
                {cotisations.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                    <p className="text-muted text-sm">Aucune transaction</p>
                  </div>
                ) : (
                  cotisations.reduce((groupes, c) => {
                    const date = new Date(c.date_cotisation)
                    const key = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
                    if (!groupes[key]) groupes[key] = []
                    groupes[key].push(c)
                    return groupes
                  }, {}) &&
                  Object.entries(
                    cotisations.reduce((groupes, c) => {
                      const date = new Date(c.date_cotisation)
                      const key = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
                      if (!groupes[key]) groupes[key] = []
                      groupes[key].push(c)
                      return groupes
                    }, {})
                  ).map(([date, items]) => (
                    <div key={date}>
                      <div className="flex items-center gap-3 mb-2">
                        <Clock size={13} className="text-muted" />
                        <span className="text-xs font-semibold text-muted capitalize">{date}</span>
                        <div className="flex-1 border-t border-gray-100" />
                        <span className="text-xs text-muted">{items.length} transaction(s)</span>
                      </div>
                      <div className="space-y-2">
                        {items.map((c, i) => (
                          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${c.statut === "valide" ? "bg-green-50" : "bg-amber-50"}`}>
                                {c.statut === "valide"
                                  ? <CheckCircle2 size={16} className="text-green-500" />
                                  : <Clock size={16} className="text-amber-500" />
                                }
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-main">Cotisation {c.statut === "valide" ? "validée" : "en attente"}</p>
                                <p className="text-xs text-muted">
                                  {c.heure_validation
                                    ? new Date(c.heure_validation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                                    : "—"
                                  }
                                </p>
                              </div>
                            </div>
                            <p className={`text-sm font-bold ${c.statut === "valide" ? "text-green-600" : "text-muted"}`}>
                              {c.statut === "valide" ? "+" : ""}{parseFloat(c.montant || montantJournalier).toLocaleString("fr-FR")} FCFA
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── RETRAITS ── */}
          {ongletActif === "retraits" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-main">Demander un retrait</h2>
                <p className="text-muted text-sm mt-0.5">Retirez une partie de votre solde accumulé</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">

                {/* Formulaire */}
                <div className="space-y-4">
                  {/* Éligibilité */}
                  <div className={`rounded-2xl p-4 border ${peutRetirer === true ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {peutRetirer
                        ? <CheckCircle2 size={16} className="text-green-500" />
                        : <AlertTriangle size={16} className="text-red-400" />
                      }
                      <p className={`text-sm font-bold ${peutRetirer ? "text-green-700" : "text-red-600"}`}>
                        {peutRetirer ? "✓ Éligible au retrait" : "⚠️ Mois incomplet"}
                      </p>
                    </div>
                    <p className={`text-xs ${peutRetirer ? "text-green-600" : "text-red-500"}`}>
                      {peutRetirer
                        ? "Vous avez satisfait les conditions de cotisation mensuelle."
                        : "Complétez toutes vos cotisations du mois pour débloquer le retrait."
                      }
                    </p>
                  </div>

                  {/* Solde */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Solde disponible</p>
                    <p className="text-2xl font-bold text-primary">{parseFloat(solde || soldeMembre).toLocaleString("fr-FR")} FCFA</p>
                  </div>

                  {peutRetirer === true && (
                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Montant à retirer</p>
                      <div className="relative mb-3">
                        <input
                          type="number"
                          value={montantRetrait}
                          onChange={e => setMontantRetrait(e.target.value)}
                          placeholder="0"
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-xl font-bold text-main focus:outline-none focus:border-primary pr-16"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm font-semibold">FCFA</span>
                      </div>

                      {/* Montants rapides */}
                      <div className="flex gap-2 mb-5">
                        {montantsRapides.map(m => (
                          <button
                            key={m}
                            onClick={() => setMontantRetrait(m)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              montantRetrait == m ? "bg-primary/8 border-primary text-primary" : "border-gray-100 text-muted hover:border-primary/30"
                            }`}
                          >
                            {m.toLocaleString("fr-FR")}
                          </button>
                        ))}
                      </div>

                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Mode de paiement</p>
                      <div className="flex gap-3 mb-5">
                        {[
                          { id: "moov_money", label: "Moov Money", logo: "/moov-money.png" },
                          { id: "mix_by_yas", label: "Mix by Yas", logo: "/mix-by-yas.png" },
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => setModeRetrait(m.id)}
                            className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-colors ${
                              modeRetrait === m.id ? "border-primary bg-primary/5" : "border-gray-100"
                            }`}
                          >
                            <img src={m.logo} alt={m.label} className="w-6 h-6 object-contain" />
                            <span className="text-sm font-semibold text-main">{m.label}</span>
                            {modeRetrait === m.id && <CheckCircle2 size={14} className="text-primary ml-auto" />}
                          </button>
                        ))}
                      </div>

                      {messageRetrait && (
                        <p className={`text-sm mb-3 px-4 py-2 rounded-xl ${messageRetrait.includes("attente") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                          {messageRetrait}
                        </p>
                      )}

                      <button
                        onClick={confirmerRetrait}
                        disabled={!montantRetrait || !modeRetrait}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-40"
                      >
                        Confirmer le retrait →
                      </button>
                    </div>
                  )}
                </div>

                {/* Conditions */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 h-fit">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">Conditions de retrait</p>
                  <div className="space-y-3">
                    {[
                      "Cotisation du mois en cours",
                      "Solde disponible supérieur à 0",
                      "Mois complet ou régularisé",
                    ].map((cond, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm text-main">{cond}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Historique retraits */}
              <div>
                <h3 className="font-bold text-main text-sm mb-4">Historique des retraits</h3>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-12 px-5 py-3 border-b border-gray-50">
                    <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Date</span>
                    <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Montant</span>
                    <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Opérateur</span>
                    <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide text-right">Statut</span>
                  </div>
                  {retraits.length === 0 ? (
                    <div className="py-10 text-center"><p className="text-muted text-sm">Aucun retrait effectué</p></div>
                  ) : (
                    retraits.map((r, i) => (
                      <div key={i} className="grid grid-cols-12 px-5 py-4 border-b border-gray-50 last:border-0 items-center">
                        <div className="col-span-3">
                          <span className="text-sm text-muted">{new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm font-bold text-main">{parseFloat(r.montant).toLocaleString("fr-FR")} FCFA</span>
                        </div>
                        <div className="col-span-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            r.mode_paiement === "moov_money"
                              ? "border-blue-200 text-blue-600 bg-blue-50"
                              : "border-orange-200 text-orange-600 bg-orange-50"
                          }`}>
                            {r.mode_paiement === "moov_money" ? "📱 Moov Money" : "📱 Mix by Yas"}
                          </span>
                        </div>
                        <div className="col-span-3 text-right">
                          {r.statut === "validee"
                            ? <span className="text-xs font-semibold text-green-600">● Validée</span>
                            : r.statut === "rejetee"
                            ? <span className="text-xs font-semibold text-red-400">● Rejetée</span>
                            : <span className="text-xs font-semibold text-amber-500">● En attente</span>
                          }
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PROFIL ── */}
          {ongletActif === "profil" && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-main">Profil</h2>
                <p className="text-muted text-sm mt-0.5">Vos informations personnelles et statistiques</p>
              </div>

              {/* Carte profil */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
                <div className="bg-primary h-24 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-6 right-16 w-20 h-20 bg-white/5 rounded-full" />
                  <div className="absolute top-3 right-4">
                    <span className="text-xs font-semibold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                      {membre.numero_compte || "CECAV-2025-0001"}
                    </span>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-8 mb-5">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center border-4 border-white flex-shrink-0">
                      <span className="text-white text-xl font-bold">{prenom.charAt(0)}{nom.charAt(0)}</span>
                    </div>
                    <div className="pb-1">
                      <h3 className="text-lg font-bold text-main">{prenom} {nom}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-primary bg-primary/8 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Shield size={10} /> Membre
                        </span>
                        <span className="text-xs text-muted">· CECAV Microfinance</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-xs">✉</span><span>{email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-xs">🏢</span><span>CECAV Microfinance</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <MapPin size={12} /><span>{membre.adresse || "Lomé, Togo"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-xs">💼</span><span>{membre.lieu_travail || "Marché de Bè"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-xs">🪪</span><span>{membre.numero_compte || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-xs">📅</span><span>Membre depuis le 12 mars 2025</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                    <span className="text-xs text-muted">Collecteur assigné :</span>
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">K</span>
                    </div>
                    <span className="text-xs font-semibold text-main">Kofi Mensah</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Solde actuel", value: soldeMembre.toLocaleString("fr-FR") + " FCFA", sub: "disponible", icon: "↗" },
                  { label: "Jours cotisés", value: `${cotiseMois}/${daysInMonth}`, sub: "ce mois-ci", icon: "📅" },
                  { label: "Série actuelle", value: `${cotiseMois} jours`, sub: "record : 28 jours", icon: "🔥" },
                  { label: "Total cotisé", value: (cotiseMois * montantJournalier).toLocaleString("fr-FR") + " FCFA", sub: "depuis le début", icon: "↗" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide">{s.label}</p>
                      <span className="text-sm">{s.icon}</span>
                    </div>
                    <p className="text-xl font-bold text-main">{s.value}</p>
                    <p className="text-xs text-muted mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Paramètres */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-50">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide">Paramètres du compte</p>
                </div>
                {[
                  "Modifier mon mot de passe",
                  "Changer mon mode de paiement par défaut",
                  "Paramètres de notification",
                  "Langue et région",
                  "Aide et support",
                  "Signaler un problème",
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors text-left">
                    <span className="text-sm text-main">{item}</span>
                    <ArrowRight size={15} className="text-muted" />
                  </button>
                ))}
              </div>

              <button
                onClick={deconnexion}
                className="mt-4 w-full flex items-center justify-center gap-2 text-red-500 text-sm font-semibold py-3 rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} /> Se déconnecter
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Modales cotisation */}
      {etapeCotisation === "choix-paiement" && (
        <ChoixPaiement
          montant={montantJournalier}
          onConfirme={handleChoixPaiement}
          onAnnuler={() => setEtapeCotisation(null)}
        />
      )}
      {etapeCotisation === "ussd" && (
        <SimulationUSSD
          mode={modeChoisi}
          montant={montantJournalier}
          onConfirme={handleConfirmeUSSD}
          onAnnuler={() => setEtapeCotisation(null)}
        />
      )}
      {etapeCotisation === "choix-montant" && (
        <ChoixMontant
          onConfirme={handleChoixMontant}
          onAnnuler={() => setEtapeCotisation(null)}
        />
      )}

      {/* Modales retrait */}
      {etapeRetrait === "choix-paiement" && (
        <ChoixPaiement
          montant={montantRetrait}
          onConfirme={(mode) => { setModeRetrait(mode); setEtapeRetrait("ussd") }}
          onAnnuler={() => setEtapeRetrait(null)}
        />
      )}
      {etapeRetrait === "ussd" && (
        <SimulationUSSD
          mode={modeRetrait}
          montant={montantRetrait}
          onConfirme={handleConfirmeRetraitUSSD}
          onAnnuler={() => setEtapeRetrait(null)}
        />
      )}

    </div>
  )
}
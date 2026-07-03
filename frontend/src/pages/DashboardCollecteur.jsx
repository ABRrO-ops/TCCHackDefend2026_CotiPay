import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard, History, User, LogOut,
  ChevronLeft, ChevronRight, CheckCircle2,
  Clock, Wallet, Users, Bell, MapPin,
  TrendingUp, ArrowRight, Shield
} from "lucide-react"

export default function DashboardCollecteur() {
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOuverte, setSidebarOuverte] = useState(true)
  const [message, setMessage] = useState("")
  const [ongletActif, setOngletActif] = useState("tournee")
  const [compte, setCompte] = useState(null)
  const [filtreHistorique, setFiltreHistorique] = useState("aujourd_hui")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) { navigate("/"); return }

    fetch("http://localhost:5000/api/cotisations/mes-membres", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => { setMembres(Array.isArray(data) ? data : []); setLoading(false) })
    .catch(() => navigate("/"))

    fetch("http://localhost:5000/api/membres/mon-compte", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => setCompte(data))
    .catch(() => {})
  }, [])

  const deconnexion = () => { localStorage.clear(); navigate("/") }

  const validerCotisation = async (membreId) => {
    const res = await fetch(`http://localhost:5000/api/cotisations/valider/${membreId}`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    })
    const data = await res.json()
    setMessage(data.message || data.error)
    setTimeout(() => setMessage(""), 3000)
    fetch("http://localhost:5000/api/cotisations/mes-membres", {
      headers: { Authorization: "Bearer " + token }
    }).then(r => r.json()).then(d => setMembres(Array.isArray(d) ? d : []))
  }

  const aValider = membres.filter(m => !m.statut || m.statut === "attente")
  const valides = membres.filter(m => m.statut === "valide")
  const totalCollecte = valides.reduce((s, m) => s + parseFloat(m.montant_cotisation || 0), 0)
  const progression = membres.length > 0 ? Math.round((valides.length / membres.length) * 100) : 0

  const nomCollecteur = compte?.membre?.nom || compte?.nom || "Collecteur"
  const prenomCollecteur = compte?.membre?.prenom || compte?.prenom || ""
  const emailCollecteur = compte?.membre?.email || compte?.email || ""

  const navItems = [
    { id: "tournee", icon: LayoutDashboard, label: "Ma tournée" },
    { id: "historique", icon: History, label: "Historique" },
    { id: "profil", icon: User, label: "Profil" },
  ]

  const circumference = 2 * Math.PI * 36
  const strokeDash = (progression / 100) * circumference

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-soft border-t-primary rounded-full animate-spin" />
        <p className="text-muted text-sm">Chargement...</p>
      </div>
    </div>
  )

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
                  ongletActif === item.id
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/8"
                }`}
              >
                <item.icon size={17} />
                {sidebarOuverte && (
                  <span className={`text-sm ${ongletActif === item.id ? "font-semibold" : "font-normal"}`}>
                    {item.label}
                  </span>
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
                <span className="text-primary text-xs font-bold">
                  {prenomCollecteur.charAt(0)}{nomCollecteur.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{prenomCollecteur} {nomCollecteur}</p>
                <p className="text-white/40 text-xs">Collecteur</p>
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
            <h1 className="text-lg font-bold text-main">
              {navItems.find(n => n.id === ongletActif)?.label}
            </h1>
            <p className="text-muted text-xs mt-0.5">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-muted hover:bg-gray-100 transition-colors relative">
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{prenomCollecteur.charAt(0)}{nomCollecteur.charAt(0)}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-main">{prenomCollecteur} {nomCollecteur}</p>
                <p className="text-xs text-muted">Collecteur · CECAV</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">

          {/* ── ONGLET MA TOURNÉE ── */}
          {ongletActif === "tournee" && (
            <div className="space-y-6">

              {/* Greeting */}
              <div>
                <h2 className="text-2xl font-bold text-main">Bonjour, {prenomCollecteur} 👋</h2>
                <p className="text-muted text-sm mt-0.5">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
              </div>

              {/* Message succès */}
              {message && (
                <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl font-medium">
                  {message}
                </div>
              )}

              {/* Hero stats */}
              <div className="bg-primary rounded-2xl p-6 grid grid-cols-3 gap-6">

                {/* Progression circulaire */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-3">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="36" fill="none"
                        stroke="white" strokeWidth="6"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white font-bold text-xl">{valides.length}</span>
                      <span className="text-white/60 text-xs">/{membres.length}</span>
                    </div>
                  </div>
                  <p className="text-white font-semibold text-sm">Progression tournée</p>
                  <p className="text-white/60 text-xs">{progression}% complétée</p>
                </div>

                {/* Collecté */}
                <div className="flex flex-col items-center justify-center border-l border-r border-white/10 px-6">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                  <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Collecté aujourd'hui</p>
                  <p className="text-white font-bold text-2xl">{totalCollecte.toLocaleString("fr-FR")} <span className="text-base">FCFA</span></p>
                  <p className="text-green-400 text-xs mt-1">+{valides.length} validations</p>
                </div>

                {/* Restants */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-3">
                    <Clock size={18} className="text-amber-400" />
                  </div>
                  <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Restants</p>
                  <p className="text-amber-400 font-bold text-4xl">{aValider.length}</p>
                  <p className="text-white/60 text-xs mt-1">membres à visiter</p>
                </div>
              </div>

              {/* Listes */}
              <div className="grid grid-cols-2 gap-6">

                {/* À valider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-main text-sm">À valider</h3>
                      <p className="text-muted text-xs">{aValider.length} membres restants</p>
                    </div>
                    {aValider.some(m => m.initiee_par === "membre") && (
                      <span className="text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full flex items-center gap-1">
                        ⚡ {aValider.filter(m => m.initiee_par === "membre").length} initié(s) par membre
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {aValider.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                        <CheckCircle2 size={28} className="text-green-300 mx-auto mb-2" />
                        <p className="text-muted text-sm">Tous les membres ont été visités 🎉</p>
                      </div>
                    ) : (
                      aValider.map((m, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-shadow">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">{m.nom?.charAt(0)}{m.prenom?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-main">{m.nom} {m.prenom}</p>
                                {m.initiee_par === "membre" && (
                                  <span className="text-xs font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                                    ⚡ Initié par le membre
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> Quartier Bè
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted uppercase tracking-wide">Cotisation</p>
                              <p className="text-lg font-bold text-main">{parseFloat(m.montant_cotisation || 0).toLocaleString("fr-FR")} <span className="text-sm">FCFA</span></p>
                            </div>
                            <button
                              onClick={() => validerCotisation(m.id)}
                              className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
                            >
                              <CheckCircle2 size={14} /> Valider
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Déjà validés */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-main text-sm">Déjà validés</h3>
                      <p className="text-muted text-xs">{valides.length} validations aujourd'hui</p>
                    </div>
                    {valides.length > 0 && (
                      <span className="text-xs font-semibold text-green-600">
                        {totalCollecte.toLocaleString("fr-FR")} FCFA
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {valides.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                        <p className="text-muted text-sm">Aucune validation pour l'instant</p>
                      </div>
                    ) : (
                      valides.map((m, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">{m.nom?.charAt(0)}{m.prenom?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-main">{m.nom} {m.prenom}</p>
                              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> Quartier Bè
                              </p>
                            </div>
                            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted uppercase tracking-wide">Cotisation</p>
                              <p className="text-lg font-bold text-main">{parseFloat(m.montant_cotisation || 0).toLocaleString("fr-FR")} <span className="text-sm">FCFA</span></p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-green-500 flex items-center gap-1 justify-end">
                                <Clock size={11} />
                                {m.heure_validation
                                  ? `Validé à ${new Date(m.heure_validation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                                  : "Validé"
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ONGLET HISTORIQUE ── */}
          {ongletActif === "historique" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-main">Historique des validations</h2>
                <p className="text-muted text-sm mt-0.5">Toutes vos validations de cotisation</p>
              </div>

              {/* Filtres + stats */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {[
                    { id: "aujourd_hui", label: "Aujourd'hui" },
                    { id: "semaine", label: "Cette semaine" },
                    { id: "mois", label: "Ce mois" },
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
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted uppercase tracking-wide">Total collecté</p>
                    <p className="text-lg font-bold text-main">{totalCollecte.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted uppercase tracking-wide">Validations</p>
                    <p className="text-lg font-bold text-main">{valides.length}</p>
                  </div>
                </div>
              </div>

              {/* Badge initiés */}
              {valides.some(m => m.initiee_par === "membre") && (
                <div className="mb-4">
                  <span className="text-xs font-semibold text-primary bg-primary/8 px-3 py-1.5 rounded-full">
                    ⚡ {valides.filter(m => m.initiee_par === "membre").length} initiés par les membres
                  </span>
                </div>
              )}

              {/* Table */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50 text-xs text-muted">
                  <Clock size={13} />
                  <span>Aujourd'hui</span>
                  <div className="flex-1 border-t border-gray-100 mx-2" />
                  <span className="font-semibold text-main">{totalCollecte.toLocaleString("fr-FR")} FCFA</span>
                </div>

                <div className="grid grid-cols-12 px-5 py-3 border-b border-gray-50">
                  <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Membre</span>
                  <span className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide">Montant</span>
                  <span className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide">Heure</span>
                  <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Origine</span>
                  <span className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide text-right">Statut</span>
                </div>

                {valides.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted text-sm">Aucune validation aujourd'hui</p>
                  </div>
                ) : (
                  valides.map((m, i) => (
                    <div key={i} className="grid grid-cols-12 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors items-center">
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{m.nom?.charAt(0)}{m.prenom?.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-semibold text-main">{m.nom} {m.prenom}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-bold text-main">{parseFloat(m.montant_cotisation || 0).toLocaleString("fr-FR")} FCFA</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-muted">
                          {m.heure_validation
                            ? new Date(m.heure_validation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                            : "—"
                          }
                        </span>
                      </div>
                      <div className="col-span-3">
                        {m.initiee_par === "membre"
                          ? <span className="text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">⚡ Membre</span>
                          : <span className="text-xs text-muted">Collecteur</span>
                        }
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">✓ Validée</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── ONGLET PROFIL ── */}
          {ongletActif === "profil" && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-main">Profil</h2>
                <p className="text-muted text-sm mt-0.5">Vos informations et statistiques</p>
              </div>

              {/* Carte profil */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
                <div className="bg-primary h-24 relative" />
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-8 mb-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center border-4 border-white flex-shrink-0">
                      <span className="text-white text-xl font-bold">{prenomCollecteur.charAt(0)}{nomCollecteur.charAt(0)}</span>
                    </div>
                    <div className="pb-1">
                      <h3 className="text-lg font-bold text-main">{prenomCollecteur} {nomCollecteur}</h3>
                      <span className="text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        <Shield size={11} /> Collecteur de terrain
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-xs">✉</span>
                      <span>{emailCollecteur || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-xs">🏢</span>
                      <span>CECAV Microfinance</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <MapPin size={12} />
                      <span>Lomé — Quartier Bè</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <span className="text-xs">📅</span>
                      <span>Membre depuis le 15 janvier 2025</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Membres gérés", value: membres.length, sub: "dans votre tournée" },
                  { label: "Validés aujourd'hui", value: valides.length, sub: `sur ${membres.length} membres` },
                  { label: "Total validations", value: valides.length, sub: "ce mois" },
                  { label: "Collecté ce mois", value: `${totalCollecte.toLocaleString("fr-FR")} FCFA`, sub: "toutes dates" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{s.label}</p>
                    <p className="text-2xl font-bold text-main">{s.value}</p>
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
                  "Paramètres de notification",
                  "Langue et région",
                  "Aide et support",
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors text-left">
                    <span className="text-sm text-main">{item}</span>
                    <ArrowRight size={15} className="text-muted" />
                  </button>
                ))}
              </div>

              {/* Déconnexion */}
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
    </div>
  )
}
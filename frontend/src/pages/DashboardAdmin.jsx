import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard, Users, History, Settings, LogOut,
  ChevronLeft, ChevronRight, Wallet, TrendingUp, CheckCircle2,
  ArrowDownCircle, UserPlus, Bell, Download, ClipboardList,
  MoreHorizontal, ArrowUpRight
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts"
import AjouterUtilisateur from "../components/AjouterUtilisateur"

export default function DashboardAdmin() {
  const [sidebarOuverte, setSidebarOuverte] = useState(true)
  const [stats, setStats] = useState({ totalMembres: 0, cotisationsAujourdhui: 0, totalCollecte: 0 })
  const [cotisations, setCotisations] = useState([])
  const [collecteurs, setCollecteurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modaleOuverte, setModaleOuverte] = useState(null)
  const [ongletActif, setOngletActif] = useState("dashboard")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [tendance7jours] = useState([
    { jour: "Lun", montant: 18000 },
    { jour: "Mar", montant: 22000 },
    { jour: "Mer", montant: 19000 },
    { jour: "Jeu", montant: 26000 },
    { jour: "Ven", montant: 31000 },
    { jour: "Sam", montant: 14000 },
    { jour: "Dim", montant: 8000 },
  ])

  const [retraitsEnAttente] = useState([
    { nom: "Kofi Mensah", montant: 15000, mode: "Mix by Yas", date: "25 juin" },
    { nom: "Adjoavi Dossou", montant: 8000, mode: "Moov Money", date: "25 juin" },
  ])

  const [dernieresInscriptions] = useState([
    { nom: "MFI Espoir Kara", plan: "Standard", statut: "en_attente", date: "24 juin" },
    { nom: "Tontine Avenir", plan: "Starter", statut: "validee", date: "22 juin" },
    { nom: "CECAV Nord", plan: "Premium", statut: "en_attente", date: "20 juin" },
  ])

  useEffect(() => {
    if (!token) { navigate("/"); return }
    fetch("http://localhost:5000/api/admin/stats", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()).then(data => setStats(data))

    fetch("http://localhost:5000/api/admin/cotisations/today", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()).then(data => { setCotisations(data); setLoading(false) })

    fetch("http://localhost:5000/api/admin/collecteurs", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()).then(data => setCollecteurs(data))
  }, [])

  const deconnexion = () => { localStorage.clear(); navigate("/") }

  const tauxReussite = stats.totalMembres > 0
    ? Math.round((stats.cotisationsAujourdhui / stats.totalMembres) * 100)
    : 0

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { id: "collecteurs", icon: Users, label: "Collecteurs" },
    { id: "membres", icon: UserPlus, label: "Membres" },
    { id: "retraits", icon: ArrowDownCircle, label: "Retraits" },
    { id: "inscriptions", icon: ClipboardList, label: "Inscriptions", onClick: () => navigate("/admin/inscriptions") },
    { id: "historique", icon: History, label: "Historique" },
  ]

  const statutBadge = (statut) => {
    if (statut === "validee") return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">Validée</span>
    if (statut === "rejetee") return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-500">Rejetée</span>
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">En attente</span>
  }

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
      <aside className={`bg-primary flex flex-col justify-between transition-all duration-300 flex-shrink-0 ${sidebarOuverte ? "w-60" : "w-[72px]"}`}>
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {sidebarOuverte && <span className="text-white font-bold text-base tracking-tight">CotiPay</span>}
          </div>

          {/* Nav */}
          <nav className="px-3 space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { if (item.onClick) { item.onClick() } else { setOngletActif(item.id) } }}
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

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-1">
          <div className="border-t border-white/10 mb-3" />
          {sidebarOuverte ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-bold">CF</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">CECAV Fraternité</p>
                <p className="text-white/40 text-xs">Administrateur</p>
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
              {navItems.find(n => n.id === ongletActif)?.label || "Tableau de bord"}
            </h1>
            <p className="text-muted text-xs mt-0.5">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModaleOuverte("collecteur")}
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
            >
              <UserPlus size={15} />
              {sidebarOuverte ? "Ajouter" : ""}
            </button>
            <button className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-muted hover:bg-gray-100 transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">

          {ongletActif === "dashboard" && (
            <div className="space-y-6">

              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: "Total membres",
                    value: stats.totalMembres,
                    icon: Users,
                    color: "text-primary",
                    bg: "bg-primary/8",
                    suffix: "",
                    trend: "+2 ce mois"
                  },
                  {
                    label: "Cotisations aujourd'hui",
                    value: stats.cotisationsAujourdhui,
                    icon: CheckCircle2,
                    color: "text-green-600",
                    bg: "bg-green-50",
                    suffix: "",
                    trend: `${tauxReussite}% taux`
                  },
                  {
                    label: "Retraits en attente",
                    value: retraitsEnAttente.length,
                    icon: ArrowDownCircle,
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                    suffix: "",
                    trend: "À traiter"
                  },
                  {
                    label: "Collecté aujourd'hui",
                    value: stats.totalCollecte?.toLocaleString("fr-FR"),
                    icon: Wallet,
                    color: "text-violet-600",
                    bg: "bg-violet-50",
                    suffix: " FCFA",
                    trend: "↑ vs hier"
                  },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                        <kpi.icon size={16} className={kpi.color} />
                      </div>
                      <ArrowUpRight size={14} className="text-gray-300" />
                    </div>
                    <p className="text-2xl font-bold text-main mb-1">{kpi.value}{kpi.suffix}</p>
                    <p className="text-xs text-muted mb-2">{kpi.label}</p>
                    <p className={`text-xs font-medium ${kpi.color}`}>{kpi.trend}</p>
                  </div>
                ))}
              </div>

              {/* Chart + Retraits */}
              <div className="grid grid-cols-3 gap-4">

                {/* Chart */}
                <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="font-bold text-main text-sm">Activité des cotisations</p>
                      <p className="text-muted text-xs mt-0.5">7 derniers jours</p>
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary/8 px-3 py-1 rounded-full">Cette semaine</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={tendance7jours}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3F418D" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3F418D" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="jour" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v) => [`${v.toLocaleString("fr-FR")} FCFA`, "Collecté"]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #F1F5F9", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                      />
                      <Area type="monotone" dataKey="montant" stroke="#3F418D" strokeWidth={2} fill="url(#grad)" dot={{ fill: "#3F418D", r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Retraits en attente */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-main text-sm">Retraits en attente</p>
                    <span className="w-5 h-5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full flex items-center justify-center">
                      {retraitsEnAttente.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {retraitsEnAttente.map((r, i) => (
                      <div key={i} className="p-3 bg-[#F8FAFC] rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-xs font-bold">{r.nom.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-main truncate">{r.nom}</p>
                            <p className="text-xs text-muted">{r.mode} · {r.date}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-main mb-2">{r.montant.toLocaleString("fr-FR")} FCFA</p>
                        <div className="flex gap-2">
                          <button className="flex-1 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors">
                            Valider
                          </button>
                          <button className="flex-1 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                            Rejeter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dernières inscriptions + Cotisations du jour */}
              <div className="grid grid-cols-2 gap-4">

                {/* Inscriptions */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-main text-sm">Dernières inscriptions</p>
                    <button className="text-primary text-xs font-semibold hover:underline">Voir tout</button>
                  </div>
                  <div className="space-y-3">
                    {dernieresInscriptions.map((ins, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">{ins.nom.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-main truncate">{ins.nom}</p>
                          <p className="text-xs text-muted">Plan {ins.plan} · {ins.date}</p>
                        </div>
                        {statutBadge(ins.statut)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cotisations du jour */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-main text-sm">Cotisations du jour</p>
                    <button className="flex items-center gap-1.5 text-primary text-xs font-semibold hover:underline">
                      <Download size={12} /> Export CSV
                    </button>
                  </div>
                  {cotisations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 size={18} className="text-gray-300" />
                      </div>
                      <p className="text-muted text-sm">Aucune cotisation aujourd'hui</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cotisations.slice(0, 5).map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">{c.nom?.charAt(0)}</span>
                            </div>
                            <p className="text-sm font-medium text-main">{c.nom} {c.prenom}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-main">{c.montant} F</p>
                            {c.statut === "valide"
                              ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Validé</span>
                              : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Attente</span>
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Placeholder autres onglets */}
          {ongletActif !== "dashboard" && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
                {(() => { const Item = navItems.find(n => n.id === ongletActif); return Item ? <Item.icon size={22} className="text-primary" /> : null })()}
              </div>
              <p className="font-semibold text-main text-sm mb-1">{navItems.find(n => n.id === ongletActif)?.label}</p>
              <p className="text-muted text-xs">Cette section sera disponible bientôt.</p>
            </div>
          )}

        </main>
      </div>

      {/* Modale */}
      {modaleOuverte && (
        <AjouterUtilisateur
          type={modaleOuverte}
          listeCollecteurs={collecteurs}
          onFermer={() => setModaleOuverte(null)}
          onSucces={() => setModaleOuverte(null)}
        />
      )}

    </div>
  )
}
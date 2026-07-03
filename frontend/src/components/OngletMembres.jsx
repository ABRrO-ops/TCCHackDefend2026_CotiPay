import { useState, useEffect } from "react"
import { Search, Eye, Trash2, X } from "lucide-react"
import AjouterUtilisateur from "./AjouterUtilisateur"

export default function OngletMembres({ token, onAjouter }) {
  const [membres, setMembres] = useState([])
  const [collecteurs, setCollecteurs] = useState([])
  const [recherche, setRecherche] = useState("")
  const [loading, setLoading] = useState(true)
  const [modaleVoir, setModaleVoir] = useState(null)
  const [cotisations, setCotisations] = useState([])
  const [loadingCotisations, setLoadingCotisations] = useState(false)
  const [modaleAjouter, setModaleAjouter] = useState(false)

  const charger = () => {
    fetch("http://localhost:5000/api/admin/membres", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => { setMembres(Array.isArray(data) ? data : []); setLoading(false) })

    fetch("http://localhost:5000/api/admin/collecteurs", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => setCollecteurs(Array.isArray(data) ? data : []))
  }

  useEffect(() => { charger() }, [])

  const voirMembre = (m) => {
    setModaleVoir(m)
    setLoadingCotisations(true)
    fetch(`http://localhost:5000/api/admin/membres/${m.id}/cotisations`, {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => { setCotisations(Array.isArray(data) ? data : []); setLoadingCotisations(false) })
  }

  const filtres = membres.filter(m =>
    `${m.nom} ${m.prenom}`.toLowerCase().includes(recherche.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(recherche.toLowerCase())
  )

  const joursValides = new Set(cotisations.filter(c => c.statut === "valide").map(c => new Date(c.date_cotisation).getDate()))
  const aujourdhui = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

  const couleurJour = (jour) => {
    if (jour > aujourdhui) return "bg-gray-50 text-gray-300"
    if (jour === aujourdhui) return joursValides.has(jour) ? "bg-primary text-white font-bold" : "bg-primary text-white font-bold ring-2 ring-red-400"
    if (joursValides.has(jour)) return "bg-green-50 text-green-600 font-semibold"
    return "bg-red-50 text-red-400"
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-main">Membres</h2>
          <p className="text-muted text-sm mt-0.5">{membres.length} membre(s) enregistré(s) dans votre institution</p>
        </div>
        <button
          onClick={() => setModaleAjouter(true)}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
        >
          + Ajouter un membre
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher un membre..."
              className="pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary bg-gray-50 w-64"
            />
          </div>
          <span className="text-muted text-xs">{filtres.length} résultat(s)</span>
        </div>

        {/* En-têtes */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-gray-50">
          <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Membre</span>
          <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Email</span>
          <span className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide">Collecteur</span>
          <span className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide">Solde</span>
          <span className="col-span-1 text-xs font-semibold text-muted uppercase tracking-wide">Aujourd'hui</span>
          <span className="col-span-1 text-xs font-semibold text-muted uppercase tracking-wide text-right">Actions</span>
        </div>

        {loading ? (
          <div className="py-12 text-center"><p className="text-muted text-sm">Chargement...</p></div>
        ) : filtres.length === 0 ? (
          <div className="py-12 text-center"><p className="text-muted text-sm">Aucun membre trouvé.</p></div>
        ) : (
          filtres.map((m, i) => (
            <div key={i} className="grid grid-cols-12 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors items-center">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{m.prenom?.charAt(0)}{m.nom?.charAt(0)}</span>
                </div>
                <span className="text-sm font-semibold text-main">{m.prenom} {m.nom}</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm text-muted">{m.email || "—"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-muted">{m.collecteur_prenom} {m.collecteur_nom}</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-semibold text-main">{parseFloat(m.solde || 0).toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="col-span-1">
                {m.cotise_aujourdhui
                  ? <span className="text-xs bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full">● Cotisé</span>
                  : <span className="text-xs bg-red-50 text-red-400 font-semibold px-2 py-0.5 rounded-full">● Non cotisé</span>
                }
              </div>
              <div className="col-span-1 flex items-center justify-end gap-3">
                <button onClick={() => voirMembre(m)} className="flex items-center gap-1 text-primary text-xs font-semibold hover:underline">
                  <Eye size={13} /> Voir
                </button>
                <button className="flex items-center gap-1 text-red-400 text-xs font-semibold hover:underline">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modale Voir membre */}
      {modaleVoir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{modaleVoir.prenom?.charAt(0)}{modaleVoir.nom?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{modaleVoir.prenom} {modaleVoir.nom}</p>
                  <p className="text-white/70 text-sm">{modaleVoir.email}</p>
                </div>
              </div>
              <button onClick={() => setModaleVoir(null)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Infos */}
            <div className="p-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Informations personnelles</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">N° de compte</p>
                  <p className="text-sm font-semibold text-primary">{modaleVoir.numero_compte || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Solde</p>
                  <p className="text-sm font-semibold text-main">{parseFloat(modaleVoir.solde || 0).toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Téléphone</p>
                  <p className="text-sm font-semibold text-main">{modaleVoir.telephone || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Adresse</p>
                  <p className="text-sm font-semibold text-main">{modaleVoir.adresse || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-muted mb-0.5">Lieu de travail</p>
                  <p className="text-sm font-semibold text-main">{modaleVoir.lieu_travail || "—"}</p>
                </div>
              </div>
            </div>

            {/* Calendrier cotisations */}
            <div className="p-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Calendrier — {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
              {loadingCotisations ? (
                <p className="text-muted text-sm">Chargement...</p>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["L","M","M","J","V","S","D"].map((j, i) => (
                      <div key={i} className="text-center text-xs text-muted font-semibold py-1">{j}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(jour => (
                      <div key={jour} className={`aspect-square flex items-center justify-center rounded-lg text-xs transition-colors ${couleurJour(jour)}`}>
                        {jour}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-xs text-muted"><span className="w-3 h-3 rounded bg-green-50 inline-block" /> Cotisé</span>
                    <span className="flex items-center gap-1 text-xs text-muted"><span className="w-3 h-3 rounded bg-red-50 inline-block" /> Manqué</span>
                    <span className="flex items-center gap-1 text-xs text-muted"><span className="w-3 h-3 rounded bg-primary inline-block" /> Aujourd'hui</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale Ajouter */}
      {modaleAjouter && (
        <AjouterUtilisateur
          type="membre"
          listeCollecteurs={collecteurs}
          onFermer={() => setModaleAjouter(false)}
          onSucces={() => { setModaleAjouter(false); charger() }}
        />
      )}
    </div>
  )
}
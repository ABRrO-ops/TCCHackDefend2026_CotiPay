import { useState, useEffect } from "react"
import { Search, Eye, Trash2, X, CheckCircle2, Users } from "lucide-react"
import AjouterUtilisateur from "./AjouterUtilisateur"

export default function OngletCollecteurs({ token, onAjouter }) {
  const [collecteurs, setCollecteurs] = useState([])
  const [recherche, setRecherche] = useState("")
  const [loading, setLoading] = useState(true)
  const [modaleVoir, setModaleVoir] = useState(null)
  const [membresCollecteur, setMembresCollecteur] = useState([])
  const [loadingMembres, setLoadingMembres] = useState(false)
  const [modaleAjouter, setModaleAjouter] = useState(false)

  const charger = () => {
    fetch("http://localhost:5000/api/admin/collecteurs", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => { setCollecteurs(Array.isArray(data) ? data : []); setLoading(false) })
  }

  useEffect(() => { charger() }, [])

  const voirCollecteur = (c) => {
    setModaleVoir(c)
    setLoadingMembres(true)
    fetch(`http://localhost:5000/api/admin/collecteurs/${c.id}/membres`, {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => { setMembresCollecteur(Array.isArray(data) ? data : []); setLoadingMembres(false) })
  }

  const filtres = collecteurs.filter(c =>
    `${c.nom} ${c.prenom}`.toLowerCase().includes(recherche.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-main">Collecteurs</h2>
          <p className="text-muted text-sm mt-0.5">{collecteurs.length} collecteur(s) enregistré(s) dans votre institution</p>
        </div>
        <button
          onClick={() => setModaleAjouter(true)}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
        >
          + Ajouter un collecteur
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher un collecteur..."
              className="pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary bg-gray-50 w-64"
            />
          </div>
          <span className="text-muted text-xs">{filtres.length} résultat(s)</span>
        </div>

        <div className="grid grid-cols-12 px-5 py-3 border-b border-gray-50">
          <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Collecteur</span>
          <span className="col-span-4 text-xs font-semibold text-muted uppercase tracking-wide">Email</span>
          <span className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide">Membres</span>
          <span className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide">Depuis</span>
          <span className="col-span-1 text-xs font-semibold text-muted uppercase tracking-wide text-right">Actions</span>
        </div>

        {loading ? (
          <div className="py-12 text-center"><p className="text-muted text-sm">Chargement...</p></div>
        ) : filtres.length === 0 ? (
          <div className="py-12 text-center"><p className="text-muted text-sm">Aucun collecteur trouvé.</p></div>
        ) : (
          filtres.map((c, i) => (
            <div key={i} className="grid grid-cols-12 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors items-center">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{c.prenom?.charAt(0)}{c.nom?.charAt(0)}</span>
                </div>
                <span className="text-sm font-semibold text-main">{c.prenom} {c.nom}</span>
              </div>
              <div className="col-span-4">
                <span className="text-sm text-muted">{c.email || "—"}</span>
              </div>
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Users size={11} /> {c.nombre_membres || 0}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-muted">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "—"}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-end gap-3">
                <button onClick={() => voirCollecteur(c)} className="flex items-center gap-1 text-primary text-xs font-semibold hover:underline">
                  <Eye size={13} /> Voir
                </button>
                <button className="flex items-center gap-1 text-red-400 text-xs font-semibold hover:underline">
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modaleVoir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-primary p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{modaleVoir.prenom?.charAt(0)}{modaleVoir.nom?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{modaleVoir.prenom} {modaleVoir.nom}</p>
                  <p className="text-white/70 text-sm">{modaleVoir.email || "—"}</p>
                </div>
              </div>
              <button onClick={() => setModaleVoir(null)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Informations professionnelles</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Numéro agent</p>
                  <p className="text-sm font-semibold text-main">AG-{String(modaleVoir.id).padStart(4, "0")}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Date d'entrée</p>
                  <p className="text-sm font-semibold text-main">
                    {modaleVoir.created_at ? new Date(modaleVoir.created_at).toLocaleDateString("fr-FR") : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Membres gérés</p>
                  <p className="text-sm font-semibold text-main">{membresCollecteur.length}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Statut</p>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Actif</span>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-64 overflow-auto">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Membres gérés</p>
              {loadingMembres ? (
                <p className="text-muted text-sm">Chargement...</p>
              ) : membresCollecteur.length === 0 ? (
                <p className="text-muted text-sm">Aucun membre assigné.</p>
              ) : (
                <div className="space-y-2">
                  {membresCollecteur.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-primary text-xs font-bold">{m.prenom?.charAt(0)}{m.nom?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-main">{m.prenom} {m.nom}</p>
                          <p className="text-xs text-muted">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-main">{parseFloat(m.solde || 0).toLocaleString("fr-FR")} F</span>
                        {m.cotise_aujourdhui
                          ? <span className="text-xs bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full">Cotisé</span>
                          : <span className="text-xs bg-red-50 text-red-400 font-semibold px-2 py-0.5 rounded-full">Non cotisé</span>
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

      {modaleAjouter && (
        <AjouterUtilisateur
          type="collecteur"
          listeCollecteurs={[]}
          onFermer={() => setModaleAjouter(false)}
          onSucces={() => { setModaleAjouter(false); charger() }}
        />
      )}
    </div>
  )
}
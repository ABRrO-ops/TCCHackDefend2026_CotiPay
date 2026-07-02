import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle2, XCircle, Users, UserCheck } from "lucide-react"

export default function AdminInscriptions() {
  const [demandes, setDemandes] = useState({ membres: [], collecteurs: [] })
  const [loading, setLoading] = useState(true)
  const [collecteurs, setCollecteurs] = useState([])
  const [assignation, setAssignation] = useState({})
  const [messages, setMessages] = useState({})
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const charger = () => {
    fetch("http://localhost:5000/api/selfservice/inscriptions-attente", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => { setDemandes(data); setLoading(false) })

    fetch("http://localhost:5000/api/admin/collecteurs", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => setCollecteurs(data))
  }

  useEffect(() => {
    if (!token) { navigate("/"); return }
    charger()
  }, [])

  const validerMembre = async (id) => {
    const collecteurId = assignation[id]
    if (!collecteurId) {
      setMessages({ ...messages, [id]: "Veuillez assigner un collecteur" })
      return
    }
    const res = await fetch(`http://localhost:5000/api/selfservice/valider-membre/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ collecteur_id: collecteurId })
    })
    const data = await res.json()
    setMessages({ ...messages, [id]: data.message })
    charger()
  }

  const validerCollecteur = async (id) => {
    const res = await fetch(`http://localhost:5000/api/selfservice/valider-collecteur/${id}`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    })
    const data = await res.json()
    setMessages({ ...messages, [id]: data.message })
    charger()
  }

  const rejeter = async (id) => {
    const res = await fetch(`http://localhost:5000/api/selfservice/rejeter/${id}`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    })
    const data = await res.json()
    setMessages({ ...messages, [id]: data.message })
    charger()
  }

  if (loading) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <p className="text-muted">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary p-8">
      <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-muted text-sm mb-6">
        <ArrowLeft size={16} /> Retour au tableau de bord
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-main">Inscriptions en attente</h1>
        <p className="text-muted text-sm">{demandes.membres.length + demandes.collecteurs.length} demande(s) à traiter</p>
      </div>

      {/* Membres en attente */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-primary" />
          <h2 className="font-bold text-main">Membres ({demandes.membres.length})</h2>
        </div>

        {demandes.membres.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-soft text-center">
            <p className="text-muted text-sm">Aucun membre en attente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {demandes.membres.map(m => (
              <div key={m.id} className="bg-white rounded-2xl p-5 border border-soft">
                <div className="flex items-start gap-4 mb-4">
                  {m.photo_url ? (
                    <img src={`http://localhost:5000${m.photo_url}`} alt="photo" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">{m.prenom?.charAt(0)}{m.nom?.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-main text-sm">{m.prenom} {m.nom}</p>
                    <p className="text-muted text-xs">{m.telephone}</p>
                    <p className="text-muted text-xs">{m.adresse}</p>
                    <p className="text-muted text-xs">Lieu de travail : {m.lieu_travail}</p>
                    <p className="text-muted text-xs">N° compte : <span className="font-semibold text-primary">{m.numero_compte}</span></p>
                  </div>
                </div>

                {messages[m.id] && (
                  <p className="text-success text-xs mb-3 bg-success-light px-3 py-1 rounded-lg">{messages[m.id]}</p>
                )}

                <div className="mb-3">
                  <label className="text-xs font-semibold text-muted">Assigner un collecteur *</label>
                  <select
                    value={assignation[m.id] || ""}
                    onChange={e => setAssignation({ ...assignation, [m.id]: e.target.value })}
                    className="w-full border border-soft rounded-xl px-3 py-2 mt-1 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Choisir un collecteur</option>
                    {collecteurs.map(c => (
                      <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => rejeter(m.id)} className="flex items-center gap-1.5 border border-soft text-muted text-xs font-semibold px-3 py-2 rounded-lg">
                    <XCircle size={14} /> Rejeter
                  </button>
                  <button onClick={() => validerMembre(m.id)} className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg">
                    <CheckCircle2 size={14} /> Valider + Assigner
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collecteurs en attente */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <UserCheck size={18} className="text-primary" />
          <h2 className="font-bold text-main">Collecteurs ({demandes.collecteurs.length})</h2>
        </div>

        {demandes.collecteurs.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-soft text-center">
            <p className="text-muted text-sm">Aucun collecteur en attente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {demandes.collecteurs.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-soft">
                <div className="flex items-start gap-4 mb-4">
                  {c.photo_url ? (
                    <img src={`http://localhost:5000${c.photo_url}`} alt="photo" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">{c.prenom?.charAt(0)}{c.nom?.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-main text-sm">{c.prenom} {c.nom}</p>
                    <p className="text-muted text-xs">Naissance : {c.date_naissance ? new Date(c.date_naissance).toLocaleDateString('fr-FR') : "—"}</p>
                    <p className="text-muted text-xs">Lieu travail précédent : {c.lieu_travail_avant || "—"}</p>
                    {c.cv_url && (
                      <a href={`http://localhost:5000${c.cv_url}`} target="_blank" rel="noreferrer" className="text-primary text-xs underline">
                        Voir le CV
                      </a>
                    )}
                  </div>
                </div>

                {messages[c.id] && (
                  <p className="text-success text-xs mb-3 bg-success-light px-3 py-1 rounded-lg">{messages[c.id]}</p>
                )}

                <div className="flex gap-3">
                  <button onClick={() => rejeter(c.id)} className="flex items-center gap-1.5 border border-soft text-muted text-xs font-semibold px-3 py-2 rounded-lg">
                    <XCircle size={14} /> Rejeter
                  </button>
                  <button onClick={() => validerCollecteur(c.id)} className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg">
                    <CheckCircle2 size={14} /> Valider
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
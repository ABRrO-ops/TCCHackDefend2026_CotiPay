import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowLeft, Building2 } from "lucide-react"

export default function ChoisirMicrofinance() {
  const [microfinances, setMicrofinances] = useState([])
  const [recherche, setRecherche] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch("http://localhost:5000/api/selfservice/microfinances")
      .then(res => res.json())
      .then(data => { setMicrofinances(data); setLoading(false) })
  }, [])

  const filtrees = microfinances.filter(mf =>
    mf.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    mf.ville.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-lg mx-auto">

        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted text-sm mb-6">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main mb-1">Trouvez votre micro-finance</h1>
          <p className="text-muted text-sm">Choisissez la micro-finance à laquelle vous souhaitez vous inscrire.</p>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher par nom ou ville..."
            className="w-full border border-soft rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary bg-white"
          />
        </div>

        {loading ? (
          <p className="text-muted text-sm text-center py-8">Chargement...</p>
        ) : filtrees.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">Aucune micro-finance trouvée.</p>
        ) : (
          <div className="space-y-3">
            {filtrees.map(mf => (
              <button
                key={mf.id}
                onClick={() => navigate(`/inscription-role/${mf.id}`, { state: { microfinance: mf } })}
                className="w-full bg-white rounded-2xl p-4 border border-soft flex items-center gap-3 hover:border-primary transition-colors text-left"
              >
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-main text-sm">{mf.nom}</p>
                  <p className="text-muted text-xs">{mf.ville}</p>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
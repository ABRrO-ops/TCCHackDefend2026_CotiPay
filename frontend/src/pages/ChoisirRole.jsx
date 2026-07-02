import { useNavigate, useLocation, useParams } from "react-router-dom"
import { ArrowLeft, Users, UserCheck } from "lucide-react"

export default function ChoisirRole() {
  const navigate = useNavigate()
  const { microfinanceId } = useParams()
  const { state } = useLocation()
  const mf = state?.microfinance

  return (
    <div className="min-h-screen bg-secondary p-6 flex items-center justify-center">
      <div className="max-w-sm w-full">

        <button onClick={() => navigate("/choisir-microfinance")} className="flex items-center gap-2 text-muted text-sm mb-6">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="mb-8 text-center">
          <p className="text-muted text-xs mb-1">Vous rejoignez</p>
          <h2 className="text-xl font-bold text-main">{mf?.nom}</h2>
          <p className="text-muted text-sm">{mf?.ville}</p>
        </div>

        <p className="text-main font-semibold text-sm text-center mb-4">Vous vous inscrivez en tant que :</p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/inscription-membre/${microfinanceId}`, { state: { microfinance: mf } })}
            className="w-full bg-white rounded-2xl p-5 border-2 border-soft hover:border-primary transition-colors text-left flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-main text-sm">Membre</p>
              <p className="text-muted text-xs">Je veux cotiser et épargner via cette micro-finance</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/inscription-collecteur/${microfinanceId}`, { state: { microfinance: mf } })}
            className="w-full bg-white rounded-2xl p-5 border-2 border-soft hover:border-primary transition-colors text-left flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <UserCheck size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-main text-sm">Collecteur</p>
              <p className="text-muted text-xs">Je veux travailler comme collecteur pour cette micro-finance</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
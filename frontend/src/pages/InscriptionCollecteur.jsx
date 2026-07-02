import { useState } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import IndicateurEtapes from "../components/IndicateurEtapes"

export default function InscriptionCollecteur() {
  const { microfinanceId } = useParams()
  const { state } = useLocation()
  const mf = state?.microfinance
  const navigate = useNavigate()

  const [etape, setEtape] = useState(1)
  const [confirme, setConfirme] = useState(false)
  const [erreur, setErreur] = useState("")
  const [resultat, setResultat] = useState(null)

  const [formData, setFormData] = useState({
    nom: "", prenom: "", lieu_travail_avant: "", date_naissance: "", photo: null, cv: null
  })

  const majChamp = (champ, valeur) => setFormData({ ...formData, [champ]: valeur })

  const envoyerInscription = async () => {
    try {
      const data = new FormData()
      data.append("microfinance_id", microfinanceId)
      data.append("nom", formData.nom)
      data.append("prenom", formData.prenom)
      data.append("lieu_travail_avant", formData.lieu_travail_avant)
      data.append("date_naissance", formData.date_naissance)
      if (formData.photo) data.append("photo", formData.photo)
      if (formData.cv) data.append("cv", formData.cv)

      const res = await fetch("http://localhost:5000/api/selfservice/inscription-collecteur", {
        method: "POST",
        body: data
      })
      const json = await res.json()

      if (res.ok) {
        setResultat(json)
        setConfirme(true)
      } else {
        setErreur(json.error || "Erreur lors de l'inscription")
      }
    } catch (err) {
      setErreur("Erreur de connexion au serveur")
    }
  }

  if (confirme && resultat) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-main mb-2">Candidature envoyée !</h2>
          <p className="text-muted text-sm mb-6">Votre dossier est en cours d'examen par la micro-finance.</p>

          <div className="bg-secondary rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <p><span className="text-muted">Email :</span> <span className="font-semibold text-main">{resultat.email}</span></p>
            <p><span className="text-muted">Mot de passe :</span> <span className="font-semibold text-main">{resultat.motDePasseTemp}</span></p>
          </div>

          <p className="text-xs text-muted mb-4">⚠️ Notez ces informations. Vous pourrez vous connecter une fois votre dossier validé.</p>

          <button onClick={() => navigate("/")} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm">
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-md mx-auto">

        <button onClick={() => etape === 1 ? navigate(-1) : setEtape(etape - 1)} className="flex items-center gap-2 text-muted text-sm mb-6">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="mb-2">
          <p className="text-muted text-xs">Candidature à {mf?.nom}</p>
          <h1 className="text-xl font-bold text-main">Dossier collecteur</h1>
        </div>

        <div className="mb-6">
          <IndicateurEtapes etapeActuelle={etape} totalEtapes={2} />
        </div>

        {erreur && (
          <p className="text-danger text-sm mb-4 bg-danger-light px-4 py-2 rounded-xl">{erreur}</p>
        )}

        <div className="bg-white rounded-2xl p-6 border border-soft">

          {/* ÉTAPE 1 — Infos personnelles */}
          {etape === 1 && (
            <>
              <h2 className="font-bold text-main mb-4">Vos informations</h2>

              <label className="text-xs font-semibold text-muted">Prénom</label>
              <input value={formData.prenom} onChange={e => majChamp("prenom", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-3 text-sm focus:outline-none focus:border-primary" />

              <label className="text-xs font-semibold text-muted">Nom</label>
              <input value={formData.nom} onChange={e => majChamp("nom", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-3 text-sm focus:outline-none focus:border-primary" />

              <label className="text-xs font-semibold text-muted">Date de naissance</label>
              <input type="date" value={formData.date_naissance} onChange={e => majChamp("date_naissance", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-3 text-sm focus:outline-none focus:border-primary" />

              <label className="text-xs font-semibold text-muted">Lieu de travail précédent</label>
              <input value={formData.lieu_travail_avant} onChange={e => majChamp("lieu_travail_avant", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-4 text-sm focus:outline-none focus:border-primary"
                placeholder="Ex: Banque Atlantique, Marché central..." />

              <button
                onClick={() => setEtape(2)}
                disabled={!formData.prenom || !formData.nom || !formData.date_naissance}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-40"
              >
                Suivant →
              </button>
            </>
          )}

          {/* ÉTAPE 2 — Documents */}
          {etape === 2 && (
            <>
              <h2 className="font-bold text-main mb-4">Photo + CV (optionnel)</h2>

              <label className="text-xs font-semibold text-muted">Photo de profil</label>
              <input type="file" accept="image/*"
                onChange={e => majChamp("photo", e.target.files[0])}
                className="w-full border border-soft rounded-xl px-4 py-2 mt-1 mb-4 text-sm" />

              <label className="text-xs font-semibold text-muted">CV (optionnel)</label>
              <input type="file" accept=".pdf,.doc,.docx"
                onChange={e => majChamp("cv", e.target.files[0])}
                className="w-full border border-soft rounded-xl px-4 py-2 mt-1 mb-6 text-sm" />

              <button
                onClick={envoyerInscription}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm"
              >
                Envoyer ma candidature
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  )
}
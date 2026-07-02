import { useState } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import IndicateurEtapes from "../components/IndicateurEtapes"
import ChoixPaiement from "../components/ChoixPaiement"
import SimulationUSSD from "../components/SimulationUSSD"

export default function InscriptionMembre() {
  const { microfinanceId } = useParams()
  const { state } = useLocation()
  const mf = state?.microfinance
  const navigate = useNavigate()

  const [etape, setEtape] = useState(1)
  const [etapePaiement, setEtapePaiement] = useState(null)
  const [modeChoisi, setModeChoisi] = useState(null)
  const [confirme, setConfirme] = useState(false)
  const [erreur, setErreur] = useState("")
  const [resultat, setResultat] = useState(null)

  const [formData, setFormData] = useState({
    nom: "", prenom: "", adresse: "", lieu_travail: "", ville_village: "", telephone: "", photo: null
  })

  const majChamp = (champ, valeur) => setFormData({ ...formData, [champ]: valeur })

  const envoyerInscription = async (modePaiement) => {
    try {
      const data = new FormData()
      data.append("microfinance_id", microfinanceId)
      data.append("nom", formData.nom)
      data.append("prenom", formData.prenom)
      data.append("adresse", formData.adresse)
      data.append("lieu_travail", formData.lieu_travail)
      data.append("ville_village", formData.ville_village)
      data.append("telephone", formData.telephone)
      if (formData.photo) data.append("photo", formData.photo)

      const res = await fetch("http://localhost:5000/api/selfservice/inscription-membre", {
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
          <h2 className="text-xl font-bold text-main mb-2">Inscription envoyée !</h2>
          <p className="text-muted text-sm mb-6">Votre dossier est en cours d'examen. Vous recevrez une confirmation sous peu.</p>

          <div className="bg-secondary rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <p><span className="text-muted">Email :</span> <span className="font-semibold text-main">{resultat.email}</span></p>
            <p><span className="text-muted">Mot de passe :</span> <span className="font-semibold text-main">{resultat.motDePasseTemp}</span></p>
            <p><span className="text-muted">N° de compte :</span> <span className="font-semibold text-primary">{resultat.numeroCompte}</span></p>
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
          <p className="text-muted text-xs">Inscription à {mf?.nom}</p>
          <h1 className="text-xl font-bold text-main">Votre dossier membre</h1>
        </div>

        <div className="mb-6">
          <IndicateurEtapes etapeActuelle={etape} totalEtapes={3} />
        </div>

        {erreur && (
          <p className="text-danger text-sm mb-4 bg-danger-light px-4 py-2 rounded-xl">{erreur}</p>
        )}

        <div className="bg-white rounded-2xl p-6 border border-soft">

          {/* ÉTAPE 1 — Identité */}
          {etape === 1 && (
            <>
              <h2 className="font-bold text-main mb-4">Vos informations personnelles</h2>

              <label className="text-xs font-semibold text-muted">Prénom</label>
              <input value={formData.prenom} onChange={e => majChamp("prenom", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-3 text-sm focus:outline-none focus:border-primary" />

              <label className="text-xs font-semibold text-muted">Nom</label>
              <input value={formData.nom} onChange={e => majChamp("nom", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-3 text-sm focus:outline-none focus:border-primary" />

              <label className="text-xs font-semibold text-muted">Téléphone</label>
              <input value={formData.telephone} onChange={e => majChamp("telephone", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-3 text-sm focus:outline-none focus:border-primary" />

              <label className="text-xs font-semibold text-muted">Photo de profil</label>
              <input type="file" accept="image/*"
                onChange={e => majChamp("photo", e.target.files[0])}
                className="w-full border border-soft rounded-xl px-4 py-2 mt-1 mb-4 text-sm" />

              <button
                onClick={() => setEtape(2)}
                disabled={!formData.prenom || !formData.nom || !formData.telephone}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-40"
              >
                Suivant →
              </button>
            </>
          )}

          {/* ÉTAPE 2 — Adresse & travail */}
          {etape === 2 && (
            <>
              <h2 className="font-bold text-main mb-4">Votre adresse et lieu de travail</h2>

              <label className="text-xs font-semibold text-muted">Adresse</label>
              <input value={formData.adresse} onChange={e => majChamp("adresse", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-3 text-sm focus:outline-none focus:border-primary"
                placeholder="Ex: Quartier Adidogomé, Rue 45" />

              <label className="text-xs font-semibold text-muted">Lieu de travail</label>
              <input value={formData.lieu_travail} onChange={e => majChamp("lieu_travail", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-3 text-sm focus:outline-none focus:border-primary"
                placeholder="Ex: Marché de Hédzranawoé" />

              <label className="text-xs font-semibold text-muted">Ville/Village (optionnel)</label>
              <input value={formData.ville_village} onChange={e => majChamp("ville_village", e.target.value)}
                className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-4 text-sm focus:outline-none focus:border-primary"
                placeholder="Ex: Lomé" />

              <button
                onClick={() => setEtape(3)}
                disabled={!formData.adresse || !formData.lieu_travail}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-40"
              >
                Suivant →
              </button>
            </>
          )}

          {/* ÉTAPE 3 — Récap + paiement */}
          {etape === 3 && (
            <>
              <h2 className="font-bold text-main mb-4">Récapitulatif + frais d'inscription</h2>

              <div className="bg-secondary rounded-xl p-4 text-sm space-y-1 mb-5">
                <p><span className="text-muted">Nom :</span> <span className="font-semibold">{formData.prenom} {formData.nom}</span></p>
                <p><span className="text-muted">Téléphone :</span> <span className="font-semibold">{formData.telephone}</span></p>
                <p><span className="text-muted">Adresse :</span> <span className="font-semibold">{formData.adresse}</span></p>
                <p><span className="text-muted">Lieu de travail :</span> <span className="font-semibold">{formData.lieu_travail}</span></p>
              </div>

              <div className="bg-warning-light rounded-xl p-4 mb-5">
                <p className="text-warning text-sm font-semibold">Frais d'inscription</p>
                <p className="text-main text-2xl font-bold">2 000 FCFA</p>
                <p className="text-muted text-xs mt-1">Paiement via Mobile Money requis pour valider votre dossier</p>
              </div>

              <button
                onClick={() => setEtapePaiement("choix-paiement")}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm"
              >
                Payer et envoyer mon dossier
              </button>
            </>
          )}

        </div>

        {/* Modales paiement */}
        {etapePaiement === "choix-paiement" && (
          <ChoixPaiement
            montant="2 000"
            onConfirme={(mode) => { setModeChoisi(mode); setEtapePaiement("ussd") }}
            onAnnuler={() => setEtapePaiement(null)}
          />
        )}
        {etapePaiement === "ussd" && (
          <SimulationUSSD
            mode={modeChoisi}
            montant="2 000"
            onConfirme={() => { setEtapePaiement(null); envoyerInscription(modeChoisi) }}
            onAnnuler={() => setEtapePaiement(null)}
          />
        )}

      </div>
    </div>
  )
}
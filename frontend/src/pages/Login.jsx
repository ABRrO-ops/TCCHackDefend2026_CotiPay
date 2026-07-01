import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import CarrouselRoles from "../components/CarrouselRoles"

export default function Login() {
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [erreur, setErreur] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setErreur(""); // Réinitialise l'erreur à chaque tentative

    try {
      // CORRECTION : Utilisation du chemin relatif géré par le proxy Vite
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: motDePasse })
      })

      const data = await res.json()

      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", data.role)
        if (data.role === "super_admin") navigate("/backoffice")
        else if (data.role === "admin") navigate("/admin")
        else if (data.role === "collecteur") navigate("/collecteur")
        else navigate("/membre")
      } else {
        setErreur(data.message || "Identifiants incorrects")
      }
    } catch (err) {
      setErreur("Erreur de connexion au serveur")
    }
  }

  return (
    <div className="min-h-screen flex bg-secondary">

      {/* Côté gauche - branding */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-light/30 rounded-full" />
        <div className="absolute bottom-0 -left-10 w-48 h-48 bg-primary-dark/40 rounded-full" />

        <div className="flex items-center gap-3 z-10">
          <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-lg">C</span>
          </div>
          <span className="text-white font-bold text-xl">CotiPay</span>
        </div>

        <div className="z-10">
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
            La tontine,<br />enfin digitale.
          </h1>
          <p className="text-primary-light/90 text-sm mb-8">
            Une seule plateforme pour les membres, les collecteurs et les micro-finances.
          </p>

          {/* 3 mini-blocs rôles */}
          <CarrouselRoles />
          <div className="space-y-3 mt-4">
            <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-lg">👤</span>
              <p className="text-white text-sm">Les <strong>membres</strong> suivent leur épargne en temps réel</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-lg">✅</span>
              <p className="text-white text-sm">Les <strong>collecteurs</strong> valident les cotisations en 1 clic</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-lg">📊</span>
              <p className="text-white text-sm">Les <strong>admins</strong> pilotent leur micro-finance</p>
            </div>
          </div>
        </div>

        <div className="z-10">
          <span className="bg-primary-dark text-secondary text-xs px-4 py-2 rounded-full">
            🇹🇬
          </span>
        </div>
      </div>

      {/* Côté droit - formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          <h2 className="text-2xl font-bold text-main mb-2">Bon retour 👋</h2>
          <p className="text-muted text-sm mb-8">Connectez-vous à votre espace CotiPay</p>

          {erreur && (
            <p className="text-danger text-sm mb-4 bg-danger-light px-4 py-2 rounded-lg">{erreur}</p>
          )}

          <form onSubmit={handleLogin}>
            <label className="text-sm font-semibold text-main">Adresse email</label>
            <input
              type="email"
              required
              placeholder="vous@cotipay.tg"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-5 text-sm focus:outline-none focus:border-primary"
            />

            <label className="text-sm font-semibold text-main">Mot de passe</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              className="w-full border border-soft rounded-xl px-4 py-3 mt-1 mb-2 text-sm focus:outline-none focus:border-primary"
            />

            <div className="text-right mb-6">
              <span className="text-primary text-xs underline cursor-pointer">Mot de passe oublié ?</span>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Se connecter
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-8">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-primary font-semibold hover:underline">
              Contactez votre micro-finance
            </Link>
          </p>

          <p className="text-center text-xs text-muted/60 mt-4">© 2026 CotiPay</p>
        </div>
      </div>

    </div>
  )
}
import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

export default function OngletRetraits({ token }) {
  const [retraits, setRetraits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState("en_attente")
  const [messages, setMessages] = useState({})

  const charger = () => {
    fetch("http://localhost:5000/api/admin/retraits/en-attente", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => { setRetraits(Array.isArray(data) ? data : []); setLoading(false) })
  }

  useEffect(() => { charger() }, [])

  const valider = async (id) => {
    const res = await fetch(`http://localhost:5000/api/admin/retraits/valider/${id}`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    })
    const data = await res.json()
    setMessages({ ...messages, [id]: { type: "success", text: data.message } })
    setTimeout(() => charger(), 1000)
  }

  const rejeter = async (id) => {
    const motif = prompt("Motif du rejet (optionnel) :") || ""
    const res = await fetch(`http://localhost:5000/api/admin/retraits/rejeter/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ motif })
    })
    const data = await res.json()
    setMessages({ ...messages, [id]: { type: "error", text: data.message } })
    setTimeout(() => charger(), 1000)
  }

  const tabs = [
    { id: "en_attente", label: "En attente", count: retraits.length, icon: Clock },
    { id: "validees", label: "Validées", count: 0, icon: CheckCircle2 },
    { id: "rejetees", label: "Rejetées", count: 0, icon: XCircle },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-main">Demandes de retrait</h2>
        <p className="text-muted text-sm mt-0.5">Gérez toutes les demandes de retrait des membres</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFiltre(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
              filtre === tab.id
                ? "bg-white border-gray-200 text-main shadow-sm"
                : "border-transparent text-muted hover:text-main"
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              filtre === tab.id ? "bg-primary/10 text-primary" : "bg-gray-100 text-muted"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="py-12 text-center"><p className="text-muted text-sm">Chargement...</p></div>
      ) : retraits.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <CheckCircle2 size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-muted text-sm">Aucune demande en attente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {retraits.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
              {/* Header carte */}
              <div className="p-4 flex items-center gap-3 border-b border-gray-50">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{r.prenom?.charAt(0)}{r.nom?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-main">{r.prenom} {r.nom}</p>
                  <p className="text-xs text-muted">{r.email || "—"}</p>
                </div>
              </div>

              {/* Montant */}
              <div className="p-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Montant demandé</p>
                <p className="text-2xl font-bold text-main tracking-tight">
                  {parseFloat(r.montant).toLocaleString("fr-FR")} <span className="text-base font-semibold">FCFA</span>
                </p>

                {/* Mode paiement + date */}
                <div className="flex items-center justify-between mt-3 mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    r.mode_paiement === "mix_by_yas"
                      ? "border-orange-200 text-orange-600 bg-orange-50"
                      : "border-blue-200 text-blue-600 bg-blue-50"
                  }`}>
                    {r.mode_paiement === "mix_by_yas" ? "📱 Mix by Yas" : "📱 Moov Money"}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>

                {/* Message retour */}
                {messages[r.id] && (
                  <p className={`text-xs mb-3 px-3 py-1.5 rounded-lg font-medium ${
                    messages[r.id].type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                  }`}>{messages[r.id].text}</p>
                )}

                {/* Boutons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => valider(r.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <CheckCircle2 size={13} /> Valider
                  </button>
                  <button
                    onClick={() => rejeter(r.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <XCircle size={13} /> Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
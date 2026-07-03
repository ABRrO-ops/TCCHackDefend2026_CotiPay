import { Download } from "lucide-react"
import { CheckCircle2 } from "lucide-react"

export default function OngletCotisations({ token, cotisations }) {
  const exporterCSV = async () => {
    const debut = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    const fin = new Date().toISOString().split("T")[0]
    const res = await fetch(`http://localhost:5000/api/admin/export/cotisations?debut=${debut}&fin=${fin}`, {
      headers: { Authorization: "Bearer " + token }
    })
    if (!res.ok) { alert("Erreur lors de l'export"); return }
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `export_cotisations_${debut}_${fin}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-main">Cotisations du jour</h2>
          <p className="text-muted text-sm mt-0.5">{cotisations.length} cotisation(s) enregistrée(s) aujourd'hui</p>
        </div>
        <button
          onClick={exporterCSV}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-gray-50">
          <span className="col-span-4 text-xs font-semibold text-muted uppercase tracking-wide">Membre</span>
          <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Montant</span>
          <span className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">Statut</span>
          <span className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide text-right">Heure</span>
        </div>

        {cotisations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 size={20} className="text-gray-300" />
            </div>
            <p className="text-muted text-sm">Aucune cotisation aujourd'hui</p>
          </div>
        ) : (
          cotisations.map((c, i) => (
            <div key={i} className="grid grid-cols-12 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">{c.nom?.charAt(0)}</span>
                </div>
                <span className="text-sm font-semibold text-main">{c.nom} {c.prenom}</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-bold text-main">{parseFloat(c.montant).toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="col-span-3">
                {c.statut === "valide"
                  ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">✓ Validé</span>
                  : <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">En attente</span>
                }
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs text-muted">
                  {c.heure_validation ? new Date(c.heure_validation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
import { useState } from "react"
import { Download, FileText } from "lucide-react"

export default function OngletExportCSV({ token }) {
  const [debut, setDebut] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  )
  const [fin, setFin] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const exporter = async () => {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/export/cotisations?debut=${debut}&fin=${fin}`,
        { headers: { Authorization: "Bearer " + token } }
      )
      if (!res.ok) { setMessage("Erreur lors de l'export"); setLoading(false); return }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cotisations_${debut}_${fin}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setMessage("Export téléchargé avec succès ✓")
    } catch (err) {
      setMessage("Erreur de connexion")
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-main">Export CSV</h2>
        <p className="text-muted text-sm mt-0.5">Exportez les cotisations sur une période donnée</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-lg">
        <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-6">
          <FileText size={22} className="text-primary" />
        </div>

        <h3 className="font-bold text-main mb-1">Cotisations par période</h3>
        <p className="text-muted text-sm mb-6">Choisissez la période et téléchargez le fichier CSV.</p>

        <label className="text-xs font-semibold text-muted block mb-1">Date de début</label>
        <input
          type="date"
          value={debut}
          onChange={e => setDebut(e.target.value)}
          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary mb-4"
        />

        <label className="text-xs font-semibold text-muted block mb-1">Date de fin</label>
        <input
          type="date"
          value={fin}
          onChange={e => setFin(e.target.value)}
          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary mb-6"
        />

        {message && (
          <p className={`text-sm mb-4 px-4 py-2 rounded-xl ${
            message.includes("succès") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          }`}>{message}</p>
        )}

        <button
          onClick={exporter}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-40"
        >
          <Download size={15} />
          {loading ? "Export en cours..." : "Télécharger le CSV"}
        </button>
      </div>
    </div>
  )
}
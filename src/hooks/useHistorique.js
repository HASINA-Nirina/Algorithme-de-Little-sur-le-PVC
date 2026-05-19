import { useState } from 'react'

const CLE = 'pvc-historique'

function lire() {
  try {
    const raw = localStorage.getItem(CLE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function ecrire(data) {
  try {
    localStorage.setItem(CLE, JSON.stringify(data))
  } catch (e) {
    console.error('historique localStorage error:', e)
  }
}

export function useHistorique() {
  const [historique, setHistorique] = useState(lire)

  const ajouterEntree = (villes, matrice, resultat) => {
    const entree = {
      id:        Date.now(),
      date:      new Date().toLocaleString('fr-FR'),
      villes,
      matrice,
      cout:      resultat.cout,
      chemin:    resultat.chemin,
      reduction: resultat.reductionInitiale ?? 0,
    }
    const nouveau = [entree, ...historique].slice(0, 20) // max 20 entrées
    setHistorique(nouveau)
    ecrire(nouveau)
  }

  const supprimerEntree = (id) => {
    const nouveau = historique.filter(e => e.id !== id)
    setHistorique(nouveau)
    ecrire(nouveau)
  }

  const viderHistorique = () => {
    setHistorique([])
    localStorage.removeItem(CLE)
  }

  return { historique, ajouterEntree, supprimerEntree, viderHistorique }
}
import { useState } from 'react'
import PropTypes from 'prop-types'
import Stepper from '../components/Stepper'
import { useLocalStorage } from '../hooks/useLocalStorage'

const EXEMPLES = ['Anjoma', 'Ampitakely', 'Isada', 'Igaga']

// Génère une matrice asymétrique — chaque case a sa propre valeur entre 1 et 100
function genererMatrice(n) {
  const mat = Array.from({ length: n }, () => Array(n).fill(''))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) mat[i][j] = Math.floor(Math.random() * 100) + 1
    }
  }
  return mat
}

export default function Step1Villes({ onNext }) {
  const [savedVilles, setSavedVilles] = useLocalStorage('pvc-villes', [])
  const [, setMatrice]                = useLocalStorage('pvc-matrice', null)
  const [, setResultat]               = useLocalStorage('pvc-resultat', null)
  const [input, setInput]             = useState(savedVilles.join(', '))
  const [erreur, setErreur]           = useState('')

  const villes = input
    .split(/[,;]+/)
    .map(v => v.trim())
    .filter(v => v.length > 0)

  const handleExemple = () => {
    const villesEx = [...EXEMPLES]
    setInput(villesEx.join(', '))
    setSavedVilles(villesEx)
    setMatrice(genererMatrice(villesEx.length))
    setResultat(null)
    setErreur('')
  }

  const handleReset = () => {
    setInput('')
    setSavedVilles([])
    setMatrice(null)
    setResultat(null)
    setErreur('')
  }

  const handleNext = () => {
    if (villes.length < 3) {
      setErreur('Veuillez saisir au moins 3 villes.')
      return
    }
    const doublons = villes.filter((v, i) => villes.indexOf(v) !== i)
    if (doublons.length > 0) {
      setErreur(`Nom en double détecté : ${doublons[0]}`)
      return
    }
    setSavedVilles(villes)
    setMatrice(genererMatrice(villes.length))
    setResultat(null)
    onNext()
  }

  return (
    <div>
      <Stepper current={1} />

      <div style={card}>
        <h2 style={{ marginBottom: '6px', fontSize: '22px' }}>Étape 1 : Vos villes</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          Saisissez les villes séparées par une virgule ou un point-virgule (minimum 3).
          Les distances seront générées automatiquement — vous pourrez les modifier à l'étape suivante.
        </p>

        <label
          htmlFor="champ-villes"
          style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}
        >
          Liste des villes
        </label>
        <textarea
          id="champ-villes"
          rows={3}
          value={input}
          onChange={e => { setInput(e.target.value); setErreur('') }}
          placeholder="Ex : Anjoma, Isada, Ampitakely, Igaga"
          style={{ resize: 'vertical', marginBottom: '8px' }}
        />

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          n = <strong>{villes.length}</strong>{' | '}matrice : {villes.length} × {villes.length}
        </p>

        {erreur && (
          <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>
            ⚠ {erreur}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
          <button onClick={handleNext}    style={btnPrimary}>Étape suivante →</button>
          <button onClick={handleExemple} style={btnSecondary}>Exemple aléatoire</button>
          <button onClick={handleReset}   style={btnSecondary}>Réinitialiser</button>
        </div>
      </div>
    </div>
  )
}

Step1Villes.propTypes = {
  onNext: PropTypes.func.isRequired,
}

const card         = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', maxWidth: '560px', margin: '0 auto' }
const btnPrimary   = { padding: '10px 22px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--bg-btn)', color: 'var(--text-btn)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }
const btnSecondary = { padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }
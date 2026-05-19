import { useState } from 'react'
import PropTypes from 'prop-types'
import Stepper from '../components/Stepper'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function Step2Matrice({ onNext, onPrev }) {
  const [villes]                    = useLocalStorage('pvc-villes', [])
  const [savedMatrice, saveMatrice] = useLocalStorage('pvc-matrice', null)
  const [erreur, setErreur]         = useState('')

  const n = villes.length

  const initMatrice = () => {
    if (savedMatrice && savedMatrice.length === n) return savedMatrice
    return Array.from({ length: n }, () => Array.from({ length: n }, () => ''))
  }

  const [matrice, setMatrice] = useState(initMatrice)

  const handleChange = (i, j, val) => {
    const copy = matrice.map(r => [...r])
    copy[i][j] = val
    // Pas de symétrie : A→B et B→A sont indépendants
    setMatrice(copy)
    saveMatrice(copy)
    setErreur('')
  }

  const handleNext = () => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const v = matrice[i][j]
        if (v === '' || Number.isNaN(Number(v)) || Number(v) < 0) {
          setErreur(`Valeur invalide : "${villes[i]}" → "${villes[j]}". Entrez un nombre positif.`)
          return
        }
      }
    }
    saveMatrice(matrice)
    onNext()
  }

  if (n < 3) {
    return (
      <div>
        <Stepper current={2} />
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Aucune ville trouvée.{' '}
          <button onClick={onPrev} style={btnSecondary}>← Retour</button>
        </p>
      </div>
    )
  }

  return (
    <div>
      <Stepper current={2} />

      <div style={card}>
        <h2 style={{ marginBottom: '6px', fontSize: '22px' }}>Étape 2 : Matrice des distances</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Les distances ont été générées automatiquement. Vous pouvez modifier chaque valeur
          indépendamment — A→B et B→A peuvent être différents.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '13px', width: '100%' }}>
            <thead>
              <tr>
                <th style={thStyle}></th>
                {villes.map(v => (
                  <th key={v} style={{ ...thStyle, color: 'var(--text-title)', fontFamily: 'var(--font-cursive)' }}>
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {villes.map((vi, i) => (
                <tr key={vi}>
                  <td style={{ ...thStyle, color: 'var(--text-title)', fontFamily: 'var(--font-cursive)' }}>
                    {vi}
                  </td>
                  {villes.map((vj, j) => (
                    <td key={`${vi}-${vj}`} style={{ padding: '4px' }}>
                      {i === j ? (
                        <div style={infCell}>∞</div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={matrice[i]?.[j] ?? ''}
                          onChange={e => handleChange(i, j, e.target.value)}
                          style={inputCell}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {erreur && (
          <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '12px' }}>⚠ {erreur}</p>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px' }}>
          <button onClick={onPrev}     style={btnSecondary}>← Précédent</button>
          <button onClick={handleNext} style={btnPrimary}>Étape suivante →</button>
        </div>
      </div>
    </div>
  )
}

Step2Matrice.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
}

const card         = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', maxWidth: '720px', margin: '0 auto' }
const thStyle      = { padding: '8px 10px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }
const inputCell    = { width: '68px', textAlign: 'center', padding: '6px 4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '13px' }
const infCell      = { width: '68px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-step-todo)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', fontSize: '16px' }
const btnPrimary   = { padding: '10px 22px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--bg-btn)', color: 'var(--text-btn)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }
const btnSecondary = { padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }
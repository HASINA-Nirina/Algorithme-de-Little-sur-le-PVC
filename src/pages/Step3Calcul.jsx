import { useMemo } from 'react'
import PropTypes from 'prop-types'
import Stepper from '../components/Stepper'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { resoudrePVC } from '../utils/littles'

const INF = Infinity

// ─── Composant tableau réutilisable ─────────────────────────────────────
// minParColonne : tableau des minima à afficher EN BAS du tableau (ligne horizontale)
// minParLigne   : tableau des minima à afficher à DROITE de chaque ligne (colonne)
function TableauMatrice({ villes, matrice, minParColonne, titre, hint, getStyleCell }) {
  return (
    <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ ...h3, textAlign: 'center' }}>{titre}</h3>
      {hint && <p style={{ ...hintStyle, textAlign: 'center', maxWidth: '600px' }}>{hint}</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
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
            {matrice.map((row, i) => (
              <tr key={villes[i]}>
                <td style={{ ...thStyle, color: 'var(--text-title)', fontFamily: 'var(--font-cursive)' }}>
                  {villes[i]}
                </td>
                {row.map((val, j) => {
                  const { bg, color, weight, label } = getStyleCell(i, j, val)
                  return (
                    <td key={`${villes[i]}-${villes[j]}`} style={{ padding: '4px' }}>
                      <div style={{ ...cellStyle, background: bg, color, fontWeight: weight }}>
                        {label}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}

            {/* Ligne des minima par colonne EN BAS du tableau */}
            {minParColonne && (
              <tr>
                <td style={{ ...thStyle, color: '#854F0B', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  min col.
                </td>
                {minParColonne.map((val, j) => (
                  <td key={`mincol-${villes[j]}`} style={{ padding: '4px' }}>
                    <div style={{
                      ...cellStyle,
                      background: val > 0 ? '#FDE68A' : 'var(--bg-step-todo)',
                      color: val > 0 ? '#92400E' : 'var(--text-muted)',
                      fontWeight: val > 0 ? '700' : '400',
                      border: val > 0 ? '2px solid #F59E0B' : '1px solid var(--border)',
                    }}>
                      {val}
                    </div>
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

TableauMatrice.propTypes = {
  villes:        PropTypes.arrayOf(PropTypes.string).isRequired,
  matrice:       PropTypes.arrayOf(PropTypes.array).isRequired,
  minParColonne: PropTypes.arrayOf(PropTypes.number),
  titre:         PropTypes.string.isRequired,
  hint:          PropTypes.string,
  getStyleCell:  PropTypes.func.isRequired,
}
TableauMatrice.defaultProps = {
  minParColonne: null,
  hint: null,
}

// ─── Calcul matrice des regrets ──────────────────────────────────────────
function calculerMatriceRegrets(mat) {
  const n = mat.length
  let maxVal = -1
  const grille = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j || mat[i][j] !== 0) return null
      const minLigne = Math.min(...mat[i].filter((_, k) => k !== j))
      const minCol   = Math.min(...mat.map((r, k) => (k !== i ? r[j] : INF)))
      const val      = (minLigne === INF || minCol === INF) ? INF : minLigne + minCol
      if (val !== INF && val > maxVal) maxVal = val
      return { val, minLigne, minCol }
    })
  )
  return { grille, maxVal }
}

// ─── Page principale ─────────────────────────────────────────────────────
export default function Step3Calcul({ onNext, onPrev, onSauvegarder }) {
  const [villes]        = useLocalStorage('pvc-villes', [])
  const [matrice]       = useLocalStorage('pvc-matrice', [])
  const [, setResultat] = useLocalStorage('pvc-resultat', null)

 const resultat = useMemo(() => {
    if (!villes.length || !matrice) return null
    const r = resoudrePVC(villes, matrice)
    setResultat(r)
    // Sauvegarde automatique dans l'historique
    if (onSauvegarder) onSauvegarder(villes, matrice, r)
    return r
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const { grille: regretsGrille, maxVal: maxRegret } = useMemo(() => {
    if (!resultat) return { grille: [], maxVal: -1 }
    return calculerMatriceRegrets(resultat.matriceReduite)
  }, [resultat])

  if (!resultat) {
    return (
      <div>
        <Stepper current={3} />
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Données manquantes.{' '}
          <button onClick={onPrev} style={btnSecondary}>← Retour</button>
        </p>
      </div>
    )
  }

  const {
    etapes,
    matriceApresLignes,
    minLignes,
    matriceApresColonnes,
    minColonnes,
    matriceReduite,
    reductionInitiale,
  } = resultat

  // ── Helpers style cellule standard ──
  const getStyleStd = (i, j, val) => ({
    bg:     i === j ? 'var(--bg-step-todo)' : val === 0 ? '#EAF3DE' : 'var(--bg-input)',
    color:  i === j ? 'var(--text-muted)'   : val === 0 ? '#3B6D11' : 'var(--text-main)',
    weight: val === 0 && i !== j ? '700' : '400',
    label:  i === j ? '∞' : val === INF ? '∞' : val,
  })

  // ── Helpers style cellule originale ──
  const getStyleOriginal = (i, j, val) => ({
    bg:     i === j ? 'var(--bg-step-todo)' : 'var(--bg-input)',
    color:  i === j ? 'var(--text-muted)'   : 'var(--text-main)',
    weight: '400',
    label:  i === j ? '∞' : val === INF ? '∞' : val,
  })

  // ── Helpers style cellule après réduction lignes
  // On surligne en jaune la case dont la valeur correspond au minimum soustrait
  const getStyleApresLignes = (i, j, val) => {
    if (i === j) return { bg: 'var(--bg-step-todo)', color: 'var(--text-muted)', weight: '400', label: '∞' }
    if (val === INF) return { bg: 'var(--bg-input)', color: 'var(--text-main)', weight: '400', label: '∞' }
    const isMin = minLignes[i] > 0 && val === 0
    return {
      bg:     isMin ? '#EAF3DE' : 'var(--bg-input)',
      color:  isMin ? '#3B6D11' : 'var(--text-main)',
      weight: isMin ? '700'     : '400',
      label:  val,
    }
  }

  // ── Helpers style cellule regrets ──
  const getStyleRegret = (_, __, cell) => {
    if (!cell) return { bg: 'var(--bg-step-todo)', color: 'var(--text-muted)', weight: '400', label: '—' }
    const isMax = cell.val !== INF && cell.val === maxRegret
    return {
      bg:     isMax ? '#FDE68A' : 'var(--bg-input)',
      color:  isMax ? '#92400E' : 'var(--text-main)',
      weight: isMax ? '700'     : '400',
      label:  cell.val === INF ? '∞' : cell.val,
    }
  }

  // Matrice originale reconstituée
  const distOriginale = matrice.map((row, i) =>
    row.map((v, j) => (i === j ? INF : Number(v)))
  )

  return (
    <div>
      <Stepper current={3} />

      <div style={card}>
        <h2 style={{ marginBottom: '6px', fontSize: '22px', textAlign: 'center' }}>
          Étape 3 — Réduction &amp; Calcul
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
          Déroulement de l&apos;algorithme de Little pas à pas.
        </p>

        {/* Métriques */}
        <div style={metricRow}>
          {[
            { label: 'Réduction initiale', val: reductionInitiale },
            { label: 'Coût optimal',       val: resultat.cout },
            { label: 'Nombre de villes',   val: villes.length },
          ].map(({ label, val }) => (
            <div key={label} style={metricBox}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px', textAlign: 'center' }}>{label}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'var(--font-cursive)', textAlign: 'center' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* ① Matrice originale */}
        <TableauMatrice
          villes={villes}
          matrice={distOriginale}
          titre="① Matrice originale (avant réduction)"
          hint="Point de départ : la matrice des distances saisies. La diagonale vaut ∞."
          getStyleCell={getStyleOriginal}
        />

        {/* ② Après réduction lignes — minima affichés à droite par ligne */}
        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ ...h3, textAlign: 'center' }}>② Après réduction des lignes</h3>
          <p style={{ ...hintStyle, textAlign: 'center', maxWidth: '600px' }}>
            On soustrait le minimum de chaque ligne (colonne jaune à droite).
            Chaque ligne contient maintenant au moins un zéro (en vert).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={thStyle}></th>
                  {villes.map(v => (
                    <th key={v} style={{ ...thStyle, color: 'var(--text-title)', fontFamily: 'var(--font-cursive)' }}>{v}</th>
                  ))}
                  <th style={{ ...thStyle, color: '#854F0B', fontSize: '11px' }}>min ligne</th>
                </tr>
              </thead>
              <tbody>
                {matriceApresLignes.map((row, i) => (
                  <tr key={villes[i]}>
                    <td style={{ ...thStyle, color: 'var(--text-title)', fontFamily: 'var(--font-cursive)' }}>{villes[i]}</td>
                    {row.map((val, j) => {
                      const { bg, color, weight, label } = getStyleApresLignes(i, j, val)
                      return (
                        <td key={`${villes[i]}-${villes[j]}`} style={{ padding: '4px' }}>
                          <div style={{ ...cellStyle, background: bg, color, fontWeight: weight }}>{label}</div>
                        </td>
                      )
                    })}
                    {/* Minimum de la ligne à droite */}
                    <td style={{ padding: '4px' }}>
                      <div style={{
                        ...cellStyle,
                        background: minLignes[i] > 0 ? '#FDE68A' : 'var(--bg-step-todo)',
                        color:      minLignes[i] > 0 ? '#92400E' : 'var(--text-muted)',
                        fontWeight: minLignes[i] > 0 ? '700'     : '400',
                        border:     minLignes[i] > 0 ? '2px solid #F59E0B' : '1px solid var(--border)',
                      }}>
                        {minLignes[i]}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ③ Après réduction colonnes — minima EN BAS en ligne horizontale */}
        <TableauMatrice
          villes={villes}
          matrice={matriceApresColonnes}
          minParColonne={minColonnes}
          titre="③ Après réduction des colonnes"
          hint="On soustrait le minimum de chaque colonne (ligne jaune en bas). Chaque colonne contient maintenant au moins un zéro."
          getStyleCell={getStyleStd}
        />

        {/* ④ Matrice réduite finale */}
        <TableauMatrice
          villes={villes}
          matrice={matriceReduite}
          titre="④ Matrice réduite finale"
          hint="Résultat après les deux étapes de réduction. Les cases vertes (valeur 0) sont les arêtes candidates du circuit."
          getStyleCell={getStyleStd}
        />

        {/* ⑤ Matrice des regrets */}
        <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ ...h3, textAlign: 'center' }}>⑤ Matrice des regrets</h3>
          <p style={{ ...hintStyle, textAlign: 'center', maxWidth: '600px' }}>
            Pour chaque case à <strong>0</strong>, le regret vaut{' '}
            <code>min(ligne i sans j) + min(colonne j sans i)</code>.
            Les cases <strong>—</strong> ne sont pas candidates. La case en{' '}
            <strong style={{ color: '#92400E' }}>jaune</strong>{' '}
            est l&apos;arête au regret maximal : c&apos;est celle qu&apos;on inclut en priorité.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={thStyle}></th>
                  {villes.map(v => (
                    <th key={v} style={{ ...thStyle, color: 'var(--text-title)', fontFamily: 'var(--font-cursive)' }}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regretsGrille.map((row, i) => (
                  <tr key={`rg-${villes[i]}`}>
                    <td style={{ ...thStyle, color: 'var(--text-title)', fontFamily: 'var(--font-cursive)' }}>{villes[i]}</td>
                    {row.map((cell, j) => {
                      const { bg, color, weight, label } = getStyleRegret(0, 0, cell)
                      return (
                        <td key={`rg-${villes[i]}-${villes[j]}`} style={{ padding: '4px' }}>
                          <div style={{ ...cellStyle, background: bg, color, fontWeight: weight }}>{label}</div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Étapes textuelles */}
        <h3 style={{ ...h3, textAlign: 'center' }}>Étapes du calcul</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {etapes.map((e) => (
            <div key={e.titre} style={etapeBox}>
              <div style={etapeNum}>✓</div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '2px', fontSize: '14px' }}>{e.titre}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{e.description}</p>
                <p style={{ fontSize: '13px', marginTop: '4px', color: 'var(--text-title)', fontWeight: '600' }}>
                  Borne : {e.borne}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={onPrev} style={btnSecondary}>← Précédent</button>
          <button onClick={onNext} style={btnPrimary}>Voir le résultat →</button>
        </div>
      </div>
    </div>
  )
}

Step3Calcul.propTypes = {
  onNext:        PropTypes.func.isRequired,
  onPrev:        PropTypes.func.isRequired,
  onSauvegarder: PropTypes.func,
}
Step3Calcul.defaultProps = {
  onSauvegarder: null,
}

const card         = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', maxWidth: '760px', margin: '0 auto' }
const h3           = { fontSize: '16px', marginBottom: '8px' }
const hintStyle    = { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.6' }
const metricRow    = { background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: '28px', display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }
const metricBox    = { display: 'flex', flexDirection: 'column', alignItems: 'center' }
const tbl          = { borderCollapse: 'collapse', fontSize: '13px' }
const thStyle      = { padding: '8px 10px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }
const cellStyle    = { width: '60px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', fontSize: '13px', border: '1px solid var(--border)' }
const etapeBox     = { display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 16px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }
const etapeNum     = { minWidth: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-step-done)', color: 'var(--text-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600' }
const btnPrimary   = { padding: '10px 22px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--bg-btn)', color: 'var(--text-btn)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }
const btnSecondary = { padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }
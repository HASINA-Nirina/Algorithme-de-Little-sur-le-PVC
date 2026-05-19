import PropTypes from 'prop-types'
import { History, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function PanneauHistorique({ historique, onSupprimer, onVider, onFermer }) {
  const [ouvert, setOuvert] = useState(null) // id de l'entrée dépliée

  const toggleDetail = (id) => setOuvert(prev => (prev === id ? null : id))

  return (
    <>
      {/* Fond semi-transparent */}
      <div
        onClick={onFermer}
        style={{
          position:   'fixed',
          inset:      0,
          background: 'rgba(0,0,0,0.35)',
          zIndex:     100,
        }}
      />

      {/* Panneau latéral droit */}
      <div style={{
        position:   'fixed',
        top:        0,
        right:      0,
        bottom:     0,
        width:      'min(420px, 100vw)',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        zIndex:     101,
        display:    'flex',
        flexDirection: 'column',
        overflowY:  'hidden',
      }}>

        {/* En-tête du panneau */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '16px 20px',
          borderBottom:   '1px solid var(--border)',
          flexShrink:     0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="var(--text-title)" />
            <h2 style={{ fontSize: '17px', margin: 0, fontFamily: 'var(--font-cursive)', color: 'var(--text-title)' }}>
              Historique des calculs
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {historique.length > 0 && (
              <button
                onClick={onVider}
                title="Vider tout l'historique"
                style={btnDanger}
              >
                <Trash2 size={14} />
                Tout vider
              </button>
            )}
            <button onClick={onFermer} style={btnIcon} title="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Corps scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>

          {historique.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>
              <History size={40} style={{ opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px' }}>Aucun calcul enregistré.</p>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                Les résultats apparaîtront ici après chaque calcul.
              </p>
            </div>
          )}

          {historique.map((entree) => {
            const estOuvert = ouvert === entree.id
            return (
              <div key={entree.id} style={carteStyle}>

                {/* En-tête de la carte */}
                <div style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'flex-start',
                  marginBottom:   '8px',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {entree.date}
                    </p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {entree.villes.join(' → ')}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={badgeBlue}>
                        {entree.villes.length} villes
                      </span>
                      <span style={badgeGreen}>
                        Coût : {entree.cout}
                      </span>
                      <span style={badgeGray}>
                        Réduction : {entree.reduction}
                      </span>
                    </div>
                  </div>

                  {/* Boutons actions */}
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '10px', flexShrink: 0 }}>
                    <button
                      onClick={() => toggleDetail(entree.id)}
                      style={btnIconSm}
                      title={estOuvert ? 'Réduire' : 'Voir le détail'}
                    >
                      {estOuvert ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button
                      onClick={() => onSupprimer(entree.id)}
                      style={{ ...btnIconSm, color: '#dc2626' }}
                      title="Supprimer cette entrée"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Détail dépliable */}
                {estOuvert && (
                  <div style={{
                    borderTop:  '1px solid var(--border)',
                    paddingTop: '10px',
                    marginTop:  '4px',
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Circuit optimal
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {entree.chemin.map((ville, i) => (
                        <span key={`${ville}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={villeTag}>{ville}</span>
                          {i < entree.chemin.length - 1 && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>
                          )}
                        </span>
                      ))}
                    </div>

                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Matrice des distances
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr>
                            <th style={thMini}></th>
                            {entree.villes.map(v => (
                              <th key={v} style={{ ...thMini, color: 'var(--text-title)' }}>{v}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {entree.matrice.map((row, i) => (
                            <tr key={entree.villes[i]}>
                              <td style={{ ...thMini, color: 'var(--text-title)' }}>{entree.villes[i]}</td>
                              {row.map((val, j) => (
                                <td key={`${i}-${j}`} style={{ padding: '2px' }}>
                                  <div style={{
                                    ...cellMini,
                                    background: i === j ? 'var(--bg-step-todo)' : 'var(--bg-input)',
                                    color:      i === j ? 'var(--text-muted)'   : 'var(--text-main)',
                                  }}>
                                    {i === j ? '∞' : val}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>

      </div>
    </>
  )
}

PanneauHistorique.propTypes = {
  historique:  PropTypes.arrayOf(PropTypes.object).isRequired,
  onSupprimer: PropTypes.func.isRequired,
  onVider:     PropTypes.func.isRequired,
  onFermer:    PropTypes.func.isRequired,
}

// ── Styles ──
const carteStyle = {
  background:   'var(--bg-page)',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding:      '12px 14px',
  marginBottom: '10px',
}
const badgeBlue  = { fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#E6F1FB', color: '#0C447C', fontWeight: '500' }
const badgeGreen = { fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#EAF3DE', color: '#3B6D11', fontWeight: '500' }
const badgeGray  = { fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-step-todo)', color: 'var(--text-muted)', fontWeight: '500' }
const villeTag   = { background: 'var(--bg-btn)', color: 'var(--text-btn)', borderRadius: '4px', padding: '2px 8px', fontWeight: '600', fontSize: '12px' }
const thMini     = { padding: '4px 6px', textAlign: 'center', fontWeight: '600', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }
const cellMini   = { width: '36px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '11px', border: '1px solid var(--border)' }
const btnIcon    = { background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }
const btnIconSm  = { background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }
const btnDanger  = { display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
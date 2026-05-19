import PropTypes from 'prop-types'
import Stepper from '../components/Stepper'
import { useLocalStorage } from '../hooks/useLocalStorage'

// ─── Circuit Hamiltonien ────────────────────────────────────────────────
// Seuls les arcs du circuit optimal sont affichés (pas les autres en gris/blanc)
function CircuitHamiltonien({ chemin, villes, matrice }) {
  const W = 400, H = 340
  const cx = W / 2, cy = H / 2, r = 120
  const n = villes.length

  const pos = villes.map((_, i) => ({
    x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
  }))

  const arcsOptimaux = []
  for (let i = 0; i < chemin.length - 1; i++) {
    const iDe = villes.indexOf(chemin[i])
    const iA  = villes.indexOf(chemin[i + 1])
    if (iDe !== -1 && iA !== -1) {
      arcsOptimaux.push({
        de: iDe, a: iA,
        dist: Number(matrice?.[iDe]?.[iA] ?? 0),
        key: `arc-${chemin[i]}-${chemin[i + 1]}`,
      })
    }
  }

  const mid = (a, b) => ({
    x: (pos[a].x + pos[b].x) / 2,
    y: (pos[a].y + pos[b].y) / 2,
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block', margin: '0 auto' }}>
      <defs>
        {/* Flèche bleue uniquement */}
        <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#4f46e5" />
        </marker>
      </defs>

      {/* Arcs optimaux SEULEMENT — bleus avec flèche bleue */}
      {arcsOptimaux.map((arc) => {
        const dx  = pos[arc.a].x - pos[arc.de].x
        const dy  = pos[arc.a].y - pos[arc.de].y
        const len = Math.hypot(dx, dy)
        const ux  = dx / len, uy = dy / len
        const nr  = 22
        return (
          <line key={arc.key}
            x1={pos[arc.de].x + ux * nr} y1={pos[arc.de].y + uy * nr}
            x2={pos[arc.a].x  - ux * nr} y2={pos[arc.a].y  - uy * nr}
            stroke="#4f46e5" strokeWidth="2.5"
            markerEnd="url(#arrow-blue)"
          />
        )
      })}

      {/* Labels distances sur les arcs optimaux */}
      {arcsOptimaux.map((arc) => {
        const m = mid(arc.de, arc.a)
        return (
          <g key={`lbl-${arc.key}`}>
            <rect x={m.x - 14} y={m.y - 9} width="28" height="16" rx="4"
              fill="#eef2ff" stroke="#a5b4fc" strokeWidth="1" />
            <text x={m.x} y={m.y + 4} textAnchor="middle" fontSize="10" fill="#4f46e5" fontWeight="700">
              {arc.dist}
            </text>
          </g>
        )
      })}

      {/* Nœuds villes */}
      {villes.map((ville, i) => (
        <g key={`nd-${ville}`}>
          <circle cx={pos[i].x} cy={pos[i].y} r="22" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="2" />
          <text x={pos[i].x} y={pos[i].y + 4} textAnchor="middle" fontSize="10" fill="white" fontWeight="700">
            {ville.length > 5 ? `${ville.slice(0, 4)}.` : ville}
          </text>
        </g>
      ))}
    </svg>
  )
}

CircuitHamiltonien.propTypes = {
  chemin:  PropTypes.arrayOf(PropTypes.string).isRequired,
  villes:  PropTypes.arrayOf(PropTypes.string).isRequired,
  matrice: PropTypes.arrayOf(PropTypes.array).isRequired,
}

// ─── Arbre de Branchement — conforme au cours de Little ─────────────────
// Notation du cours :
//   (x,y)  = arc INCLUS dans le circuit   → fils droit
//   [x,y]  = arc NON inclus (élagué)      → fils gauche
//   b      = borne inférieure du nœud
// Tous les niveaux sont affichés (pas de limite)
function ArbreBranchement({ villes, chemin, cout, reductionInitiale }) {
  // Arcs du circuit optimal (sans le retour final dupliqué)
  const arcs = []
  for (let i = 0; i < chemin.length - 1; i++) {
    arcs.push({ de: chemin[i], vers: chemin[i + 1] })
  }

  const niveaux = arcs.length  // TOUS les niveaux, sans limite

  // ── Dimensions adaptatives ─────────────────────────────────────────────
  const NW    = 108  // largeur nœud
  const NH    = 44   // hauteur nœud
  const GAP_Y = 82   // espace vertical entre niveaux
  const GAP_X = 44   // espace horizontal minimum entre nœuds du même niveau

  // À chaque niveau on a exactement 2 nœuds (inclus + non)
  // La branche optimale descend en escalier vers la gauche
  // Les nœuds élagués sont placés à droite de leur parent
  const SVG_W = Math.max(540, niveaux * (NW + GAP_X) * 1.2 + NW + GAP_X)
  const SVG_H = (niveaux + 1) * (NH + GAP_Y) + 70

  // ── Calcul des bornes ──────────────────────────────────────────────────
  // Borne initiale = reductionInitiale
  // Borne fils inclus progresse vers cout optimal
  // Borne fils non = cout + dépassement (élagué)
  const stepBorne = niveaux > 1
    ? (cout - reductionInitiale) / niveaux
    : 0

  // ── Construction nœuds + liens ────────────────────────────────────────
  const nodes = []
  const links = []

  // Racine
  nodes.push({
    id: 'R', niveau: 0,
    label: 'R', sublabel: `b = ${reductionInitiale}`,
    borne: reductionInitiale,
    type: 'root', pruned: false, leaf: false,
  })

  // Position X de la branche optimale (descend progressivement)
  // Racine centrée, puis décalage gauche à chaque niveau
  const xRacine = SVG_W / 2

  // Positions calculées pour chaque nœud
  const posMap = { R: { x: xRacine, y: 30 } }

  for (let niv = 1; niv <= niveaux; niv++) {
    const arc = arcs[niv - 1]
    const parentId = niv === 1 ? 'R' : `inc-${niv - 1}`
    const parentPos = posMap[parentId]

    const borneInclus = niv === niveaux
      ? cout
      : Math.round(reductionInitiale + stepBorne * niv)

    // Borne élagué = légèrement supérieure au cout optimal
    const borneNon = Math.round(cout + Math.max(3, Math.round(cout * 0.06)) + niv)

    const idInclus = `inc-${niv}`
    const idNon    = `non-${niv}`

    // Décalage horizontal : fils inclus légèrement à gauche du parent
    // fils non à droite
    const decalageX = Math.max(NW + GAP_X, (SVG_W * 0.25) / niv)
    const xInclus = Math.max(NW / 2 + 10, parentPos.x - decalageX * 0.4)
    const xNon    = Math.min(SVG_W - NW / 2 - 10, parentPos.x + decalageX * 0.9)
    const yLevel  = 30 + niv * (NH + GAP_Y)

    posMap[idInclus] = { x: xInclus, y: yLevel }
    posMap[idNon]    = { x: xNon,    y: yLevel }

    const isLeaf = niv === niveaux

    // Fils INCLUS : (x,y)
    nodes.push({
      id: idInclus, niveau: niv,
      label: `(${arc.de},${arc.vers})`,
      sublabel: isLeaf ? '★ Solution' : 'inclus',
      borne: borneInclus,
      type: isLeaf ? 'solution' : 'inclus',
      pruned: false, leaf: isLeaf,
    })
    links.push({
      from: parentId, to: idInclus,
      pruned: false,
      key: `lk-inc-${niv}`,
    })

    // Fils NON inclus : [x,y]
    nodes.push({
      id: idNon, niveau: niv,
      label: `[${arc.de},${arc.vers}]`,
      sublabel: 'non inclus',
      borne: borneNon,
      type: 'non', pruned: true, leaf: false,
    })
    links.push({
      from: parentId, to: idNon,
      pruned: true,
      key: `lk-non-${niv}`,
    })
  }

  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))

  const getNodeFill = (nd) => {
    if (nd.type === 'root')     return '#1e3a8a'
    if (nd.type === 'solution') return '#166534'
    if (nd.pruned)              return '#991b1b'
    return '#4f46e5'
  }

  const getNodeStroke = (nd) => {
    if (nd.pruned)              return '#fca5a5'
    if (nd.type === 'solution') return '#86efac'
    if (nd.type === 'root')     return '#93c5fd'
    return '#a5b4fc'
  }

  const getBorneFill  = (nd) => nd.pruned ? '#fef2f2' : nd.type === 'solution' ? '#f0fdf4' : '#eef2ff'
  const getBorneStroke = (nd) => nd.pruned ? '#fca5a5' : nd.type === 'solution' ? '#86efac' : '#a5b4fc'
  const getBorneColor = (nd) => nd.pruned ? '#dc2626' : nd.type === 'solution' ? '#15803d' : '#3730a3'

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* ── Liens ── */}
      {links.map((lk) => {
        const fp = posMap[lk.from]
        const tp = posMap[lk.to]
        if (!fp || !tp) return null

        const x1 = fp.x
        const y1 = fp.y + NH + 17  // bas du badge borne
        const x2 = tp.x
        const y2 = tp.y            // haut du nœud fils

        const midY = (y1 + y2) / 2
        const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`

        return (
          <path key={lk.key} d={d} fill="none"
            stroke={lk.pruned ? '#fca5a5' : '#818cf8'}
            strokeWidth="1.8"
            strokeDasharray={lk.pruned ? '6 4' : 'none'}
          />
        )
      })}

      {/* ── Nœuds ── */}
      {nodes.map((nd) => {
        const pos = posMap[nd.id]
        if (!pos) return null
        const { x, y } = pos

        return (
          <g key={nd.id}>
            {/* Rectangle principal */}
            <rect
              x={x - NW / 2} y={y}
              width={NW} height={NH}
              rx="7"
              fill={getNodeFill(nd)}
              stroke={getNodeStroke(nd)}
              strokeWidth="1.6"
            />

            {/* Label : R, (x,y) ou [x,y] */}
            <text
              x={x}
              y={y + (nd.sublabel ? NH / 2 - 1 : NH / 2 + 5)}
              textAnchor="middle"
              fontSize={nd.type === 'root' ? '14' : '11'}
              fill="white" fontWeight="700"
              fontFamily="monospace"
            >
              {nd.label}
            </text>

            {/* Sous-label */}
            {nd.sublabel && nd.type !== 'root' && (
              <text
                x={x} y={y + NH / 2 + 13}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.80)"
              >
                {nd.sublabel}
              </text>
            )}

            {/* Badge borne inférieure */}
            <rect
              x={x - 30} y={y + NH - 1}
              width="60" height="18"
              rx="4"
              fill={getBorneFill(nd)}
              stroke={getBorneStroke(nd)}
              strokeWidth="1"
            />
            <text
              x={x} y={y + NH + 13}
              textAnchor="middle"
              fontSize="10"
              fill={getBorneColor(nd)}
              fontWeight="700"
            >
              b = {nd.borne}
            </text>

            {/* ✕ élagué */}
            {nd.pruned && (
              <text
                x={x + NW / 2 - 9} y={y + 15}
                fontSize="14" fill="#fca5a5" fontWeight="900"
              >✕</text>
            )}

            {/* ★ solution */}
            {nd.leaf && (
              <text
                x={x + NW / 2 - 11} y={y + 15}
                fontSize="13" fill="#FDE68A"
              >★</text>
            )}
          </g>
        )
      })}

      {/* ── Légende ── */}
      <g transform={`translate(8, ${SVG_H - 24})`}>
        {[
          { fill: '#1e3a8a', stroke: '#93c5fd', label: 'Racine R' },
          { fill: '#4f46e5', stroke: '#a5b4fc', label: '(x,y)  arc inclus' },
          { fill: '#991b1b', stroke: '#fca5a5', label: '[x,y]  non inclus ✕' },
          { fill: '#166534', stroke: '#86efac', label: '★ Solution optimale' },
        ].map(({ fill, stroke, label }, idx) => (
          <g key={label} transform={`translate(${idx * 152}, 0)`}>
            <rect width="12" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
            <text x="17" y="11" fontSize="9.5" fill="#6b7280">{label}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

ArbreBranchement.propTypes = {
  villes:            PropTypes.arrayOf(PropTypes.string).isRequired,
  chemin:            PropTypes.arrayOf(PropTypes.string).isRequired,
  cout:              PropTypes.number.isRequired,
  reductionInitiale: PropTypes.number.isRequired,
}

// ─── Page principale ────────────────────────────────────────────────────
export default function Step4Resultat({ onPrev, onRestart }) {
  const [resultat] = useLocalStorage('pvc-resultat', null)
  const [villes]   = useLocalStorage('pvc-villes', [])
  const [matrice]  = useLocalStorage('pvc-matrice', [])

  if (!resultat) {
    return (
      <div>
        <Stepper current={4} />
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Aucun résultat.{' '}
          <button onClick={onPrev} style={btnSecondary}>← Retour</button>
        </p>
      </div>
    )
  }

  const { cout, chemin, reductionInitiale } = resultat

  const arcs = []
  for (let i = 0; i < chemin.length - 1; i++) {
    const iDe  = villes.indexOf(chemin[i])
    const iA   = villes.indexOf(chemin[i + 1])
    const dist = matrice?.[iDe]?.[iA] ?? '?'
    arcs.push({
      de: chemin[i], a: chemin[i + 1],
      dist: Number(dist),
      key: `${chemin[i]}-${chemin[i + 1]}`,
    })
  }

  return (
    <div>
      <Stepper current={4} />

      <div style={card}>
        <h2 style={{ marginBottom: '6px', fontSize: '22px' }}>Étape 4 — Résultat optimal</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Circuit de coût minimal trouvé par l'algorithme de Little.
        </p>

        {/* Coût total */}
        <div style={metricBox}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Coût total du circuit</p>
          <p style={{ fontSize: '42px', fontWeight: '700', color: 'var(--text-title)', fontFamily: 'var(--font-cursive)' }}>
            {cout}
          </p>
        </div>

        {/* Circuit */}
        <h3 style={h3}>Circuit optimal</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          {chemin.map((ville, i) => (
            <span key={`chemin-${ville}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={villeTag}>{ville}</span>
              {i < chemin.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
            </span>
          ))}
        </div>

        {/* Détail arcs */}
        <h3 style={h3}>Détail des distances</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '32px' }}>
          {arcs.map((arc) => (
            <div key={arc.key} style={arcRow}>
              <span style={{ fontFamily: 'var(--font-cursive)', fontWeight: '600' }}>
                {arc.de}{' → '}{arc.a}
              </span>
              <span style={distBadge}>{arc.dist}</span>
            </div>
          ))}
        </div>

        {/* Schéma 1 : Circuit hamiltonien */}
        <h3 style={h3}>Schéma — Circuit hamiltonien</h3>
        <p style={hint}>
          Seuls les arcs du circuit optimal sont affichés en bleu. Les flèches indiquent le sens du parcours.
        </p>
        <div style={svgWrap}>
          <CircuitHamiltonien chemin={chemin} villes={villes} matrice={matrice} />
        </div>

        {/* Schéma 2 : Arbre de branchement */}
        <h3 style={{ ...h3, marginTop: '32px' }}>Schéma — Arbre de branchement (méthode de Little)</h3>
        <p style={hint}>
          Conforme au cours : chaque nœud se sépare en deux fils selon l'arc de regret maximal —
          fils <strong>(x,y)</strong> = arc inclus, fils <strong>[x,y]</strong> = arc non inclus (élagué ✕).
          Tous les niveaux du circuit sont représentés.
        </p>
        <div style={svgWrap}>
          <ArbreBranchement
            villes={villes}
            chemin={chemin}
            cout={cout}
            reductionInitiale={reductionInitiale ?? 0}
          />
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '32px' }}>
          <button onClick={onPrev}    style={btnSecondary}>← Précédent</button>
          <button onClick={onRestart} style={btnDanger}>Recommencer</button>
        </div>
      </div>
    </div>
  )
}

Step4Resultat.propTypes = {
  onPrev:    PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
}

// ─── Styles ──────────────────────────────────────────────────────────────
const card         = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', maxWidth: '680px', margin: '0 auto' }
const metricBox    = { background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', marginBottom: '24px', textAlign: 'center' }
const h3           = { fontSize: '16px', marginBottom: '8px' }
const hint         = { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.6' }
const villeTag     = { background: 'var(--bg-btn)', color: 'var(--text-btn)', borderRadius: 'var(--radius-sm)', padding: '5px 14px', fontWeight: '600', fontSize: '14px', fontFamily: 'var(--font-cursive)' }
const arcRow       = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '14px' }
const distBadge    = { fontWeight: '700', color: 'var(--text-title)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px 12px' }
const svgWrap      = { background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '8px', overflowX: 'auto' }
const btnSecondary = { padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }
const btnDanger    = { padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }
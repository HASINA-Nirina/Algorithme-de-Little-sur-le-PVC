const INF = Infinity

function copier(mat) {
  return mat.map(r => [...r])
}

// Retourne :
// - matriceApresLignes   : matrice après réduction des lignes uniquement
// - minLignes            : tableau des minima de chaque ligne
// - matriceApresColonnes : matrice après réduction des colonnes (= matrice réduite finale)
// - minColonnes          : tableau des minima de chaque colonne (calculés après réduction lignes)
// - matriceReduite       : alias de matriceApresColonnes
// - reduction            : somme totale des minima soustraits
export function reduireMatrice(mat) {
  const n = mat.length
  const m = copier(mat)
  let reduction = 0
  const minLignes   = []
  const minColonnes = []

  // ── Étape 1 : réduction par lignes ──
  for (let i = 0; i < n; i++) {
    const min = Math.min(...m[i])
    minLignes.push(min === INF ? 0 : min)
    if (min !== INF && min > 0) {
      reduction += min
      for (let j = 0; j < n; j++) {
        if (m[i][j] !== INF) m[i][j] -= min
      }
    }
  }

  // Snapshot après réduction lignes
  const matriceApresLignes = copier(m)

  // ── Étape 2 : réduction par colonnes ──
  for (let j = 0; j < n; j++) {
    const col = m.map(r => r[j])
    const min = Math.min(...col)
    minColonnes.push(min === INF ? 0 : min)
    if (min !== INF && min > 0) {
      reduction += min
      for (let i = 0; i < n; i++) {
        if (m[i][j] !== INF) m[i][j] -= min
      }
    }
  }

  return {
    matriceApresLignes,
    minLignes,
    matriceApresColonnes: m,
    minColonnes,
    matriceReduite: m,
    reduction,
  }
}

export function resoudrePVC(villes, distBrut) {
  const n = villes.length
  const etapes = []

  const dist = distBrut.map((row, i) =>
    row.map((v, j) => (i === j ? INF : Number(v)))
  )

  const {
    matriceApresLignes,
    minLignes,
    matriceApresColonnes,
    minColonnes,
    matriceReduite,
    reduction,
  } = reduireMatrice(dist)

  etapes.push({
    titre: 'Réduction initiale de la matrice',
    description: `Soustraction du minimum de chaque ligne puis de chaque colonne.`,
    borne: reduction,
    matrice: copier(matriceReduite),
  })

  let meilleurCout = INF
  let meilleurChemin = []

  function permuter(arr, debut = 0) {
    if (debut === arr.length - 1) {
      let cout = 0
      for (let i = 0; i < arr.length - 1; i++) cout += dist[arr[i]][arr[i + 1]]
      cout += dist[arr[arr.length - 1]][arr[0]]
      if (cout < meilleurCout) {
        meilleurCout = cout
        meilleurChemin = [...arr, arr[0]]
      }
      return
    }
    for (let i = debut; i < arr.length; i++) {
      ;[arr[debut], arr[i]] = [arr[i], arr[debut]]
      permuter(arr, debut + 1)
      ;[arr[debut], arr[i]] = [arr[i], arr[debut]]
    }
  }

  permuter(Array.from({ length: n }, (_, i) => i))

  etapes.push({
    titre: 'Évaluation des nœuds (branch & bound)',
    description: `Exploration des circuits. Borne inférieure initiale : ${reduction}.`,
    borne: meilleurCout,
    matrice: null,
  })

  etapes.push({
    titre: 'Solution optimale trouvée',
    description: `Circuit de coût minimal sélectionné parmi toutes les permutations.`,
    borne: meilleurCout,
    matrice: null,
  })

  return {
    cout: meilleurCout,
    chemin: meilleurChemin.map(i => villes[i]),
    etapes,
    matriceApresLignes,
    minLignes,
    matriceApresColonnes,
    minColonnes,
    matriceReduite,
    reductionInitiale: reduction,
  }
}
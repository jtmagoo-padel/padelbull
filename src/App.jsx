import React, { useMemo, useState } from 'react';

// versión simple para que funcione en Vercel sin dependencias extra
const Button = ({ children, className = '', ...props }) => (
  <button
    className={'px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white ' + className}
    {...props}
  >
    {children}
  </button>
);

const POINTS = [0, 15, 30, 40];

function getInitialState() {
  return {
    teamA: 'Pareja A',
    teamB: 'Pareja B',
    pointsA: 0,
    pointsB: 0,
    gamesA: 0,
    gamesB: 0,
  };
}

function getDisplayPoints(a, b) {
  if (a >= 3 && b >= 3) {
    if (a === b) return ['40', '40'];
    if (a === b + 1) return ['AD', '-'];
    if (b === a + 1) return ['-', 'AD'];
  }
  return [String(POINTS[a] ?? 0), String(POINTS[b] ?? 0)];
}

function hasWonGame(a, b) {
  return a >= 4 && a - b >= 2;
}

export default function App() {
  const [state, setState] = useState(getInitialState());

  const display = useMemo(
    () => getDisplayPoints(state.pointsA, state.pointsB),
    [state.pointsA, state.pointsB]
  );

  const addPoint = (team) => {
    setState((prev) => {
      const next = { ...prev };

      if (team === 'A') next.pointsA += 1;
      else next.pointsB += 1;

      if (hasWonGame(next.pointsA, next.pointsB)) {
        next.gamesA += 1;
        next.pointsA = 0;
        next.pointsB = 0;
      }

      if (hasWonGame(next.pointsB, next.pointsA)) {
        next.gamesB += 1;
        next.pointsA = 0;
        next.pointsB = 0;
      }

      return next;
    });
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>PadelBull Score</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 24 }}>
        <div>
          <h2>{state.teamA}</h2>
          <p>Games: {state.gamesA}</p>
          <p>Puntos: {display[0]}</p>
          <Button onClick={() => addPoint('A')}>+ Punto</Button>
        </div>

        <div>
          <h2>{state.teamB}</h2>
          <p>Games: {state.gamesB}</p>
          <p>Puntos: {display[1]}</p>
          <Button onClick={() => addPoint('B')}>+ Punto</Button>
        </div>
      </div>
    </div>
  );
}
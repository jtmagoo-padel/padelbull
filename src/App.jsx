import React, { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'padelbull_match_v2';
const DEFAULT_LOGO = '/logo-padelbull.png';

const buttonBase = {
  border: 'none',
  borderRadius: 14,
  padding: '12px 16px',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
};

const primaryButton = {
  ...buttonBase,
  background: '#16a34a',
  color: '#ffffff',
};

const secondaryButton = {
  ...buttonBase,
  background: '#e5e7eb',
  color: '#111827',
};

const darkButton = {
  ...buttonBase,
  background: '#111827',
  color: '#ffffff',
};

const dangerButton = {
  ...buttonBase,
  background: '#dc2626',
  color: '#ffffff',
};

function createInitialState() {
  return {
    teamA: 'Pareja A',
    teamB: 'Pareja B',
    pointsA: 0,
    pointsB: 0,
    gamesA: 0,
    gamesB: 0,
    setsA: 0,
    setsB: 0,
    tieBreakA: 0,
    tieBreakB: 0,
    inTieBreak: false,
    history: [],
    matchFinished: false,
    winner: null,
    format: 'best-of-3',
    tieBreakEnabled: true,
    soundEnabled: true,
    logoUrl: DEFAULT_LOGO,
  };
}

function cloneWithoutHistory(state) {
  return {
    ...state,
    history: [],
  };
}

function getSetsToWin(format) {
  if (format === 'best-of-5') return 3;
  return 2;
}

function isFixedFourSets(format) {
  return format === 'fixed-4';
}

function getFormatLabel(format) {
  if (format === 'best-of-5') return 'Mejor de 5';
  if (format === 'fixed-4') return 'A 4 sets';
  return 'Mejor de 3';
}

function hasWonGame(myPoints, otherPoints) {
  return myPoints >= 4 && myPoints - otherPoints >= 2;
}

function hasWonRegularSet(myGames, otherGames) {
  return myGames >= 6 && myGames - otherGames >= 2;
}

function shouldStartTieBreak(gamesA, gamesB, tieBreakEnabled) {
  return tieBreakEnabled && gamesA === 6 && gamesB === 6;
}

function hasWonTieBreak(myPoints, otherPoints) {
  return myPoints >= 7 && myPoints - otherPoints >= 2;
}

function getDisplayPoints(a, b) {
  if (a >= 3 && b >= 3) {
    if (a === b) return ['40', '40'];
    if (a === b + 1) return ['AD', '-'];
    if (b === a + 1) return ['-', 'AD'];
  }

  const scoreMap = ['0', '15', '30', '40'];
  return [scoreMap[a] ?? '40', scoreMap[b] ?? '40'];
}

function TeamCard({
  name,
  onNameChange,
  sets,
  games,
  points,
  tieBreakPoints,
  onAddPoint,
  fullscreen,
  tvMode,
  accent,
}) {
  const cardStyle = {
    flex: 1,
    minWidth: 310,
    background: '#ffffff',
    borderRadius: 24,
    padding: fullscreen ? 22 : 20,
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    borderTop: `6px solid ${accent}`,
  };

  const bigPointsStyle = {
    background: '#111827',
    color: '#ffffff',
    borderRadius: 22,
    padding: fullscreen ? 20 : 18,
    textAlign: 'center',
    marginBottom: 16,
  };

  const statsRow = {
    display: 'flex',
    gap: 12,
    marginBottom: 18,
  };

  const statStyle = {
    background: '#e5e7eb',
    borderRadius: 18,
    padding: 14,
    textAlign: 'center',
    flex: 1,
    border: '1px solid #cbd5e1',
  };

  return (
    <div style={cardStyle}>
      {tvMode ? (
        <div
          style={{
            fontSize: fullscreen ? 34 : 30,
            fontWeight: 800,
            width: '100%',
            marginBottom: 14,
            color: '#111827',
          }}
        >
          {name}
        </div>
      ) : (
        <input
          placeholder="Escribí nombres (ej: Juan / Pedro)"
          value={name}
          onChange={onNameChange}
          style={{
            fontSize: fullscreen ? 34 : 30,
            fontWeight: 800,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            marginBottom: 14,
            color: '#111827',
          }}
        />
      )}

      <div style={bigPointsStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.75, marginBottom: 6 }}>
          {tieBreakPoints !== null ? 'TIE-BREAK' : 'PUNTOS'}
        </div>
        <div style={{ fontSize: fullscreen ? 106 : 84, fontWeight: 900, lineHeight: 1 }}>
          {tieBreakPoints !== null ? tieBreakPoints : points}
        </div>
      </div>

      <div style={statsRow}>
        <div style={statStyle}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 4, fontWeight: 800 }}>
            JUEGOS
          </div>
          <div style={{ fontSize: fullscreen ? 50 : 40, fontWeight: 900, color: '#111827' }}>
            {games}
          </div>
        </div>
        <div style={statStyle}>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 4, fontWeight: 800 }}>
            CONJUNTOS
          </div>
          <div style={{ fontSize: fullscreen ? 42 : 34, fontWeight: 900, color: '#111827' }}>
            {sets}
          </div>
        </div>
      </div>

      {!tvMode ? (
        <button
          style={{
            ...primaryButton,
            width: '100%',
            fontSize: fullscreen ? 28 : 22,
            padding: fullscreen ? '18px 20px' : '16px 18px',
            background: accent,
          }}
          onClick={onAddPoint}
        >
          +1 Punto
        </button>
      ) : null}
    </div>
  );
}

export default function App() {
  const [fullscreen, setFullscreen] = useState(false);
  const [tvMode, setTvMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);
  const [state, setState] = useState(createInitialState);
  const lastFinishedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({
          ...createInitialState(),
          ...parsed,
          logoUrl: DEFAULT_LOGO,
        });
      } catch (e) {
        console.error('Error cargando datos guardados');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.matchFinished && !lastFinishedRef.current && state.soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();

          const playTone = (frequency, start, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = frequency;
            gain.gain.value = 0.06;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
          };

          playTone(880, 0, 0.18);
          playTone(1174, 0.2, 0.18);
          playTone(1567, 0.4, 0.28);
        }
      } catch (e) {
        console.error('No se pudo reproducir la alarma');
      }
    }

    lastFinishedRef.current = state.matchFinished;
  }, [state.matchFinished, state.soundEnabled]);

  const currentPoints = useMemo(() => {
    if (state.inTieBreak) return [String(state.tieBreakA), String(state.tieBreakB)];
    return getDisplayPoints(state.pointsA, state.pointsB);
  }, [state.pointsA, state.pointsB, state.inTieBreak, state.tieBreakA, state.tieBreakB]);

  const closeSet = (next, winner) => {
    if (winner === 'A') next.setsA += 1;
    else next.setsB += 1;

    next.gamesA = 0;
    next.gamesB = 0;
    next.pointsA = 0;
    next.pointsB = 0;
    next.tieBreakA = 0;
    next.tieBreakB = 0;
    next.inTieBreak = false;

    if (isFixedFourSets(next.format)) {
      const totalSetsPlayed = next.setsA + next.setsB;
      if (totalSetsPlayed >= 4) {
        next.matchFinished = true;
        if (next.setsA > next.setsB) next.winner = next.teamA;
        else if (next.setsB > next.setsA) next.winner = next.teamB;
        else next.winner = 'Empate';
      }
      return;
    }

    const setsToWin = getSetsToWin(next.format);

    if (next.setsA >= setsToWin) {
      next.matchFinished = true;
      next.winner = next.teamA;
    } else if (next.setsB >= setsToWin) {
      next.matchFinished = true;
      next.winner = next.teamB;
    }
  };

  const addPoint = (team) => {
    setState((prev) => {
      if (prev.matchFinished) return prev;

      const next = {
        ...prev,
        history: [...prev.history, cloneWithoutHistory(prev)],
      };

      if (next.inTieBreak) {
        if (team === 'A') next.tieBreakA += 1;
        else next.tieBreakB += 1;

        if (hasWonTieBreak(next.tieBreakA, next.tieBreakB)) {
          closeSet(next, 'A');
        } else if (hasWonTieBreak(next.tieBreakB, next.tieBreakA)) {
          closeSet(next, 'B');
        }
      } else {
        if (team === 'A') next.pointsA += 1;
        else next.pointsB += 1;

        if (hasWonGame(next.pointsA, next.pointsB)) {
          next.gamesA += 1;
          next.pointsA = 0;
          next.pointsB = 0;
        } else if (hasWonGame(next.pointsB, next.pointsA)) {
          next.gamesB += 1;
          next.pointsA = 0;
          next.pointsB = 0;
        }

        if (shouldStartTieBreak(next.gamesA, next.gamesB, next.tieBreakEnabled)) {
          next.inTieBreak = true;
        } else if (hasWonRegularSet(next.gamesA, next.gamesB)) {
          closeSet(next, 'A');
        } else if (hasWonRegularSet(next.gamesB, next.gamesA)) {
          closeSet(next, 'B');
        }
      }

      return next;
    });
  };

  const undo = () => {
    setState((prev) => {
      if (prev.history.length === 0) return prev;
      const history = [...prev.history];
      const lastSnapshot = history.pop();
      return {
        ...lastSnapshot,
        history,
      };
    });
  };

  const resetPoints = () => {
    setState((prev) => ({
      ...prev,
      pointsA: 0,
      pointsB: 0,
      tieBreakA: 0,
      tieBreakB: 0,
      inTieBreak: false,
    }));
  };

  const resetMatch = () => {
    setState((prev) => ({
      ...createInitialState(),
      teamA: prev.teamA,
      teamB: prev.teamB,
      format: prev.format,
      tieBreakEnabled: prev.tieBreakEnabled,
      soundEnabled: prev.soundEnabled,
      logoUrl: prev.logoUrl,
    }));
  };

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createInitialState());
    setLogoVisible(true);
  };

  const bgColor = fullscreen || tvMode ? '#111827' : '#f3f4f6';
  const textColor = fullscreen || tvMode ? '#ffffff' : '#111827';

  return (
    <div>
      {!tvMode ? (
        <button
          onClick={() => setFullscreen(!fullscreen)}
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            zIndex: 1000,
            ...darkButton,
          }}
        >
          {fullscreen ? 'Salir pantalla' : 'Pantalla completa'}
        </button>
      ) : null}

      <div
        style={{
          minHeight: '100vh',
          background: bgColor,
          fontFamily: 'Arial, sans-serif',
          padding: fullscreen || tvMode ? 10 : 20,
          color: textColor,
        }}
      >
        <div style={{ maxWidth: fullscreen || tvMode ? '100%' : 1240, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: tvMode ? 10 : 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {logoVisible ? (
                <img
                  src={state.logoUrl || DEFAULT_LOGO}
                  alt="PadelBull"
                  onError={() => setLogoVisible(false)}
                  style={{
                    width: fullscreen || tvMode ? 84 : 64,
                    height: fullscreen || tvMode ? 84 : 64,
                    objectFit: 'contain',
                    aspectRatio: '1 / 1',
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 4,
                    border: '2px solid #e5e7eb',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: fullscreen || tvMode ? 84 : 64,
                    height: fullscreen || tvMode ? 84 : 64,
                    aspectRatio: '1 / 1',
                    background: '#16a34a',
                    color: '#ffffff',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: fullscreen || tvMode ? 28 : 22,
                    border: '2px solid #14532d',
                  }}
                >
                  PB
                </div>
              )}

              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', letterSpacing: 1 }}>
                  PADELBULL
                </div>
                <h1
                  style={{
                    margin: '6px 0 0 0',
                    fontSize: tvMode ? 56 : fullscreen ? 66 : 42,
                    lineHeight: 1.05,
                  }}
                >
                  Tanteador Pro
                </h1>
                <div style={{ opacity: 0.75, fontSize: tvMode ? 18 : 14 }}>
                  Formato: {getFormatLabel(state.format)}
                </div>
              </div>
            </div>

            {!tvMode ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button style={secondaryButton} onClick={() => setTvMode(true)}>
                  Modo TV
                </button>
                <button style={secondaryButton} onClick={() => setShowSettings((prev) => !prev)}>
                  {showSettings ? 'Cerrar ajustes' : 'Configuración'}
                </button>
                <button style={secondaryButton} onClick={undo}>
                  Deshacer
                </button>
                <button style={secondaryButton} onClick={resetPoints}>
                  Reset puntos
                </button>
                <button style={dangerButton} onClick={resetMatch}>
                  Reset partido
                </button>
              </div>
            ) : (
              <button style={secondaryButton} onClick={() => setTvMode(false)}>
                Salir modo TV
              </button>
            )}
          </div>

          {!tvMode && showSettings ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 22,
                padding: 18,
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                marginBottom: 20,
                color: '#111827',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>
                Configuración del partido
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <button
                  style={state.format === 'best-of-3' ? primaryButton : secondaryButton}
                  onClick={() => setState((prev) => ({ ...prev, format: 'best-of-3' }))}
                >
                  Mejor de 3
                </button>
                <button
                  style={state.format === 'best-of-5' ? primaryButton : secondaryButton}
                  onClick={() => setState((prev) => ({ ...prev, format: 'best-of-5' }))}
                >
                  Mejor de 5
                </button>
                <button
                  style={state.format === 'fixed-4' ? primaryButton : secondaryButton}
                  onClick={() => setState((prev) => ({ ...prev, format: 'fixed-4' }))}
                >
                  A 4 sets
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <button
                  style={state.tieBreakEnabled ? primaryButton : secondaryButton}
                  onClick={() => setState((prev) => ({ ...prev, tieBreakEnabled: true }))}
                >
                  Tie-break ON
                </button>
                <button
                  style={!state.tieBreakEnabled ? primaryButton : secondaryButton}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      tieBreakEnabled: false,
                      inTieBreak: false,
                      tieBreakA: 0,
                      tieBreakB: 0,
                    }))
                  }
                >
                  Tie-break OFF
                </button>
                <button
                  style={state.soundEnabled ? primaryButton : secondaryButton}
                  onClick={() =>
                    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                  }
                >
                  {state.soundEnabled ? 'Alarma ON' : 'Alarma OFF'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 700 }}>Logo</label>
                <input
                  value={state.logoUrl}
                  onChange={(e) => {
                    setLogoVisible(true);
                    setState((prev) => ({ ...prev, logoUrl: e.target.value }));
                  }}
                  placeholder="/logo-padelbull.png"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid #d1d5db',
                    fontSize: 15,
                  }}
                />
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  Para que el logo aparezca online, guardá la imagen en la carpeta public con el
                  nombre logo-padelbull.png.
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <button style={dangerButton} onClick={clearSavedData}>
                  Borrar datos guardados
                </button>
              </div>
            </div>
          ) : null}

          {state.inTieBreak && !state.matchFinished ? (
            <div
              style={{
                background: '#dbeafe',
                border: '2px solid #2563eb',
                borderRadius: 20,
                padding: 14,
                marginBottom: 20,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 800,
                color: '#1e3a8a',
              }}
            >
              Tie-break en juego
            </div>
          ) : null}

          {state.matchFinished ? (
            <div
              style={{
                background: '#dcfce7',
                border: '2px solid #16a34a',
                borderRadius: 20,
                padding: 18,
                marginBottom: 20,
                textAlign: 'center',
                fontSize: 26,
                fontWeight: 800,
                color: '#166534',
              }}
            >
              {state.winner === 'Empate' ? 'Partido empatado' : `Ganó ${state.winner}`}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <TeamCard
              name={state.teamA}
              onNameChange={(e) => setState((prev) => ({ ...prev, teamA: e.target.value }))}
              sets={state.setsA}
              games={state.gamesA}
              points={currentPoints[0]}
              tieBreakPoints={state.inTieBreak ? state.tieBreakA : null}
              onAddPoint={() => addPoint('A')}
              accent="#16a34a"
              fullscreen={fullscreen || tvMode}
              tvMode={tvMode}
            />

            <TeamCard
              name={state.teamB}
              onNameChange={(e) => setState((prev) => ({ ...prev, teamB: e.target.value }))}
              sets={state.setsB}
              games={state.gamesB}
              points={currentPoints[1]}
              tieBreakPoints={state.inTieBreak ? state.tieBreakB : null}
              onAddPoint={() => addPoint('B')}
              accent="#2563eb"
              fullscreen={fullscreen || tvMode}
              tvMode={tvMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
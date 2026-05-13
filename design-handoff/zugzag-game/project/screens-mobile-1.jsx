// P2 ProblemBoardPage + P3 SendRecordModal — mobile

// Mock problems data
const PROBLEMS = {
  'A벽': [
    { color: 'white', number: 1, done: false }, { color: 'white', number: 2, done: true },
    { color: 'yellow', number: 4, done: false }, { color: 'yellow', number: 7, done: false },
    { color: 'orange', number: 11, done: true }, { color: 'orange', number: 13, done: false },
    { color: 'green', number: 14, done: false, attempted: true }, { color: 'green', number: 16, done: false },
    { color: 'blue', number: 12, done: false }, { color: 'blue', number: 18, done: false },
    { color: 'red', number: 22, done: false },
  ],
  'B벽': [
    { color: 'yellow', number: 2, done: true }, { color: 'orange', number: 5, done: false },
    { color: 'green', number: 8, done: false }, { color: 'blue', number: 9, done: true },
    { color: 'blue', number: 12, done: false }, { color: 'red', number: 7, done: false },
    { color: 'red', number: 15, done: false }, { color: 'purple', number: 20, done: false },
    { color: 'black', number: 24, done: false },
  ],
  'C벽': [
    { color: 'white', number: 1, done: false }, { color: 'yellow', number: 3, done: false },
    { color: 'green', number: 6, done: false }, { color: 'blue', number: 11, done: false },
    { color: 'red', number: 3, done: false, attempted: true }, { color: 'red', number: 19, done: false },
    { color: 'purple', number: 25, done: false },
  ],
  'D벽 (오버행)': [
    { color: 'orange', number: 5, done: false }, { color: 'green', number: 10, done: false },
    { color: 'blue', number: 14, done: false }, { color: 'red', number: 17, done: false },
    { color: 'purple', number: 21, done: false }, { color: 'black', number: 28, done: false },
  ],
};

function ProblemBoardMobile({ state = 'live' }) {
  const [showFab] = React.useState(true);
  return (
    <div className="zz-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h1 className="t-title-xl">문제 보드</h1>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
          </button>
        </div>
        <button style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8,
          padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text-primary)', fontSize: 14, marginTop: 4, cursor: 'pointer',
        }}>
          <span style={{ fontWeight: 600 }}>2026-05 세팅</span>
          <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.12)', color: 'var(--accent-success)', fontWeight: 700 }}>진행 중</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>

      {/* Body */}
      <div className="zz-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 200px' }}>
        {state === 'loading' && Object.keys(PROBLEMS).map(w => (
          <div key={w} style={{ marginBottom: 24 }}>
            <div className="zz-skel" style={{ height: 18, width: 60, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {[0,1,2,3,4].map(i => <div key={i} className="zz-skel" style={{ width: 60, height: 60 }} />)}
            </div>
          </div>
        ))}
        {state === 'empty' && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 64, color: 'var(--text-tertiary)', fontWeight: 700 }}>—</div>
            <div className="t-title-md" style={{ marginTop: 16 }}>이번 세팅 문제가 아직 없어요</div>
            <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 8 }}>크루장이 문제를 등록하면 표시됩니다</div>
            <button className="zz-btn zz-btn-secondary" style={{ marginTop: 24 }}>크루장에게 알리기</button>
          </div>
        )}
        {state === 'live' && Object.entries(PROBLEMS).map(([wall, items]) => (
          <div key={wall} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <h2 className="t-title-md">{wall}</h2>
              <span className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                {items.filter(p => p.done).length}/{items.length}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {items.map((p, i) => (
                <HoldChip key={i} color={p.color} number={p.number} done={p.done} attempted={p.attempted} size={60} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showFab && state === 'live' && <FAB />}
      <BottomNav active="board" rankedLive />
    </div>
  );
}

// ----- P3 Send Record Modal (interactive) -----
const WALLS_FOR_MODAL = [
  { name: 'A벽', tag: '메인볼더', count: 11 },
  { name: 'B벽', tag: '오른쪽', count: 9 },
  { name: 'C벽', tag: '슬랩', count: 7 },
  { name: 'D벽', tag: '오버행', count: 6 },
  { name: 'E벽', tag: '캠퍼스', count: 4 },
  { name: 'F벽', tag: '베이스', count: 5 },
];

function SendModal({ initialStep = 1, mode = 'ranked', state = 'normal', onClose }) {
  const [step, setStep] = React.useState(initialStep);
  const [wall, setWall] = React.useState('B벽');
  const [color, setColor] = React.useState('red');
  const [number, setNumber] = React.useState(7);
  const [attempts, setAttempts] = React.useState(3);
  const [comment, setComment] = React.useState('');

  const score = SCORE_BY_COLOR[color];
  const seasonBefore = 1240;
  const seasonAfter = mode === 'ranked' ? seasonBefore + score : seasonBefore;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'var(--bg-canvas)',
      display: 'flex', flexDirection: 'column', zIndex: 400,
    }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-default)',
      }}>
        <button
          onClick={() => step > 1 ? setStep(step - 1) : onClose?.()}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 4 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="t-title-md">완등 기록</div>
        <div className="zz-num" style={{ color: 'var(--text-tertiary)', fontSize: 14, fontWeight: 700 }}>{step}/3</div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 20px' }}>
        {[1,2,3].map(s => (
          <div key={s} style={{
            flex: 1, height: 3, borderRadius: 9999,
            background: s <= step ? 'var(--accent-ranked)' : 'var(--border-default)',
            transition: 'background 200ms ease-out',
          }} />
        ))}
      </div>

      {/* Step content */}
      <div className="zz-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 20px' }}>
        {step === 1 && (
          <>
            <div className="t-title-lg" style={{ marginBottom: 4 }}>벽 선택</div>
            <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              직전 선택: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{wall}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {WALLS_FOR_MODAL.map(w => {
                const sel = w.name === wall;
                return (
                  <button key={w.name}
                    onClick={() => { setWall(w.name); setTimeout(() => setStep(2), 200); }}
                    style={{
                      background: sel ? 'rgba(255,59,92,0.08)' : 'var(--bg-surface)',
                      border: `1px solid ${sel ? 'var(--accent-ranked)' : 'var(--border-default)'}`,
                      borderRadius: 12, padding: '20px 16px',
                      textAlign: 'left', cursor: 'pointer',
                      transition: 'all 150ms ease-out',
                      minHeight: 110,
                    }}
                  >
                    <div className="t-title-lg" style={{ color: sel ? 'var(--accent-ranked)' : 'var(--text-primary)' }}>{w.name}</div>
                    <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>{w.tag}</div>
                    <div className="zz-num" style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>active {w.count}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="t-title-lg" style={{ marginBottom: 4 }}>{wall} · 색/번호</div>
            <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>완등한 문제를 선택하세요</div>
            {/* Color tabs */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }} className="zz-noscroll">
              {['yellow', 'orange', 'green', 'blue', 'red', 'purple', 'black'].map(c => {
                const sel = c === color;
                const hex = HOLD_COLORS[c].hex;
                return (
                  <button key={c} onClick={() => setColor(c)} style={{
                    flexShrink: 0, width: 56, height: 56, borderRadius: 16,
                    background: hex, border: sel ? '3px solid #fff' : '3px solid transparent',
                    cursor: 'pointer', boxShadow: sel ? `0 0 0 2px ${hex}` : 'none',
                    transition: 'all 150ms ease-out',
                  }} />
                );
              })}
            </div>
            <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginBottom: 12, fontFamily: 'var(--font-num)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {HOLD_COLORS[color].kr.toUpperCase()} · {SCORE_BY_COLOR[color]}점
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[3,7,11,15,19,23].map(n => {
                const sel = n === number;
                const done = n === 11;
                return (
                  <button
                    key={n}
                    onClick={() => !done && (setNumber(n), setTimeout(() => setStep(3), 200))}
                    disabled={done}
                    style={{
                      aspectRatio: '1', borderRadius: 16,
                      background: done ? 'var(--bg-surface)' : HOLD_COLORS[color].hex,
                      color: done ? 'var(--text-tertiary)' : HOLD_COLORS[color].text,
                      border: sel ? '3px solid #fff' : (done ? '1px solid var(--border-default)' : 'none'),
                      fontFamily: 'var(--font-num)', fontSize: 28, fontWeight: 700,
                      cursor: done ? 'not-allowed' : 'pointer',
                      position: 'relative', opacity: done ? 0.55 : 1,
                    }}
                  >
                    {n}
                    {done && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <KindBadge kind={mode} />
            </div>
            {/* Problem summary card */}
            <div className="zz-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: HOLD_COLORS[color].hex, color: HOLD_COLORS[color].text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 24,
              }}>
                {number}
              </div>
              <div style={{ flex: 1 }}>
                <div className="t-title-md">{wall}</div>
                <div className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  {HOLD_COLORS[color].kr} #{number}
                </div>
              </div>
            </div>

            {/* Score preview */}
            {mode === 'ranked' ? (
              <div style={{
                padding: 20, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(255,59,92,0.1), rgba(255,59,92,0.02))',
                border: '1px solid rgba(255,59,92,0.3)',
                marginBottom: 20,
              }}>
                <div className="zz-num" style={{
                  fontSize: 48, fontWeight: 800, color: 'var(--accent-ranked)',
                  lineHeight: 1, letterSpacing: '-0.02em',
                }}>
                  +{score}<span style={{ fontSize: 18, color: 'var(--text-secondary)', marginLeft: 6 }}>점</span>
                </div>
                <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 12, fontFamily: 'var(--font-num)' }}>
                  시즌 {seasonBefore.toLocaleString()} → <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{seasonAfter.toLocaleString()}</span>
                  <span style={{ marginLeft: 8, color: 'var(--accent-success)' }}>3위 → 2위</span>
                </div>
                {state === 'stale' && (
                  <div className="t-body-sm" style={{ color: 'var(--accent-win)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--accent-win)' }} />
                    예상 점수 (다른 멤버 풀이 감지 — 기록 후 갱신)
                  </div>
                )}
                {state === 'offline' && (
                  <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>
                    기록 후 점수 갱신됨
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: 20, borderRadius: 16,
                background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)',
                marginBottom: 20,
              }}>
                <div className="t-title-md" style={{ color: 'var(--text-primary)' }}>
                  기록만 남아요
                </div>
                <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                  CASUAL — 시즌 점수에 미반영
                </div>
                <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 12, fontFamily: 'var(--font-num)' }}>
                  오늘 누적 <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>5</span>건째 풀이
                </div>
              </div>
            )}

            {/* Attempts stepper */}
            <div style={{ marginBottom: 16 }}>
              <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>시도 횟수 <span style={{ color: 'var(--text-tertiary)' }}>(선택)</span></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setAttempts(Math.max(1, attempts - 1))} style={{
                  width: 44, height: 44, borderRadius: 12, background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)', color: 'var(--text-primary)',
                  fontSize: 20, cursor: 'pointer',
                }}>−</button>
                <div className="zz-num" style={{
                  flex: 1, textAlign: 'center', fontSize: 28, fontWeight: 700,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                  borderRadius: 12, padding: '6px 0',
                }}>{attempts}</div>
                <button onClick={() => setAttempts(Math.min(99, attempts + 1))} style={{
                  width: 44, height: 44, borderRadius: 12, background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)', color: 'var(--text-primary)',
                  fontSize: 20, cursor: 'pointer',
                }}>+</button>
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 24 }}>
              <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>코멘트 <span style={{ color: 'var(--text-tertiary)' }}>(선택, 200자)</span></div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 200))}
                placeholder="한 마디 남기기 (선택)"
                className="zz-input"
                style={{ minHeight: 72, resize: 'none', fontFamily: 'var(--font-kr)' }}
              />
            </div>
          </>
        )}
      </div>

      {/* Footer CTA */}
      {step === 3 && (
        <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--border-default)', background: 'var(--bg-canvas)' }}>
          <button
            className={`zz-btn ${mode === 'ranked' ? 'zz-btn-primary' : 'zz-btn-secondary'} zz-btn-tall zz-btn-full`}
            onClick={() => onClose?.()}
            disabled={state === 'submitting'}
            style={{ opacity: state === 'submitting' ? 0.6 : 1 }}
          >
            {state === 'submitting' ? '기록 중…' : '기록하기'}
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ProblemBoardMobile, SendModal, PROBLEMS });

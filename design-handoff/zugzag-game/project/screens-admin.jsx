// P6 SeasonCreate (desktop), P7 QuickRanked (bottom sheet), P8 TVToken (desktop)

function SeasonCreateDesktop() {
  return (
    <div className="zz-screen" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0 }}>
      <div className="zz-noscroll" style={{ padding: 48, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-tertiary)' }}>
          <span className="t-body-sm">서울볼더스</span>
          <span>/</span>
          <span className="t-body-sm">시즌</span>
          <span>/</span>
          <span className="t-body-sm" style={{ color: 'var(--text-primary)' }}>새로 만들기</span>
        </div>
        <h1 className="t-title-xl">새 시즌 만들기</h1>
        <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          시작 후엔 점수 정책을 수정할 수 없어요
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 560 }}>
          {/* 1. Name */}
          <div>
            <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>1. 시즌 이름</div>
            <input className="zz-input" defaultValue="2026 6월 랭크전" />
          </div>

          {/* 2. Dates */}
          <div>
            <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>2. 기간</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 16px 1fr', alignItems: 'center', gap: 8 }}>
              <input className="zz-input" defaultValue="2026-06-01" />
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>→</div>
              <input className="zz-input" defaultValue="2026-06-30" placeholder="선택" />
            </div>
            <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 6 }}>
              종료일은 선택 (자동 종료) — 비우면 수동 종료
            </div>
          </div>

          {/* 3. Policy */}
          <div>
            <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>3. 점수 정책</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button style={{
                flex: 1, padding: '12px 16px', borderRadius: 8,
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
              }}>
                <div className="t-body-md" style={{ fontWeight: 600 }}>기존 정책 사용</div>
                <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>5월 표준 (8색)</div>
              </button>
              <button style={{
                flex: 1, padding: '12px 16px', borderRadius: 8,
                background: 'rgba(255,59,92,0.06)', border: '1px solid var(--accent-ranked)',
                color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
              }}>
                <div className="t-body-md" style={{ fontWeight: 600, color: 'var(--accent-ranked)' }}>새로 만들기</div>
                <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>색-점수 매핑 인라인</div>
              </button>
            </div>

            <div style={{
              padding: 16, background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)', borderRadius: 12,
            }}>
              <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginBottom: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
                CLIMB-X 강남 · 색-점수 매핑
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {Object.entries(SCORE_BY_COLOR).map(([color, score]) => {
                  const c = HOLD_COLORS[color];
                  return (
                    <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: c.hex,
                        outline: color === 'white' || color === 'black' ? '1px solid var(--border-strong)' : 'none',
                      }} />
                      <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: 13 }}>{c.kr}</div>
                      <input className="zz-input" defaultValue={score} style={{ width: 80, textAlign: 'right', padding: '8px 10px', fontFamily: 'var(--font-num)' }} />
                      <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>점</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Options */}
          <div>
            <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>4. 옵션</div>
            <div className="zz-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="t-body-md" style={{ fontWeight: 600 }}>같은 문제 1회만 인정 (first_send_only)</div>
                  <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>같은 문제 재완등은 점수 0</div>
                </div>
                <div style={{
                  width: 44, height: 26, borderRadius: 9999, background: 'var(--accent-success)',
                  position: 'relative', cursor: 'pointer',
                }}>
                  <div style={{
                    position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: 9999, background: '#fff',
                  }} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-default)', margin: '14px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="t-body-md" style={{ fontWeight: 600 }}>팀 상위 N명 합산 (team_top_n)</div>
                  <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>팀 모드일 때만 적용</div>
                </div>
                <input className="zz-input" defaultValue="5" style={{ width: 80, textAlign: 'right', padding: '8px 10px', fontFamily: 'var(--font-num)' }} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="zz-btn zz-btn-secondary">초안으로 저장</button>
            <button className="zz-btn zz-btn-primary" style={{ marginLeft: 'auto' }}>시즌 시작하기 →</button>
          </div>
        </div>
      </div>

      {/* Right summary */}
      <div style={{
        padding: 32, background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-default)',
        overflowY: 'auto',
      }}>
        <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>실시간 요약</div>
        <div className="t-title-lg" style={{ marginTop: 12 }}>2026 6월 랭크전</div>
        <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>2026.06.01 → 2026.06.30 (30일)</div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-default)' }}>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginBottom: 12, fontWeight: 600 }}>점수표</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(SCORE_BY_COLOR).map(([c, s]) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: HOLD_COLORS[c].hex, outline: c === 'white' || c === 'black' ? '1px solid var(--border-strong)' : 'none' }} />
                <div className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>{HOLD_COLORS[c].kr}</div>
                <div className="zz-num" style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 12, borderRadius: 8, background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}>
          <div className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
            8색 매핑 완료<br />
            first_send_only <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>ON</span><br />
            상위 5명 합산
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- P7 QuickRankedSession (bottom sheet on mobile) -----
function QuickRankedSheet({ stage = 'form', onClose }) {
  const [step, setStep] = React.useState(stage);
  const [name, setName] = React.useState('2026-05-13 현장 랭크전');
  const [duration, setDuration] = React.useState(2);
  const [teamMode, setTeamMode] = React.useState('individual');
  const [tvShare, setTvShare] = React.useState(true);

  return (
    <div className="zz-screen" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-overlay)' }}>
      <div style={{ flex: 1 }} onClick={onClose} />
      <div style={{
        background: 'var(--bg-surface)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 0 24px', maxHeight: '85%', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--el-modal)',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 9999, background: 'var(--border-strong)', margin: '6px auto 16px' }} />

        {step === 'form' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <KindBadge kind="ranked" />
              <span className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>즉석 랭크전</span>
            </div>
            <h2 className="t-title-xl" style={{ marginBottom: 24 }}>지금 시작</h2>

            <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>세션 이름</div>
            <input className="zz-input" value={name} onChange={(e) => setName(e.target.value)} />

            <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 16, marginBottom: 8 }}>지속 시간</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(h => (
                <button key={h} onClick={() => setDuration(h)} style={{
                  flex: 1, padding: '14px 0', borderRadius: 12,
                  background: duration === h ? 'var(--accent-ranked)' : 'var(--bg-surface-2)',
                  color: duration === h ? '#fff' : 'var(--text-primary)',
                  border: 'none', cursor: 'pointer',
                  fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-num)',
                }}>
                  {h}h
                </button>
              ))}
            </div>

            <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 16, marginBottom: 8 }}>팀 모드</div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
              background: 'var(--bg-surface-2)', padding: 4, borderRadius: 12,
            }}>
              {[
                { id: 'individual', label: '개인' },
                { id: 'team', label: '팀' },
                { id: 'crew_vs_crew', label: '크루 대항' },
              ].map(t => (
                <button key={t.id} onClick={() => setTeamMode(t.id)} style={{
                  padding: '12px 0', borderRadius: 8,
                  background: teamMode === t.id ? 'var(--bg-canvas)' : 'transparent',
                  color: teamMode === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{
              marginTop: 16, padding: 14, borderRadius: 12,
              background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <button onClick={() => setTvShare(!tvShare)} style={{
                width: 22, height: 22, borderRadius: 6,
                background: tvShare ? 'var(--accent-ranked)' : 'var(--bg-canvas)',
                border: tvShare ? 'none' : '1px solid var(--border-strong)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {tvShare && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>}
              </button>
              <div style={{ flex: 1 }}>
                <div className="t-body-md" style={{ fontWeight: 600 }}>TV에서 공공 공유</div>
                <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>시작 시 QR + URL 자동 발급</div>
              </div>
            </div>

            <button onClick={() => setStep('success')} className="zz-btn zz-btn-primary zz-btn-tall zz-btn-full" style={{ marginTop: 24, fontSize: 18 }}>
              지금 시작
            </button>
            <button onClick={onClose} className="zz-btn zz-btn-ghost zz-btn-full" style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
              5분 뒤 예약
            </button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ padding: '0 20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 9999, background: 'rgba(34,197,94,0.12)', color: 'var(--accent-success)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>
              <span className="zz-pulse" style={{ width: 6, height: 6, borderRadius: 9999, background: 'currentColor' }} />
              LIVE NOW
            </div>
            <div className="t-display-md" style={{ marginTop: 12, color: 'var(--accent-ranked)', letterSpacing: '-0.02em' }}>시작!</div>
            <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>이 화면을 TV로 가서 띄우세요</div>

            {/* QR */}
            <div style={{
              margin: '24px auto 0', width: 240, height: 240, padding: 12,
              background: '#fff', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <QRMockup />
            </div>

            <div style={{
              marginTop: 20, padding: 12, borderRadius: 10,
              background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-num)', fontSize: 13,
              color: 'var(--text-secondary)',
            }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                games.zugzag.com/tv/k4f8j2z9w
              </span>
              <button style={{
                background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
                color: 'var(--text-primary)', borderRadius: 6, padding: '6px 10px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>복사</button>
            </div>

            <button onClick={onClose} className="zz-btn zz-btn-primary zz-btn-tall zz-btn-full" style={{ marginTop: 24 }}>
              라이브 보드로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Small QR mockup
function QRMockup() {
  // 21x21 grid pseudo-QR (deterministic)
  const N = 25;
  const cells = [];
  const seed = (i, j) => ((i * 17 + j * 31 + (i+j) * 11) % 7) < 3;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      // Position markers
      const inMarker = (i < 7 && j < 7) || (i < 7 && j > N - 8) || (i > N - 8 && j < 7);
      let fill = false;
      if (inMarker) {
        const cornerI = i < 7 ? i : (i > N - 8 ? N - 1 - i : -1);
        const cornerJ = j < 7 ? j : (j > N - 8 ? N - 1 - j : -1);
        if (cornerI === 0 || cornerI === 6 || cornerJ === 0 || cornerJ === 6) fill = true;
        else if (cornerI >= 2 && cornerI <= 4 && cornerJ >= 2 && cornerJ <= 4) fill = true;
      } else {
        fill = seed(i, j);
      }
      if (fill) cells.push({ i, j });
    }
  }
  const cellSize = 200 / N;
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <rect width="200" height="200" fill="#fff" />
      {cells.map(({ i, j }) => (
        <rect key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="#0A0A0B" />
      ))}
    </svg>
  );
}

// ----- P8 TVTokenGeneratePage (desktop) -----
function TVTokenDesktop() {
  return (
    <div className="zz-screen" style={{ padding: 48, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: 'var(--text-tertiary)' }}>
          <span className="t-body-sm">운영</span>
          <span>/</span>
          <span className="t-body-sm" style={{ color: 'var(--text-primary)' }}>TV 모드</span>
        </div>
        <h1 className="t-title-xl">TV 라이브 보드 URL 발급</h1>
        <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          공용 TV에 띄울 인증 없는 URL을 발급하세요
        </div>

        {/* Form */}
        <div style={{ marginTop: 32, padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16 }}>
          <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>범위</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button style={{
              flex: 1, padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,59,92,0.06)', border: '1px solid var(--accent-ranked)',
              color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
            }}>
              <div className="t-body-md" style={{ fontWeight: 600, color: 'var(--accent-ranked)' }}>시즌 전체</div>
              <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>2026 5월 랭크전</div>
            </button>
            <button style={{
              flex: 1, padding: '14px 16px', borderRadius: 12,
              background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
            }}>
              <div className="t-body-md" style={{ fontWeight: 600 }}>특정 세션</div>
              <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>현재 ranked 1개</div>
            </button>
          </div>

          <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>만료까지</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['24시간', '7일', '30일'].map((d, i) => (
              <button key={d} style={{
                padding: '10px 16px', borderRadius: 9999,
                background: i === 0 ? 'var(--accent-ranked)' : 'var(--bg-canvas)',
                color: i === 0 ? '#fff' : 'var(--text-secondary)',
                border: i === 0 ? 'none' : '1px solid var(--border-default)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>{d}</button>
            ))}
          </div>

          <button className="zz-btn zz-btn-primary zz-btn-tall" style={{ width: '100%', fontSize: 18 }}>
            발급
          </button>

          {/* Result */}
          <div style={{
            marginTop: 24, padding: 24, borderRadius: 16, background: 'var(--bg-canvas)',
            border: '1px dashed var(--border-strong)',
            display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, alignItems: 'center',
          }}>
            <div style={{ width: 160, height: 160, padding: 8, background: '#fff', borderRadius: 12 }}>
              <QRMockup />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600 }}>이 URL을 TV에 띄우세요</div>
              <div className="zz-num" style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                padding: '10px 12px', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                games.zugzag.com/tv/k4f8j2z9w...
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="zz-btn zz-btn-secondary" style={{ flex: 1 }}>URL 복사</button>
                <button className="zz-btn zz-btn-secondary" style={{ flex: 1 }}>QR 다운로드</button>
              </div>
              <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 12, fontFamily: 'var(--font-num)' }}>
                만료 — 24시간 후 (2026-05-14 14:32)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right column — active tokens */}
      <div>
        <div className="t-title-md" style={{ marginBottom: 16 }}>활성 토큰</div>
        {[
          { scope: '시즌 · 2026 5월', created: '2일 전', expires: '22시간 남음' },
          { scope: '세션 · 토요 랭크전', created: '오늘 13:10', expires: '23시간 남음' },
          { scope: '시즌 · 2026 4월', created: '5일 전', expires: '만료됨', expired: true },
        ].map((t, i) => (
          <div key={i} className="zz-card" style={{ padding: 16, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6, opacity: t.expired ? 0.5 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="t-body-md" style={{ fontWeight: 600 }}>{t.scope}</div>
              <button style={{
                background: 'transparent', border: 'none', color: 'var(--accent-alert)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>즉시 취소</button>
            </div>
            <div className="zz-num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              생성 {t.created} · {t.expires}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SeasonCreateDesktop, QuickRankedSheet, TVTokenDesktop, QRMockup });

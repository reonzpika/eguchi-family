import { useState } from "react";

const colors = {
  primary: "#F97B6B",
  primaryLight: "#FDECEA",
  primaryDark: "#E86655",
  secondary: "#F9C784",
  secondaryLight: "#FEF6E7",
  bg: "#FFFAF5",
  surface: "#FFFFFF",
  text: "#2D2D2D",
  muted: "#9E9E9E",
  success: "#7CC9A0",
  successLight: "#EBF7F2",
  border: "#F0E8DF",
  amber: "#F9C784",
  amberLight: "#FEF6E7",
};

const memberColors = {
  Ryo: "#7CC9A0",
  Yoko: "#F9C784",
  Haruhi: "#B5A4E0",
  Natsumi: "#F97B6B",
  Motoharu: "#7BBFDC",
};

// ── tiny helpers ──────────────────────────────────────────────────────────────

function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.surface,
        borderRadius: 16,
        padding: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: `1px solid ${colors.border}`,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        ...style,
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
        }
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", onClick, style, fullWidth }) {
  const base = {
    border: "none",
    borderRadius: 12,
    padding: "14px 20px",
    fontFamily: "'Noto Sans JP', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    width: fullWidth ? "100%" : "auto",
    ...style,
  };
  const variants = {
    primary: { background: colors.primary, color: "#fff" },
    outlined: { background: "transparent", color: colors.primary, border: `2px solid ${colors.primary}` },
    ghost: { background: colors.primaryLight, color: colors.primary },
    amber: { background: colors.amber, color: "#fff" },
    success: { background: colors.success, color: "#fff" },
    muted: { background: colors.border, color: colors.muted },
  };
  return (
    <button
      style={{ ...base, ...variants[variant] }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

function Tag({ children, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: color + "22",
      color: color,
    }}>
      {children}
    </span>
  );
}

function Avatar({ name, size = 32 }) {
  const c = memberColors[name] || colors.primary;
  const initials = name.slice(0, 1);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: c + "33", color: c,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700,
      border: `2px solid ${c}44`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 6, borderRadius: 3,
          flex: 1, maxWidth: 40,
          background: i < current ? colors.primary : colors.border,
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none",
      fontSize: 14, color: colors.muted,
      cursor: "pointer", display: "flex",
      alignItems: "center", gap: 4, padding: 0,
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>
      ← 戻る
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Noto Sans JP', sans-serif",
      fontSize: 18, fontWeight: 700,
      color: colors.text, margin: "0 0 16px",
    }}>
      {children}
    </h2>
  );
}

// ── Bottom Nav ─────────────────────────────────────────────────────────────────

function BottomNav({ active, setScreen }) {
  const tabs = [
    { id: "home", label: "ホーム", icon: "🏠" },
    { id: "ideas", label: "アイデア", icon: "💡" },
    { id: "projects", label: "プロジェクト", icon: "📁" },
    { id: "menu", label: "メニュー", icon: "☰" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%",
      transform: "translateX(-50%)",
      width: "100%", maxWidth: 390,
      background: colors.surface,
      borderTop: `1px solid ${colors.border}`,
      display: "flex",
      zIndex: 100,
      paddingBottom: 8,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setScreen(t.id)}
          style={{
            flex: 1, border: "none",
            background: "none",
            padding: "10px 4px 4px",
            cursor: "pointer",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 2,
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: active === t.id ? 700 : 400,
            color: active === t.id ? colors.primary : colors.muted,
          }}>
            {t.label}
          </span>
          {active === t.id && (
            <div style={{
              width: 4, height: 4, borderRadius: "50%",
              background: colors.primary, marginTop: 2,
            }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Screen: Login ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div style={{
      minHeight: "100%",
      background: `linear-gradient(160deg, #FFF5F0 0%, #FFFAF5 60%, #FFF8EC 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 32,
      textAlign: "center",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 24,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.amber})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 16px",
          boxShadow: `0 8px 24px ${colors.primary}44`,
        }}>
          🌸
        </div>
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 26, fontWeight: 800,
          color: colors.text, margin: "0 0 6px",
          letterSpacing: "-0.5px",
        }}>
          江口ファミリーハブ
        </h1>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 14, color: colors.muted, margin: 0,
        }}>
          家族のプライベートワークスペース
        </p>
      </div>

      {!sent ? (
        <div style={{ width: "100%" }}>
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 14, color: colors.text,
            marginBottom: 20, lineHeight: 1.7,
          }}>
            メールアドレスを入力してください。<br />
            ログインリンクをお送りします。
          </p>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px",
              borderRadius: 12, border: `1.5px solid ${colors.border}`,
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 15, marginBottom: 12,
              background: colors.surface, color: colors.text,
              boxSizing: "border-box", outline: "none",
            }}
          />
          <Button fullWidth onClick={() => setSent(true)}>
            ログインリンクを送る
          </Button>
        </div>
      ) : (
        <Card style={{ width: "100%", textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 14, color: colors.text, lineHeight: 1.7, margin: "0 0 16px",
          }}>
            メールを送りました！<br />
            リンクをクリックしてログインしてください。
          </p>
          <Button fullWidth onClick={onLogin}>
            (デモ) ログインする →
          </Button>
        </Card>
      )}
    </div>
  );
}

// ── Screen: Home (new member) ─────────────────────────────────────────────────

function HomeNewScreen({ setScreen, setOnboarding }) {
  return (
    <div style={{ padding: "32px 20px 100px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 22, fontWeight: 800,
          color: colors.text, margin: "0 0 8px",
        }}>
          こんにちは、菜摘さん！
        </h1>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 14, color: colors.muted, lineHeight: 1.7,
        }}>
          ようこそ江口ファミリーハブへ。<br />
          まず、あなたのアイデアを育てましょう。
        </p>
      </div>

      <SectionTitle>ビジネスアイデアはありますか？</SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card
          onClick={() => { setOnboarding(true); setScreen("onboarding"); }}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, #FF9B8A)`,
            border: "none", padding: "24px 20px",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 4,
          }}>
            はい、あります！
          </div>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6,
          }}>
            AIと一緒にアイデアを<br />育てましょう →
          </div>
        </Card>

        <Card
          onClick={() => setScreen("inspiration")}
          style={{
            border: `2px solid ${colors.amber}`,
            padding: "24px 20px",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 17, fontWeight: 700, color: colors.text, marginBottom: 4,
          }}>
            まだ考え中です
          </div>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 13, color: colors.muted, lineHeight: 1.6,
          }}>
            インスピレーションを<br />もらいましょう →
          </div>
        </Card>
      </div>

      {/* Family activity */}
      <div style={{ marginTop: 32 }}>
        <SectionTitle>家族の最近の動き</SectionTitle>
        {[
          { name: "Ryo", text: "ClinicProを更新しました", time: "1時間前", emoji: "🏥" },
          { name: "Yoko", text: "Cloud9Japanの新記事を追加", time: "昨日", emoji: "🇯🇵" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 0",
            borderBottom: i === 0 ? `1px solid ${colors.border}` : "none",
          }}>
            <Avatar name={item.name} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 13, color: colors.text, marginBottom: 2,
              }}>
                {item.emoji} {item.text}
              </div>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 11, color: colors.muted,
              }}>
                {item.name} · {item.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Home (returning) ──────────────────────────────────────────────────

function HomeReturningScreen({ setScreen }) {
  return (
    <div style={{ padding: "32px 20px 100px" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 13, color: colors.muted, margin: "0 0 4px",
        }}>
          おかえりなさい
        </p>
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 24, fontWeight: 800, color: colors.text, margin: 0,
        }}>
          菜摘さん 🌸
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "アイデア", value: "2件", icon: "💡", color: colors.primary },
          { label: "プロジェクト", value: "1件", icon: "📁", color: colors.success },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 22, fontWeight: 800, color: s.color,
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 11, color: colors.muted,
            }}>
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <Button fullWidth onClick={() => setScreen("onboarding")} style={{ marginBottom: 24 }}>
        ＋ 新しいアイデアを追加する
      </Button>

      {/* Recent */}
      <SectionTitle>最近の更新</SectionTitle>
      {[
        { title: "ラッピングショップ", time: "2日前", tag: "アイデア" },
        { title: "誕生日アドベント", time: "5日前", tag: "アイデア" },
      ].map((item, i) => (
        <Card key={i} onClick={() => setScreen("idea-detail")} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 4,
              }}>
                💡 {item.title}
              </div>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 12, color: colors.muted,
              }}>
                更新: {item.time}
              </div>
            </div>
            <Tag color={colors.primary}>{item.tag}</Tag>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Screen: Onboarding ────────────────────────────────────────────────────────

function OnboardingScreen({ setScreen }) {
  const [step, setStep] = useState(1);
  const [selectedTool, setSelectedTool] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");

  const tools = [
    { id: "chatgpt", label: "ChatGPT", icon: "🤖", url: "https://chat.openai.com", recommended: true },
    { id: "claude", label: "Claude", icon: "✨", url: "https://claude.ai" },
    { id: "perplexity", label: "Perplexity", icon: "🔍", url: "https://perplexity.ai" },
  ];

  const prompt = `私はビジネスアイデアを考えているのですが、まだはっきりとした形になっていません。一度に一つずつ質問しながら、私のアイデアを一緒に整理してもらえますか？

まず最初に「どんなビジネスをやってみたいか、一言で教えてください」と聞いてください。`;

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <BackButton onClick={() => step === 1 ? setScreen("home") : setStep(s => s - 1)} />
      <div style={{ marginTop: 20, marginBottom: 24 }}>
        <ProgressBar current={step} total={3} />
      </div>

      {step === 1 && (
        <>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛠️</div>
            <SectionTitle>AIツールを選んでください</SectionTitle>
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13, color: colors.muted, lineHeight: 1.7,
            }}>
              無料のAIツールでアイデアを育てます。<br />
              どれを使いますか？
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {tools.map(t => (
              <Card
                key={t.id}
                onClick={() => setSelectedTool(t.id)}
                style={{
                  border: selectedTool === t.id
                    ? `2px solid ${colors.primary}`
                    : `1.5px solid ${colors.border}`,
                  display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <span style={{ fontSize: 28 }}>{t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 15, fontWeight: 700, color: colors.text,
                  }}>
                    {t.label}
                  </div>
                  {t.recommended && (
                    <Tag color={colors.success}>おすすめ</Tag>
                  )}
                </div>
                {selectedTool === t.id && (
                  <span style={{ color: colors.primary, fontSize: 20 }}>✓</span>
                )}
              </Card>
            ))}
          </div>
          <Button
            fullWidth
            variant={selectedTool ? "primary" : "muted"}
            onClick={() => selectedTool && setStep(2)}
          >
            次へ →
          </Button>
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 12, color: colors.muted,
            textAlign: "center", marginTop: 12,
          }}>
            迷ったらChatGPTがおすすめです
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <SectionTitle>プロンプトをコピーしてください</SectionTitle>
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13, color: colors.muted, lineHeight: 1.7,
            }}>
              下のボタンを押してコピーし、<br />
              AIツールに貼り付けてください。
            </p>
          </div>

          <Card style={{ background: colors.bg, marginBottom: 16 }}>
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13, color: colors.text, lineHeight: 1.8, margin: 0,
            }}>
              {prompt}
            </p>
          </Card>

          <Button
            fullWidth
            variant={copied ? "success" : "primary"}
            onClick={() => setCopied(true)}
            style={{ marginBottom: 10 }}
          >
            {copied ? "✓ コピーしました！" : "プロンプトをコピーする"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => window.open(tools.find(t => t.id === selectedTool)?.url, "_blank")}
            style={{ marginBottom: 20 }}
          >
            AIツールを開く ↗
          </Button>
          <Button
            fullWidth
            variant={copied ? "ghost" : "muted"}
            onClick={() => copied && setStep(3)}
          >
            AIと話し終わりました → 次へ
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <SectionTitle>AIの返答を貼り付けてください</SectionTitle>
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13, color: colors.muted, lineHeight: 1.7,
            }}>
              AIとの会話の結果をここに<br />
              貼り付けてください。
            </p>
          </div>

          <textarea
            placeholder="ここにAIの返答を貼り付けてください..."
            value={pasted}
            onChange={e => setPasted(e.target.value)}
            style={{
              width: "100%", minHeight: 180,
              padding: "16px", borderRadius: 12,
              border: `1.5px solid ${pasted ? colors.primary : colors.border}`,
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13, color: colors.text,
              background: colors.surface, resize: "vertical",
              boxSizing: "border-box", outline: "none",
              lineHeight: 1.7, marginBottom: 16,
            }}
          />

          <Button
            fullWidth
            variant={pasted.length > 10 ? "primary" : "muted"}
            onClick={() => pasted.length > 10 && setScreen("idea-detail")}
          >
            AIに整理してもらう ✨
          </Button>
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 12, color: colors.muted,
            textAlign: "center", marginTop: 10,
          }}>
            Eguchi HubのAIが内容を整理・改善します
          </p>
        </>
      )}
    </div>
  );
}

// ── Screen: Inspiration ───────────────────────────────────────────────────────

function InspirationScreen({ setScreen }) {
  const questions = [
    { q: "自分が得意なことで、よく頼まれることは？", icon: "🌟" },
    { q: "毎日の生活で「これ不便だな」と感じることは？", icon: "💭" },
    { q: "好きなことや趣味で、世界と共有したいものは？", icon: "❤️" },
  ];
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <BackButton onClick={() => setScreen("home")} />
      <div style={{ marginTop: 20, textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
        <SectionTitle>アイデアのヒント</SectionTitle>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 13, color: colors.muted, lineHeight: 1.7,
        }}>
          次の質問を考えてみてください。<br />
          ピンときたらAIと話してみましょう！
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {questions.map((item, i) => (
          <Card
            key={i}
            onClick={() => setScreen("onboarding")}
            style={{ padding: "20px 16px" }}
          >
            <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>{item.icon}</span>
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 14, color: colors.text, lineHeight: 1.7, margin: "0 0 12px",
            }}>
              {item.q}
            </p>
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 12, color: colors.primary, fontWeight: 600,
            }}>
              このテーマでAIと話す →
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Idea Detail ───────────────────────────────────────────────────────

function IdeaDetailScreen({ setScreen }) {
  const [saved, setSaved] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <BackButton onClick={() => setScreen("ideas")} />
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 22, fontWeight: 800, color: colors.text,
          margin: "0 0 6px",
        }}>
          🎁 ラッピングショップ
        </h1>
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 12, color: colors.muted,
        }}>
          作成: 2024年3月10日
        </div>
      </div>

      {/* AI polished card */}
      <Card style={{ background: `linear-gradient(135deg, ${colors.primaryLight}, #FFF8EC)`, marginBottom: 16 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
        }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <span style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 13, fontWeight: 700, color: colors.primary,
          }}>
            AIが整理しました
          </span>
        </div>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 14, color: colors.text, lineHeight: 1.8, margin: 0,
        }}>
          プレゼント用のラッピング用品（袋、箱、リボンなど）を販売するオンラインショップ。DIYラッピングセットや、誕生日アドベントカレンダーのプレゼント版も展開予定。日本のギフト文化に特化した、こだわりのパッケージングブランドを目指す。
        </p>
      </Card>

      {/* AI Suggestions */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 12,
        }}>
          💬 AIからの提案
        </div>
        {[
          "Instagramとの相性が非常に良いビジネスです",
          "ターゲットを「プレゼントを贈るのが好きな人」に絞るとブランドが明確になります",
          "誕生日アドベントカレンダーは差別化につながる独自商品になりえます",
          "まずはメルカリやCreemaで小さく始めるのがおすすめです",
        ].map((s, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            padding: "8px 0",
            borderBottom: i < 3 ? `1px solid ${colors.border}` : "none",
          }}>
            <span style={{ color: colors.success, fontSize: 14, marginTop: 1 }}>→</span>
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13, color: colors.text, lineHeight: 1.6,
            }}>
              {s}
            </span>
          </div>
        ))}
      </Card>

      {/* Action buttons */}
      {!upgraded ? (
        <>
          <Button
            fullWidth
            variant={saved ? "success" : "primary"}
            onClick={() => setSaved(true)}
            style={{ marginBottom: 10 }}
          >
            {saved ? "✓ 保存しました！" : "💾 アイデアを保存する"}
          </Button>
          {saved && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => { setUpgraded(true); setScreen("living-doc"); }}
            >
              🚀 プロジェクトに昇格する
            </Button>
          )}
        </>
      ) : (
        <Card style={{ background: colors.successLight, border: `1px solid ${colors.success}`, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 14, fontWeight: 700, color: colors.success, margin: 0,
          }}>
            プロジェクトに昇格しました！
          </p>
        </Card>
      )}
    </div>
  );
}

// ── Screen: Ideas List ────────────────────────────────────────────────────────

function IdeasScreen({ setScreen }) {
  const ideas = [
    { title: "ラッピングショップ", date: "2024年3月10日", summary: "プレゼント用ラッピング用品のオンラインショップ" },
    { title: "誕生日アドベントカレンダー", date: "2024年3月8日", summary: "誕生日版のアドベントカレンダーギフト" },
  ];
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>私のアイデア</SectionTitle>
        <Tag color={colors.muted}>🔒 非公開</Tag>
      </div>

      <Card style={{ background: colors.primaryLight, border: `1px dashed ${colors.primary}`, marginBottom: 20, padding: "12px 16px" }}>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 12, color: colors.primary, margin: 0, lineHeight: 1.6,
        }}>
          💡 このページはあなただけが見られます。アイデアはプロジェクトに昇格させると家族に公開されます。
        </p>
      </Card>

      {ideas.map((idea, i) => (
        <Card key={i} onClick={() => setScreen("idea-detail")} style={{ marginBottom: 10 }}>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 4,
          }}>
            💡 {idea.title}
          </div>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 12, color: colors.muted, marginBottom: 8,
          }}>
            {idea.summary}
          </div>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 11, color: colors.muted,
          }}>
            保存日: {idea.date}
          </div>
        </Card>
      ))}

      {/* FAB */}
      <button
        onClick={() => setScreen("onboarding")}
        style={{
          position: "fixed", bottom: 80, right: "calc(50% - 180px)",
          width: 52, height: 52, borderRadius: "50%",
          background: colors.primary, border: "none",
          color: "#fff", fontSize: 24,
          cursor: "pointer", boxShadow: `0 4px 16px ${colors.primary}66`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        ＋
      </button>
    </div>
  );
}

// ── Screen: Projects ──────────────────────────────────────────────────────────

function ProjectsScreen({ setScreen }) {
  const projects = [
    { name: "Ryo", title: "ClinicPro", status: "進行中", statusColor: colors.success, emoji: "🏥", desc: "クリニック向け予約・管理システム" },
    { name: "Yoko", title: "Cloud9 Japan", status: "進行中", statusColor: colors.success, emoji: "🇯🇵", desc: "日本文化・旅行情報サイト" },
    { name: "Natsumi", title: "ラッピングショップ", status: "計画中", statusColor: colors.amber, emoji: "🎁", desc: "プレゼント用ラッピング用品の販売" },
  ];

  const [filter, setFilter] = useState("すべて");
  const filters = ["すべて", "進行中", "計画中"];

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <SectionTitle>プロジェクト</SectionTitle>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              border: "none", borderRadius: 20, padding: "6px 16px",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13, cursor: "pointer", flexShrink: 0,
              background: filter === f ? colors.primary : colors.border,
              color: filter === f ? "#fff" : colors.muted,
              fontWeight: filter === f ? 700 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {projects
        .filter(p => filter === "すべて" || p.status === filter)
        .map((p, i) => (
          <Card
            key={i}
            onClick={() => setScreen("living-doc")}
            style={{ marginBottom: 12 }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: memberColors[p.name] + "22",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>
                {p.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 2,
                }}>
                  {p.title}
                </div>
                <div style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 12, color: colors.muted, marginBottom: 8,
                }}>
                  {p.desc}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={p.name} size={20} />
                  <span style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 12, color: colors.muted,
                  }}>
                    {p.name}
                  </span>
                  <Tag color={p.statusColor}>{p.status}</Tag>
                </div>
              </div>
            </div>
          </Card>
        ))}
    </div>
  );
}

// ── Screen: Living Document ───────────────────────────────────────────────────

function LivingDocScreen({ setScreen }) {
  const [tab, setTab] = useState("content");
  const [showUpdate, setShowUpdate] = useState(false);
  const [newInput, setNewInput] = useState("");

  const history = [
    { version: "v3", date: "3日前", summary: "ターゲット層と価格帯を追加" },
    { version: "v2", date: "1週間前", summary: "製品アイデアを詳細化" },
    { version: "v1", date: "2週間前", summary: "初版作成" },
  ];

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <BackButton onClick={() => setScreen("projects")} />
        <Tag color={colors.success}>公開中</Tag>
      </div>

      <div style={{ marginTop: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Avatar name="Natsumi" size={28} />
          <span style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 12, color: colors.muted,
          }}>
            菜摘のプロジェクト · 最終更新 3日前
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 22, fontWeight: 800, color: colors.text, margin: 0,
        }}>
          🎁 ラッピングショップ
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `2px solid ${colors.border}`, marginBottom: 20 }}>
        {[{ id: "content", label: "内容" }, { id: "history", label: "更新履歴" }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              border: "none", background: "none",
              padding: "8px 20px", cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 14, fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? colors.primary : colors.muted,
              borderBottom: tab === t.id ? `2px solid ${colors.primary}` : "2px solid transparent",
              marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <>
          {[
            { title: "🎯 ビジョン", body: "日本のギフト文化を大切にした、こだわりのラッピング用品ブランド。贈る人の気持ちを形にする。" },
            { title: "📦 製品アイデア", body: "プレゼント用バッグ・箱・リボンセット、DIYラッピングキット、誕生日アドベントカレンダーのプレゼント版" },
            { title: "👥 ターゲット", body: "プレゼントを贈るのが好きな20〜40代の女性。特に記念日を大切にする層。" },
            { title: "🛒 販売チャンネル", body: "まずはメルカリ・Creemaで小さくスタート。Instagramで認知を広げる。" },
            { title: "📋 次のステップ", body: "① 商品サンプルを3種類作る ② 写真撮影 ③ Creemaに出品" },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 6,
              }}>
                {section.title}
              </div>
              <p style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 13, color: colors.text,
                lineHeight: 1.8, margin: 0,
                padding: "12px 14px",
                background: colors.bg,
                borderRadius: 10,
                borderLeft: `3px solid ${colors.primary}`,
              }}>
                {section.body}
              </p>
            </div>
          ))}

          {!showUpdate ? (
            <Button fullWidth onClick={() => setShowUpdate(true)}>
              ＋ 新しい内容を追加して更新する
            </Button>
          ) : (
            <Card style={{ border: `1.5px solid ${colors.primary}` }}>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 10,
              }}>
                AIとの会話を貼り付けてください
              </div>
              <textarea
                placeholder="最新のブレインストーミング結果を貼り付け..."
                value={newInput}
                onChange={e => setNewInput(e.target.value)}
                style={{
                  width: "100%", minHeight: 120,
                  padding: 12, borderRadius: 10,
                  border: `1.5px solid ${colors.border}`,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 13, color: colors.text,
                  background: colors.bg, resize: "vertical",
                  boxSizing: "border-box", outline: "none",
                  lineHeight: 1.7, marginBottom: 10,
                }}
              />
              <Button fullWidth onClick={() => setShowUpdate(false)}>
                ドキュメントを更新する ✨
              </Button>
            </Card>
          )}
        </>
      )}

      {tab === "history" && (
        <div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              padding: "14px 0",
              borderBottom: i < history.length - 1 ? `1px solid ${colors.border}` : "none",
            }}>
              <Tag color={colors.primary}>{h.version}</Tag>
              <div>
                <div style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 13, color: colors.text, marginBottom: 2,
                }}>
                  {h.summary}
                </div>
                <div style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 11, color: colors.muted,
                }}>
                  {h.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Screen: Menu ──────────────────────────────────────────────────────────────

function MenuScreen({ setScreen, onLogout }) {
  const menuItems = [
    { icon: "🏢", label: "ファミリーショーケース", screen: "showcase" },
    { icon: "📚", label: "学習リソース", screen: "learning" },
    { icon: "👤", label: "プロフィール設定", screen: null },
  ];

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <SectionTitle>メニュー</SectionTitle>

      <Card style={{ marginBottom: 20, padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name="Natsumi" size={48} />
          <div>
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 17, fontWeight: 700, color: colors.text,
            }}>
              菜摘
            </div>
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 12, color: colors.muted,
            }}>
              natsumi@example.com
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => item.screen && setScreen(item.screen)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px", borderRadius: 12,
              border: "none", background: "none",
              cursor: "pointer", width: "100%",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = colors.border}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <span style={{ fontSize: 20, width: 28 }}>{item.icon}</span>
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 15, color: colors.text, flex: 1, textAlign: "left",
            }}>
              {item.label}
            </span>
            <span style={{ color: colors.muted }}>›</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Button fullWidth variant="outlined" onClick={onLogout}>
          ログアウト
        </Button>
      </div>

      {/* Family members */}
      <div style={{ marginTop: 28 }}>
        <SectionTitle>家族メンバー</SectionTitle>
        {[
          { name: "Ryo", role: "管理者" },
          { name: "Yoko", role: "メンバー" },
          { name: "Haruhi", role: "メンバー" },
          { name: "Natsumi", role: "メンバー (あなた)" },
          { name: "Motoharu", role: "メンバー" },
        ].map((m, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0",
            borderBottom: i < 4 ? `1px solid ${colors.border}` : "none",
          }}>
            <Avatar name={m.name} size={36} />
            <div>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 14, fontWeight: 600, color: colors.text,
              }}>
                {m.name}
              </div>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 11, color: colors.muted,
              }}>
                {m.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Showcase ──────────────────────────────────────────────────────────

function ShowcaseScreen({ setScreen }) {
  const businesses = [
    { name: "Ryo", title: "ClinicPro", url: "clinicpro.co.nz", emoji: "🏥", desc: "クリニック向け予約・管理システム", live: true },
    { name: "Yoko", title: "Cloud9 Japan", url: "cloud9japan.com", emoji: "🇯🇵", desc: "日本文化・旅行情報サイト", live: true },
    { name: "Ryo", title: "Ahuru Candles", url: "ahurucandles.co.nz", emoji: "🕯️", desc: "NZのハンドメイドキャンドルブランド", live: true },
    { name: "Ryo", title: "Miozuki", url: "miozuki.co.nz", emoji: "🌙", desc: "近日公開", live: true },
    { name: "Natsumi", title: "ラッピングショップ", url: null, emoji: "🎁", desc: "プレゼント用ラッピング用品 (準備中)", live: false },
    { name: "Haruhi", title: "はるひのプロジェクト", url: null, emoji: "🌸", desc: "近日公開 🌱", live: false },
  ];

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <BackButton onClick={() => setScreen("menu")} />
      <div style={{ marginTop: 20, marginBottom: 24 }}>
        <SectionTitle>江口ファミリーのビジネス</SectionTitle>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 13, color: colors.muted,
        }}>
          家族のプロジェクトをすべて紹介します
        </p>
      </div>

      {businesses.map((b, i) => (
        <Card
          key={i}
          style={{
            marginBottom: 12,
            border: b.live ? `1px solid ${colors.border}` : `1.5px dashed ${colors.border}`,
            opacity: b.live ? 1 : 0.7,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: (memberColors[b.name] || colors.primary) + "22",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
            }}>
              {b.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 2,
              }}>
                {b.title}
              </div>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 12, color: colors.muted, marginBottom: 6,
              }}>
                {b.desc}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={b.name} size={18} />
                <span style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 11, color: colors.muted,
                }}>
                  {b.name}
                </span>
                {b.url && (
                  <span style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: 11, color: colors.primary,
                  }}>
                    · {b.url} ↗
                  </span>
                )}
                {!b.live && <Tag color={colors.amber}>準備中</Tag>}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Screen: Learning Hub ──────────────────────────────────────────────────────

function LearningScreen({ setScreen }) {
  const [filter, setFilter] = useState("すべて");
  const filters = ["すべて", "HTML/CSS", "ビジネス", "AI", "EC"];

  const resources = [
    { title: "HTMLとCSSの基本", category: "HTML/CSS", target: "Haruhi", icon: "💻", level: "入門" },
    { title: "Shopifyでネットショップを始める", category: "EC", target: "Natsumi", icon: "🛒", level: "入門" },
    { title: "ChatGPTをビジネスに使う方法", category: "AI", target: null, icon: "🤖", level: "入門" },
    { title: "SNSマーケティング基礎", category: "ビジネス", target: "Natsumi", icon: "📱", level: "入門" },
    { title: "はじめてのウェブサイト公開", category: "HTML/CSS", target: "Haruhi", icon: "🌐", level: "中級" },
  ];

  const filtered = filter === "すべて" ? resources : resources.filter(r => r.category === filter);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <BackButton onClick={() => setScreen("menu")} />
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <SectionTitle>学習リソース</SectionTitle>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              border: "none", borderRadius: 20, padding: "6px 16px",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13, cursor: "pointer", flexShrink: 0,
              background: filter === f ? colors.primary : colors.border,
              color: filter === f ? "#fff" : colors.muted,
              fontWeight: filter === f ? 700 : 400,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.map((r, i) => (
        <Card key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: colors.primaryLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>
              {r.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 4,
              }}>
                {r.title}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Tag color={colors.muted}>{r.category}</Tag>
                <Tag color={colors.secondary === r.level ? colors.amber : colors.muted}>{r.level}</Tag>
                {r.target && (
                  <Tag color={memberColors[r.target] || colors.primary}>
                    {r.target}さんにおすすめ
                  </Tag>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────

const SCREENS_WITH_NAV = ["home", "ideas", "projects", "menu", "idea-detail", "showcase", "learning", "living-doc"];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState("home");
  const [isNewMember, setIsNewMember] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  const activeTab = ["home"].includes(screen) ? "home"
    : ["ideas", "idea-detail"].includes(screen) ? "ideas"
    : ["projects", "living-doc"].includes(screen) ? "projects"
    : ["menu", "showcase", "learning"].includes(screen) ? "menu"
    : screen;

  const renderScreen = () => {
    if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
    switch (screen) {
      case "home":
        return isNewMember
          ? <HomeNewScreen setScreen={setScreen} setOnboarding={setOnboarding} />
          : <HomeReturningScreen setScreen={setScreen} />;
      case "onboarding": return <OnboardingScreen setScreen={setScreen} />;
      case "inspiration": return <InspirationScreen setScreen={setScreen} />;
      case "idea-detail": return <IdeaDetailScreen setScreen={setScreen} />;
      case "ideas": return <IdeasScreen setScreen={setScreen} />;
      case "projects": return <ProjectsScreen setScreen={setScreen} />;
      case "living-doc": return <LivingDocScreen setScreen={setScreen} />;
      case "menu": return <MenuScreen setScreen={setScreen} onLogout={() => setLoggedIn(false)} />;
      case "showcase": return <ShowcaseScreen setScreen={setScreen} />;
      case "learning": return <LearningScreen setScreen={setScreen} />;
      default: return <HomeNewScreen setScreen={setScreen} setOnboarding={setOnboarding} />;
    }
  };

  const showNav = loggedIn && SCREENS_WITH_NAV.includes(screen);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #E8E0D8; font-family: 'Noto Sans JP', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E0D8D0; border-radius: 2px; }
      `}</style>

      {/* Demo nav bar */}
      {loggedIn && (
        <div style={{
          position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 390,
          background: "rgba(255,250,245,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${colors.border}`,
          padding: "10px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          zIndex: 200,
        }}>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 14, fontWeight: 800, color: colors.text,
          }}>
            🌸 江口ファミリーハブ
          </div>
          {isNewMember ? (
            <button onClick={() => setIsNewMember(false)} style={{
              border: "none", background: colors.primaryLight, borderRadius: 8,
              padding: "4px 10px", fontSize: 11, color: colors.primary,
              cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600,
            }}>
              リピーター表示に切替
            </button>
          ) : (
            <button onClick={() => setIsNewMember(true)} style={{
              border: "none", background: colors.primaryLight, borderRadius: 8,
              padding: "4px 10px", fontSize: 11, color: colors.primary,
              cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600,
            }}>
              新規ユーザー表示に切替
            </button>
          )}
        </div>
      )}

      <div style={{
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100vh",
        background: colors.bg,
        position: "relative",
        overflow: "hidden",
        paddingTop: loggedIn ? 52 : 0,
      }}>
        <div style={{ overflowY: "auto", height: "100vh" }}>
          {renderScreen()}
        </div>
      </div>

      {showNav && (
        <BottomNav
          active={activeTab}
          setScreen={(s) => {
            if (s === "home") setScreen("home");
            else setScreen(s);
          }}
        />
      )}
    </>
  );
}

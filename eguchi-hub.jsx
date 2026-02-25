import { useState } from "react";

const theme = {
  coral: "#F97B6B",
  amber: "#F9C784",
  bg: "#FFFAF5",
  surface: "#FFFFFF",
  text: "#2D2D2D",
  muted: "#9E9E9E",
  success: "#7CC9A0",
  border: "#F0E8DF",
  softCoral: "#FEF0EE",
  softAmber: "#FEF8EE",
};

const styles = {
  app: {
    fontFamily: "'Noto Sans JP', sans-serif",
    background: theme.bg,
    minHeight: "100vh",
    maxWidth: 390,
    margin: "0 auto",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  screen: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: 80,
  },
};

const members = [
  { id: 1, name: "涼", fullName: "江口 涼", emoji: "👨‍💻", color: "#6B9EF9" },
  { id: 2, name: "洋子", fullName: "江口 洋子", emoji: "🌸", color: "#F97B6B" },
  { id: 3, name: "はるひ", fullName: "江口 はるひ", emoji: "🌿", color: "#7CC9A0" },
  { id: 4, name: "菜摘", fullName: "江口 菜摘", emoji: "🎁", color: "#F9C784" },
  { id: 5, name: "元春", fullName: "江口 元春", emoji: "⭐", color: "#C4A0F9" },
];

const sampleIdeas = [
  { id: 1, title: "ラッピングショップ", summary: "プレゼント用のラッピング用品を販売するオンラインショップ。袋・箱・リボンのセット販売。", date: "2024年3月10日", owner: "菜摘", upgraded: true },
  { id: 2, title: "誕生日アドベントカレンダー", summary: "クリスマスのアドベントカレンダーの誕生日版。毎日小さなプレゼントを贈るセット。", date: "2024年3月8日", owner: "菜摘", upgraded: false },
  { id: 3, title: "幼児食献立アプリ", summary: "幼い子どもの食事メニューを毎日提案してくれるアプリ。日本語対応。", date: "2024年3月5日", owner: "はるひ", upgraded: false },
];

const businesses = [
  { name: "ClinicPro", owner: "涼", url: "clinicpro.co.nz", emoji: "🏥", live: true },
  { name: "Ahuru Candles", owner: "妻", url: "ahurucandles.co.nz", emoji: "🕯️", live: true },
  { name: "Miozuki", owner: "妻", url: "miozuki.co.nz", emoji: "🌙", live: true },
  { name: "Cloud9 Japan", owner: "洋子", url: "cloud9japan.com", emoji: "☁️", live: true },
  { name: "菜摘のショップ", owner: "菜摘", url: "", emoji: "🎁", live: false },
  { name: "はるひのアプリ", owner: "はるひ", url: "", emoji: "🌿", live: false },
];

const resources = [
  { title: "HTMLとCSSの基本", tag: "HTML/CSS", for: "はるひ", emoji: "📖" },
  { title: "Shopifyで始めるネットショップ", tag: "EC", for: "菜摘", emoji: "🛒" },
  { title: "ChatGPTの使い方入門", tag: "AI", for: "全員", emoji: "🤖" },
  { title: "Instagramで集客する方法", tag: "マーケティング", for: "菜摘", emoji: "📸" },
  { title: "ビジネスアイデアの考え方", tag: "ビジネス", for: "全員", emoji: "💡" },
  { title: "Canvaで画像を作ろう", tag: "デザイン", for: "はるひ", emoji: "🎨" },
];

// ── Components ──────────────────────────────────────────────

function Button({ children, onClick, variant = "primary", style = {}, small = false }) {
  const base = {
    border: "none",
    borderRadius: 12,
    fontFamily: "'Noto Sans JP', sans-serif",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: small ? 13 : 15,
    padding: small ? "8px 16px" : "14px 20px",
    width: variant === "ghost" ? "auto" : "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };
  const variants = {
    primary: { background: theme.coral, color: "#fff" },
    secondary: { background: theme.softCoral, color: theme.coral, border: `2px solid ${theme.coral}` },
    amber: { background: theme.amber, color: "#7A5C00" },
    ghost: { background: "transparent", color: theme.muted, width: "auto" },
    outline: { background: "transparent", color: theme.coral, border: `2px solid ${theme.coral}` },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.surface,
        borderRadius: 16,
        padding: "16px",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : "default",
        transition: onClick ? "transform 0.1s ease" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Tag({ children, color = theme.coral }) {
  return (
    <span style={{
      background: color + "22",
      color: color,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 600,
    }}>
      {children}
    </span>
  );
}

function TopBar({ title, onBack }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "16px 20px 8px",
      gap: 12,
      background: theme.bg,
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          width: 36,
          height: 36,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}>←</button>
      )}
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: theme.text }}>{title}</h2>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: "home", label: "ホーム", icon: "🏠" },
    { id: "ideas", label: "アイデア", icon: "💡" },
    { id: "projects", label: "プロジェクト", icon: "📁" },
    { id: "menu", label: "メニュー", icon: "☰" },
  ];
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 390,
      background: theme.surface,
      borderTop: `1px solid ${theme.border}`,
      display: "flex",
      zIndex: 100,
      paddingBottom: 8,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "10px 4px 4px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{
            fontSize: 10,
            fontFamily: "'Noto Sans JP', sans-serif",
            color: tab === t.id ? theme.coral : theme.muted,
            fontWeight: tab === t.id ? 700 : 400,
          }}>{t.label}</span>
          {tab === t.id && (
            <div style={{ width: 4, height: 4, borderRadius: 2, background: theme.coral }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Screens ──────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #FFF5F0 0%, #FFFAF5 60%, #FFF8EE 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      gap: 0,
    }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏡</div>
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 28,
          fontWeight: 900,
          color: theme.text,
          margin: 0,
          letterSpacing: "-0.5px",
        }}>江口ハブ</h1>
        <p style={{ color: theme.muted, fontSize: 14, marginTop: 8 }}>
          江口家のプライベートワークスペース
        </p>
      </div>

      <Card style={{ width: "100%", maxWidth: 340 }}>
        <p style={{ color: theme.muted, fontSize: 13, marginTop: 0, marginBottom: 16, textAlign: "center" }}>
          メンバーを選んでください
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              style={{
                background: selected === m.id ? m.color + "22" : theme.bg,
                border: `2px solid ${selected === m.id ? m.color : theme.border}`,
                borderRadius: 12,
                padding: "12px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: "'Noto Sans JP', sans-serif",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 22 }}>{m.emoji}</span>
              <span style={{ fontWeight: 600, color: theme.text, fontSize: 15 }}>{m.fullName}</span>
              {selected === m.id && <span style={{ marginLeft: "auto", color: m.color }}>✓</span>}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <Button onClick={() => selected && onLogin(members.find(m => m.id === selected))} style={{ opacity: selected ? 1 : 0.5 }}>
            ログイン →
          </Button>
        </div>
      </Card>

      <p style={{ color: theme.muted, fontSize: 12, marginTop: 24, textAlign: "center" }}>
        🔒 このサイトは江口家専用です
      </p>
    </div>
  );
}

function HomeScreen({ user, setTab, setSubScreen }) {
  const isNew = user.id === 3 || user.id === 4 || user.id === 5;

  if (isNew && user.id !== 1) {
    return (
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.coral}22, ${theme.amber}22)`,
          borderRadius: 20,
          padding: "24px 20px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{user.emoji}</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: theme.text }}>
            こんにちは、{user.name}さん！
          </h2>
          <p style={{ color: theme.muted, fontSize: 14, marginTop: 6 }}>
            ビジネスアイデアを育てましょう 🌱
          </p>
        </div>

        <p style={{ color: theme.text, fontSize: 15, fontWeight: 600, margin: 0 }}>
          ビジネスアイデアはありますか？
        </p>

        <button
          onClick={() => setSubScreen("onboarding-yes")}
          style={{
            background: `linear-gradient(135deg, ${theme.coral}, #F9826B)`,
            border: "none",
            borderRadius: 16,
            padding: "20px",
            cursor: "pointer",
            textAlign: "left",
            boxShadow: `0 4px 16px ${theme.coral}44`,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>
            はい、あります！
          </div>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
            アイデアを育てましょう →
          </div>
        </button>

        <button
          onClick={() => setSubScreen("onboarding-no")}
          style={{
            background: theme.surface,
            border: `2px solid ${theme.amber}`,
            borderRadius: 16,
            padding: "20px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>🤔</div>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700, fontSize: 16, color: theme.text }}>
            まだ考え中です
          </div>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13, color: theme.muted, marginTop: 4 }}>
            インスピレーションをもらう →
          </div>
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: `linear-gradient(135deg, ${theme.coral}22, ${theme.amber}22)`,
        borderRadius: 20,
        padding: "20px",
      }}>
        <div style={{ fontSize: 32 }}>{user.emoji}</div>
        <h2 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 800, color: theme.text }}>
          おかえりなさい、{user.name}さん！
        </h2>
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>今日も一緒に頑張りましょう</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "アイデア", count: "2件", emoji: "💡", color: theme.coral },
          { label: "プロジェクト", count: "1件", emoji: "📁", color: "#6B9EF9" },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 24 }}>{s.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: s.color, margin: "4px 0 2px" }}>{s.count}</div>
            <div style={{ fontSize: 12, color: theme.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: theme.muted, margin: "0 0 10px" }}>最近の活動</p>
        {[
          { text: "「ラッピングショップ」を更新しました", time: "2日前" },
          { text: "「誕生日アドベント」を保存しました", time: "5日前" },
        ].map((a, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: `1px solid ${theme.border}`,
            fontSize: 13,
          }}>
            <span style={{ color: theme.text }}>{a.text}</span>
            <span style={{ color: theme.muted, flexShrink: 0, marginLeft: 8 }}>{a.time}</span>
          </div>
        ))}
      </div>

      <Button onClick={() => setSubScreen("onboarding-yes")}>＋ 新しいアイデアを追加する</Button>
    </div>
  );
}

function OnboardingYes({ onBack, setSubScreen }) {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [aiDone, setAiDone] = useState(false);

  const prompt = `私はビジネスアイデアを考えているのですが、まだはっきりとした形になっていません。一度に一つずつ質問しながら、私のアイデアを一緒に整理してもらえますか？\n\nまず最初に、「どんなビジネスをやってみたいか、一言で教えてください」と聞いてください。`;

  const tools = [
    { name: "ChatGPT", emoji: "🟢", url: "https://chat.openai.com", rec: true },
    { name: "Claude", emoji: "🟠", url: "https://claude.ai" },
    { name: "Perplexity", emoji: "🔵", url: "https://perplexity.ai" },
  ];

  const [selectedTool, setSelectedTool] = useState(null);

  const progress = ["", "●○○", "●●○", "●●●"];

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20, minHeight: "80vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: theme.muted, marginBottom: 4 }}>ステップ {step} / 3</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? theme.coral : theme.border, transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: theme.text }}>AIツールを選んでください</h3>
            <p style={{ margin: 0, color: theme.muted, fontSize: 14 }}>まず、無料のAIツールでアイデアを育てましょう。どれを使いますか？</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tools.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedTool(t.name)}
                style={{
                  background: selectedTool === t.name ? theme.softCoral : theme.surface,
                  border: `2px solid ${selectedTool === t.name ? theme.coral : theme.border}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                <span style={{ fontSize: 24 }}>{t.emoji}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{t.name}</div>
                  {t.rec && <div style={{ fontSize: 11, color: theme.coral }}>★ 初めての方におすすめ</div>}
                </div>
                {selectedTool === t.name && <span style={{ marginLeft: "auto", color: theme.coral, fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>
          <div style={{ marginTop: "auto" }}>
            <Button onClick={() => selectedTool && setStep(2)} style={{ opacity: selectedTool ? 1 : 0.5 }}>
              次へ →
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: theme.text }}>プロンプトをコピーしてください</h3>
            <p style={{ margin: 0, color: theme.muted, fontSize: 14 }}>下のボタンを押してコピーし、{selectedTool}に貼り付けてください。</p>
          </div>
          <div style={{
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 16,
            fontSize: 13,
            color: theme.text,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}>
            {prompt}
          </div>
          <Button
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            variant={copied ? "secondary" : "primary"}
          >
            {copied ? "✓ コピーしました！" : "📋 プロンプトをコピーする"}
          </Button>
          <a
            href={tools.find(t => t.name === selectedTool)?.url}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Button variant="outline">{selectedTool}を開く →</Button>
          </a>
          <p style={{ textAlign: "center", color: theme.muted, fontSize: 13, margin: 0 }}>
            AIと話し終わったら次のステップへ
          </p>
          <Button variant="ghost" onClick={() => setStep(3)} style={{ color: theme.coral }}>
            次へ進む →
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: theme.text }}>AIの返答を貼り付けてください</h3>
            <p style={{ margin: 0, color: theme.muted, fontSize: 14 }}>AIとの会話の結果をここに貼ってください。江口ハブが整理してくれます！</p>
          </div>
          <textarea
            value={pasted}
            onChange={e => setPasted(e.target.value)}
            placeholder="ここにAIの返答を貼り付けてください..."
            style={{
              width: "100%",
              minHeight: 180,
              borderRadius: 12,
              border: `1px solid ${theme.border}`,
              padding: 14,
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 14,
              color: theme.text,
              background: theme.surface,
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {!aiDone ? (
            <Button
              onClick={() => pasted.length > 0 && setAiDone(true)}
              style={{ opacity: pasted.length > 0 ? 1 : 0.5 }}
            >
              ✨ AIに整理してもらう
            </Button>
          ) : (
            <div>
              <Card style={{ background: theme.softCoral, borderColor: theme.coral + "44", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: theme.coral, marginBottom: 8 }}>✨ AIが整理しました</div>
                <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.7 }}>
                  プレゼント用のラッピング用品を販売するオンラインショップ。袋・箱・リボンのセット販売が中心で、誕生日アドベントカレンダーとの組み合わせ商品も展開できる可能性があります。
                </div>
              </Card>
              <Button onClick={() => setSubScreen("idea-detail")}>
                💾 アイデアを保存する
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OnboardingNo({ onBack, setSubScreen }) {
  const prompts = [
    { q: "人によく頼まれることは何ですか？", emoji: "🤝" },
    { q: "毎日使っていて「もっとよくなればいいのに」と思うものは？", emoji: "💭" },
    { q: "大好きなことを仕事にするとしたら？", emoji: "❤️" },
  ];
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>←</button>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.text }}>インスピレーション</h3>
      </div>
      <p style={{ color: theme.muted, fontSize: 14, margin: 0 }}>
        アイデアはゼロから生まれません。まずは考えてみましょう 💡
      </p>
      {prompts.map((p, i) => (
        <Card key={i} style={{ background: theme.softAmber }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>{p.emoji}</div>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: theme.text, lineHeight: 1.6 }}>{p.q}</p>
          <Button small onClick={() => setSubScreen("onboarding-yes")} variant="amber">
            このテーマで考えてみる →
          </Button>
        </Card>
      ))}
    </div>
  );
}

function IdeasScreen({ setSubScreen }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      <TopBar title="私のアイデア" />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 13, color: theme.muted, margin: "4px 0 8px" }}>
          🔒 アイデアはあなただけに見えています
        </p>
        {sampleIdeas.map(idea => (
          <Card
            key={idea.id}
            onClick={() => setSubScreen("idea-detail")}
            style={{ cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>💡 {idea.title}</div>
              {idea.upgraded && <Tag>プロジェクト済</Tag>}
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: theme.muted, lineHeight: 1.6 }}>{idea.summary}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: theme.muted }}>{idea.date}</span>
              <span style={{ fontSize: 12, color: theme.coral, fontWeight: 600 }}>詳細を見る →</span>
            </div>
          </Card>
        ))}
        <button
          onClick={() => setSubScreen("onboarding-yes")}
          style={{
            background: "transparent",
            border: `2px dashed ${theme.border}`,
            borderRadius: 16,
            padding: "20px",
            cursor: "pointer",
            color: theme.muted,
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 14,
          }}
        >
          ＋ 新しいアイデアを追加する
        </button>
      </div>
    </div>
  );
}

function IdeaDetailScreen({ onBack, setSubScreen }) {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ padding: "0 0 20px" }}>
      <TopBar title="アイデアの詳細" onBack={onBack} />
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.muted, marginBottom: 4 }}>タイトル</div>
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 16,
            fontWeight: 700,
            color: theme.text,
          }}>
            ラッピングショップ
          </div>
        </div>

        <Card style={{ background: theme.softCoral, borderColor: theme.coral + "33" }}>
          <div style={{ fontWeight: 700, color: theme.coral, marginBottom: 10, fontSize: 14 }}>✨ AIが整理しました</div>
          <p style={{ margin: 0, fontSize: 14, color: theme.text, lineHeight: 1.7 }}>
            プレゼント用のラッピング用品を販売するオンラインショップ。袋・箱・リボンのセット販売が中心で、誕生日アドベントカレンダーとの組み合わせ商品も展開できる可能性があります。
          </p>
        </Card>

        <details style={{ cursor: "pointer" }}>
          <summary style={{ fontWeight: 700, fontSize: 14, color: theme.text, padding: "4px 0" }}>
            ▼ AIからの提案
          </summary>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "ターゲット層を「20-30代の女性」に絞るとブランドが明確になります",
              "Instagramとの相性が非常に良さそうです",
              "誕生日アドベントと組み合わせると差別化できます",
            ].map((s, i) => (
              <div key={i} style={{
                background: theme.softAmber,
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 13,
                color: theme.text,
                lineHeight: 1.6,
              }}>
                💡 {s}
              </div>
            ))}
          </div>
        </details>

        <Button
          onClick={() => setSaved(true)}
          variant={saved ? "secondary" : "primary"}
        >
          {saved ? "✓ 保存しました" : "💾 保存する"}
        </Button>

        <Button variant="outline" onClick={() => setSubScreen("living-doc")}>
          🚀 プロジェクトに昇格する
        </Button>
      </div>
    </div>
  );
}

function ProjectsScreen({ setSubScreen }) {
  const projects = [
    { title: "ClinicPro", owner: "涼", emoji: "🏥", status: "進行中", color: "#6B9EF9" },
    { title: "Ahuru Candles", owner: "妻", emoji: "🕯️", status: "進行中", color: theme.coral },
    { title: "Cloud9 Japan", owner: "洋子", emoji: "☁️", status: "進行中", color: "#7CC9A0" },
    { title: "ラッピングショップ", owner: "菜摘", emoji: "🎁", status: "計画中", color: theme.amber },
  ];
  const statusColor = { "進行中": theme.success, "計画中": theme.amber, "完了": theme.muted };

  return (
    <div style={{ padding: "0 0 20px" }}>
      <TopBar title="プロジェクト" />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 13, color: theme.muted, margin: "4px 0 8px" }}>
          家族全員のプロジェクトが見られます 👀
        </p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {["すべて", "進行中", "計画中"].map(f => (
            <button key={f} style={{
              background: f === "すべて" ? theme.coral : theme.surface,
              color: f === "すべて" ? "#fff" : theme.muted,
              border: `1px solid ${f === "すべて" ? theme.coral : theme.border}`,
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>{f}</button>
          ))}
        </div>
        {projects.map((p, i) => (
          <Card key={i} onClick={() => setSubScreen("living-doc")} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: p.color + "22",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{p.title}</div>
                <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{p.owner}</div>
              </div>
              <div>
                <Tag color={statusColor[p.status]}>{p.status}</Tag>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LivingDocScreen({ onBack }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      <TopBar title="リビングドキュメント" onBack={onBack} />
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Card style={{ background: `linear-gradient(135deg, ${theme.amber}22, ${theme.coral}22)` }}>
          <div style={{ fontSize: 28 }}>🎁</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: theme.text, marginTop: 6 }}>ラッピングショップ</div>
          <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>菜摘さんのプロジェクト · 最終更新: 3日前</div>
          <Tag style={{ marginTop: 8 }} color={theme.success}>公開中</Tag>
        </Card>

        <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}` }}>
          {["内容", "更新履歴"].map((t, i) => (
            <button key={t} style={{
              flex: 1, background: "transparent", border: "none",
              borderBottom: i === 0 ? `2px solid ${theme.coral}` : "none",
              color: i === 0 ? theme.coral : theme.muted,
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: i === 0 ? 700 : 400,
              padding: "10px 0", cursor: "pointer", fontSize: 14,
            }}>{t}</button>
          ))}
        </div>

        {[
          { heading: "🎯 ビジョン", body: "プレゼントを渡す瞬間をもっと特別にしたい。そんな想いから始まった、ラッピング専門のオンラインショップです。" },
          { heading: "🛍️ 製品アイデア", body: "袋・箱・リボンのセット販売。DIYラッピングキット。誕生日アドベントカレンダー版（特許検討中）。" },
          { heading: "👤 ターゲット", body: "プレゼントをよく贈る20〜30代の女性。Instagramで発見してもらえる可能性が高い。" },
          { heading: "📋 次のステップ", body: "1. Instagramアカウント作成\n2. 試作品を作って写真撮影\n3. Shopifyで仮ストアを作る" },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontWeight: 700, fontSize: 14, color: theme.text, marginBottom: 6 }}>{s.heading}</div>
            <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{s.body}</p>
          </div>
        ))}

        <div style={{
          position: "sticky",
          bottom: 80,
          background: theme.bg,
          paddingTop: 12,
        }}>
          <Button>＋ 新しいアイデアを追加して更新する</Button>
        </div>
      </div>
    </div>
  );
}

function MenuScreen({ user, setTab, setSubScreen, onLogout }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      <TopBar title="メニュー" />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <Card style={{ background: `linear-gradient(135deg, ${theme.coral}22, ${theme.amber}22)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 36 }}>{user.emoji}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: theme.text }}>{user.fullName}</div>
              <div style={{ fontSize: 12, color: theme.muted }}>江口ファミリー メンバー</div>
            </div>
          </div>
        </Card>

        {[
          { label: "🏢 ファミリーショーケース", sub: "みんなのビジネスを見る", screen: "showcase" },
          { label: "📚 学習リソース", sub: "スキルアップしよう", screen: "resources" },
        ].map(item => (
          <Card key={item.label} onClick={() => setSubScreen(item.screen)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{item.label}</div>
                <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{item.sub}</div>
              </div>
              <span style={{ color: theme.muted }}>→</span>
            </div>
          </Card>
        ))}

        <Button variant="ghost" onClick={onLogout} style={{ color: theme.muted, marginTop: 8 }}>
          ログアウト
        </Button>
      </div>
    </div>
  );
}

function ShowcaseScreen({ onBack }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      <TopBar title="ファミリーショーケース" onBack={onBack} />
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>江口ファミリーのビジネス一覧</p>
        {businesses.map((b, i) => (
          <Card key={i} style={!b.live ? { opacity: 0.7, border: `2px dashed ${theme.border}` } : {}}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: b.live ? theme.softCoral : theme.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
                border: `1px solid ${theme.border}`,
              }}>{b.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{b.name}</div>
                <div style={{ fontSize: 12, color: theme.muted }}>{b.owner}</div>
                {b.live ? (
                  <div style={{ fontSize: 11, color: theme.coral, marginTop: 2 }}>{b.url}</div>
                ) : (
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>🌱 近日公開</div>
                )}
              </div>
              {b.live && <span style={{ color: theme.muted, fontSize: 16 }}>→</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ResourcesScreen({ onBack }) {
  const [filter, setFilter] = useState("すべて");
  const filters = ["すべて", "HTML/CSS", "ビジネス", "AI", "EC"];
  const filtered = filter === "すべて" ? resources : resources.filter(r => r.tag === filter);

  return (
    <div style={{ padding: "0 0 20px" }}>
      <TopBar title="学習リソース" onBack={onBack} />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: f === filter ? theme.coral : theme.surface,
              color: f === filter ? "#fff" : theme.muted,
              border: `1px solid ${f === filter ? theme.coral : theme.border}`,
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>{f}</button>
          ))}
        </div>
        {filtered.map((r, i) => (
          <Card key={i}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 28 }}>{r.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: theme.text, marginBottom: 4 }}>{r.title}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Tag>{r.tag}</Tag>
                  <Tag color={theme.amber}>{r.for}にお勧め</Tag>
                </div>
              </div>
              <span style={{ color: theme.coral, fontSize: 14, fontWeight: 700 }}>読む →</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────

export default function EguchiHub() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [subScreen, setSubScreen] = useState(null);

  if (!user) return (
    <div style={styles.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700;800;900&display=swap'); * { box-sizing: border-box; }`}</style>
      <LoginScreen onLogin={u => { setUser(u); }} />
    </div>
  );

  const renderSubScreen = () => {
    switch (subScreen) {
      case "onboarding-yes": return <OnboardingYes onBack={() => setSubScreen(null)} setSubScreen={setSubScreen} />;
      case "onboarding-no": return <OnboardingNo onBack={() => setSubScreen(null)} setSubScreen={setSubScreen} />;
      case "idea-detail": return <IdeaDetailScreen onBack={() => setSubScreen(null)} setSubScreen={setSubScreen} />;
      case "living-doc": return <LivingDocScreen onBack={() => setSubScreen(null)} />;
      case "showcase": return <ShowcaseScreen onBack={() => setSubScreen(null)} />;
      case "resources": return <ResourcesScreen onBack={() => setSubScreen(null)} />;
      default: return null;
    }
  };

  const renderTab = () => {
    switch (tab) {
      case "home": return <HomeScreen user={user} setTab={setTab} setSubScreen={setSubScreen} />;
      case "ideas": return <IdeasScreen setSubScreen={setSubScreen} />;
      case "projects": return <ProjectsScreen setSubScreen={setSubScreen} />;
      case "menu": return <MenuScreen user={user} setTab={setTab} setSubScreen={setSubScreen} onLogout={() => setUser(null)} />;
      default: return null;
    }
  };

  return (
    <div style={styles.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700;800;900&display=swap'); * { box-sizing: border-box; } ::-webkit-scrollbar { width: 0; }`}</style>
      <div style={styles.screen}>
        {subScreen ? renderSubScreen() : renderTab()}
      </div>
      {!subScreen && <BottomNav tab={tab} setTab={setTab} />}
    </div>
  );
}

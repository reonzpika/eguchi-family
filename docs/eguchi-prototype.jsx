import React, { useState } from 'react';

// Avatar Component
function Avatar({ name, size = 32 }) {
  const colors = {
    Ryo: '#7CC9A0',
    Yoko: '#F9C784',
    Haruhi: '#B5A4E0',
    Natsumi: '#F97B6B',
    Motoharu: '#7BBFDC'
  };
  const color = colors[name] || '#F97B6B';
  const initials = name?.[0] || 'U';
  
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}33`,
        color: color,
        border: `2px solid ${color}55`,
        fontSize: size * 0.4
      }}
    >
      {initials}
    </div>
  );
}

// Discovery Assessment Screen
function DiscoveryScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      q: "何か得意なことで、よく頼まれることはありますか？",
      type: "text",
      placeholder: "例: 料理、整理整頓、教えること..."
    },
    {
      q: "自由時間があるとき、何をしていますか？",
      type: "buttons",
      options: ["創作活動", "新しいことを学ぶ", "人を助ける", "モノづくり"]
    },
    {
      q: "週にどれくらいの時間を使えますか？",
      type: "buttons",
      options: ["2-5時間", "5-10時間", "10時間以上", "まだわからない"]
    },
    {
      q: "日常で「これ不便だな」と感じることは？",
      type: "text",
      placeholder: "例: 高い有機野菜、地元の職人を見つけにくい..."
    },
    {
      q: "ビジネスを始める自信は？ (1-5)",
      type: "scale",
      options: ["😰 1", "😟 2", "😐 3", "🙂 4", "😊 5"]
    }
  ];

  const currentQ = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [step]: answer });
    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      setTimeout(onComplete, 500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFAF5]">
      <div className="bg-white border-b border-[#F0E8DF] p-4">
        <div className="flex justify-between text-xs text-[#9E9E9E] mb-2">
          <span>質問 {step + 1} / {questions.length}</span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded">
          <div 
            className="h-1 bg-[#F97B6B] rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-5 py-8">
        <div className="mb-8">
          <div className="text-3xl mb-4">💭</div>
          <h2 className="text-lg font-bold text-[#2D2D2D] mb-2">
            {currentQ.q}
          </h2>
        </div>

        {currentQ.type === 'text' && (
          <div>
            <input
              type="text"
              className="w-full rounded-xl border border-[#F0E8DF] bg-white px-4 py-3 text-[#2D2D2D] mb-4"
              placeholder={currentQ.placeholder}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  handleAnswer(e.target.value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                if (input.value) handleAnswer(input.value);
              }}
              className="w-full rounded-xl bg-[#F97B6B] px-5 py-3.5 font-semibold text-white"
            >
              次へ →
            </button>
          </div>
        )}

        {currentQ.type === 'buttons' && (
          <div className="flex flex-col gap-3">
            {currentQ.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className="rounded-xl border-2 border-[#F0E8DF] bg-white p-4 text-left font-semibold text-[#2D2D2D] hover:border-[#F97B6B] transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQ.type === 'scale' && (
          <div className="flex flex-col gap-3">
            {currentQ.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i + 1)}
                className="rounded-xl border-2 border-[#F0E8DF] bg-white p-4 text-center font-semibold text-[#2D2D2D] hover:border-[#F97B6B] transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Assessment Complete Screen
function AssessmentComplete({ onContinue }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFAF5] px-5 py-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">
          プロフィール完成！
        </h2>
        <p className="text-sm text-[#9E9E9E]">
          あなたのことがわかりました
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-[#FDECEA] to-[#F9C784]/20 p-5 mb-6">
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-[#2D2D2D] mb-2">✨ あなたの強み</div>
          <div className="text-3xl font-bold text-[#F97B6B]">創造的な問題解決者</div>
        </div>
        <p className="text-sm text-[#2D2D2D] text-center">
          あなたは手作りやデザインが得意で、人を助けることが好きです。
          これらのスキルを活かしたビジネスを考えましょう！
        </p>
      </div>

      <div className="rounded-2xl border border-[#F0E8DF] bg-white p-4 mb-6">
        <div className="text-sm font-bold text-[#2D2D2D] mb-3">💡 おすすめのアイデア</div>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#FFFAF5]">
            <div className="font-semibold text-[#2D2D2D] mb-1">🕯️ ハンドメイドキャンドル</div>
            <div className="text-xs text-[#9E9E9E]">手作りスキルとデザインセンスを活かせます</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FFFAF5]">
            <div className="font-semibold text-[#2D2D2D] mb-1">🎨 オンラインデザイン教室</div>
            <div className="text-xs text-[#9E9E9E]">教えることが好きなあなたにぴったり</div>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full rounded-xl bg-[#F97B6B] px-5 py-3.5 font-semibold text-white"
      >
        アイデアを探索する →
      </button>
    </div>
  );
}

// Idea Chat Screen
function IdeaChatScreen({ onComplete }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'どんなビジネスをやってみたいか、一言で教えてください',
      options: ['ハンドメイド商品', 'オンラインサービス', '教える・コーチング', 'その他']
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (msg) => {
    const userMsg = msg || input;
    if (!userMsg) return;

    setMessages([...messages, { role: 'user', content: userMsg }]);
    setInput('');

    setTimeout(() => {
      const responses = [
        {
          content: '素晴らしい！誰のためのビジネスですか？',
          options: ['友人や知人', '地元の人', 'オンラインの人', 'まだわからない']
        },
        {
          content: 'いいですね！どうやって販売しますか？',
          options: ['オンライン販売', '対面販売', 'SNS経由', 'まだ考え中']
        },
        {
          content: '完璧です！ビジネスアイデアをまとめましょう',
        }
      ];
      
      const nextResponse = responses[Math.min(messages.length / 2, 2)];
      setMessages(prev => [...prev, { role: 'ai', ...nextResponse }]);

      if (!nextResponse.options) {
        setTimeout(onComplete, 2000);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFAF5]">
      <div className="bg-white border-b border-[#F0E8DF] px-4 py-3">
        <div className="text-center">
          <div className="text-base font-bold text-[#2D2D2D]">江口AIコーチ 🌸</div>
          <div className="text-xs text-[#9E9E9E]">アイデアを一緒に育てましょう</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'ai' ? (
              <div className="flex flex-col gap-2">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#F97B6B] px-4 py-3 text-sm text-white">
                  {msg.content}
                </div>
                {msg.options && (
                  <div className="flex flex-wrap gap-2">
                    {msg.options.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => handleSend(opt)}
                        className="rounded-full border-2 border-[#F97B6B] bg-white px-4 py-2 text-xs font-semibold text-[#F97B6B] hover:bg-[#FDECEA]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm border-2 border-[#F0E8DF] bg-white px-4 py-3 text-sm text-[#2D2D2D]">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[#F0E8DF] bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 rounded-xl border border-[#F0E8DF] bg-white px-4 py-3 text-sm"
          />
          <button
            onClick={() => handleSend()}
            className="rounded-xl bg-[#F97B6B] px-5 py-3 font-semibold text-white"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}

// Business Summary Screen  
function BusinessSummaryScreen({ onUpgrade }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFAF5] px-5 py-6">
      <h2 className="text-xl font-bold text-[#2D2D2D] mb-5">アイデアのまとめ</h2>

      <div className="rounded-2xl border border-[#F0E8DF] bg-white overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-[#F97B6B] to-[#F9C784] p-4">
          <p className="font-bold text-white">✨ AIが整理しました</p>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-[#2D2D2D] mb-2">🕯️ ハンドメイドキャンドル</h3>
          <p className="text-sm text-[#2D2D2D] mb-4">
            地元の人向けに、エコフレンドリーな手作りキャンドルを販売するビジネス。
            週末マーケットやInstagram経由で販売します。
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-[#F97B6B]">👥</span>
              <div>
                <strong>ターゲット:</strong> 25-35歳の環境意識の高い人
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F97B6B]">💰</span>
              <div>
                <strong>価格:</strong> ¥3,000-5,000 / 個
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F97B6B]">✨</span>
              <div>
                <strong>強み:</strong> NZ植物の香り × デザインセンス
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#F0E8DF] bg-white p-4 mb-5">
        <p className="text-sm font-bold text-[#2D2D2D] mb-3">💬 AIからの提案</p>
        <div className="space-y-2 text-sm text-[#2D2D2D]">
          <div>→ まず3人に話して反応を見る</div>
          <div>→ 週末マーケットで試し販売</div>
          <div>→ Instagram で制作過程をシェア</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#F0E8DF] bg-[#FFFAF5] p-4 mb-5">
        <p className="text-sm font-bold text-[#2D2D2D] mb-2">👣 まずやること</p>
        <p className="text-sm text-[#2D2D2D]">
          友達3人にアイデアを話して「¥4,000で買う？」と聞いてみましょう
        </p>
      </div>

      <button
        onClick={onUpgrade}
        className="w-full rounded-xl bg-[#F97B6B] px-5 py-3.5 font-semibold text-white mb-3"
      >
        💾 アイデアを保存する
      </button>

      <button
        onClick={onUpgrade}
        className="w-full rounded-xl border-2 border-[#F97B6B] bg-white px-5 py-3.5 font-semibold text-[#F97B6B]"
      >
        🚀 プロジェクトに昇格する
      </button>
    </div>
  );
}

// Activity Feed Screen
function ActivityFeedScreen({ onNavigate }) {
  const MOCK_FEED = [
    {
      id: 1,
      type: 'milestone',
      user: 'Yoko',
      action: 'Milestone 1を完了しました！',
      project: 'ハンドメイドキャンドル',
      time: '2時間前',
      emoji: '🎉'
    },
    {
      id: 2,
      type: 'idea',
      user: 'Haruhi',
      action: '新しいアイデアを探索中！',
      time: '5時間前',
      emoji: '💡'
    },
    {
      id: 3,
      type: 'project',
      user: 'Ryo',
      action: '新しいプロジェクトを開始しました',
      project: 'ClinicPro 2.0',
      time: '1日前',
      emoji: '🚀'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFAF5]">
      <div className="bg-white border-b border-[#F0E8DF] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-[#2D2D2D]">🌸 江口ファミリーハブ</div>
          <Avatar name="Yoko" size={32} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-24">
        <h2 className="text-lg font-bold text-[#2D2D2D] mb-2">
          おかえりなさい、Yokoさん！
        </h2>
        <p className="text-xs text-[#9E9E9E] mb-6">今日も一緒に頑張りましょう</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border border-[#F0E8DF] bg-white p-4 text-center">
            <div className="text-2xl">💡</div>
            <div className="mt-1 text-xl font-bold text-[#F97B6B]">3件</div>
            <div className="text-xs text-[#9E9E9E]">アイデア</div>
          </div>
          <div className="rounded-2xl border border-[#F0E8DF] bg-white p-4 text-center">
            <div className="text-2xl">📁</div>
            <div className="mt-1 text-xl font-bold text-blue-500">2件</div>
            <div className="text-xs text-[#9E9E9E]">プロジェクト</div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('idea-chat')}
          className="w-full rounded-xl bg-[#F97B6B] px-5 py-3.5 font-semibold text-white mb-6"
        >
          ＋ 新しいアイデアを追加する
        </button>

        <div className="mb-4">
          <p className="text-xs font-bold text-[#9E9E9E] mb-3">家族の活動</p>
          <div className="space-y-3">
            {MOCK_FEED.map(item => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#F0E8DF] bg-white p-4 cursor-pointer hover:border-[#F97B6B] transition-colors"
                onClick={() => item.project && onNavigate('project')}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={item.user} size={32} />
                  <div className="flex-1">
                    <div className="font-semibold text-[#2D2D2D] text-sm">
                      {item.emoji} {item.user}
                    </div>
                    <div className="text-sm text-[#2D2D2D]">{item.action}</div>
                    {item.project && (
                      <div className="text-xs text-[#9E9E9E] mt-1">"{item.project}"</div>
                    )}
                    <div className="text-xs text-[#9E9E9E] mt-1">{item.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0E8DF] pb-2">
        <div className="max-w-[390px] mx-auto flex">
          {[
            { id: 'home', label: 'ホーム', emoji: '🏠' },
            { id: 'ideas', label: 'アイデア', emoji: '💡' },
            { id: 'projects', label: 'プロジェクト', emoji: '📁' },
            { id: 'menu', label: 'メニュー', emoji: '☰' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.id === 'projects' && onNavigate('project')}
              className={`flex-1 flex flex-col items-center gap-1 px-1 pt-2.5 ${
                tab.id === 'home' ? 'text-[#F97B6B]' : 'text-[#9E9E9E]'
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span className={`text-[10px] ${tab.id === 'home' ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {tab.id === 'home' && <div className="h-1 w-1 rounded-full bg-[#F97B6B]" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Project Detail Screen
function ProjectDetailScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState('milestones');

  const milestones = [
    {
      id: 1,
      title: 'Milestone 1: アイデアを検証',
      status: 'completed',
      tasks: [
        { title: '3人に話を聞く', done: true },
        { title: '「買う？」と質問', done: true },
        { title: 'フィードバックを記録', done: true }
      ]
    },
    {
      id: 2,
      title: 'Milestone 2: 初めてのお客様',
      status: 'in_progress',
      tasks: [
        { title: 'サンプルを作る', done: true },
        { title: 'Instagramに投稿', done: true },
        { title: '最初の注文を受ける', done: false }
      ]
    },
    {
      id: 3,
      title: 'Milestone 3: 10人のお客様',
      status: 'not_started',
      tasks: [
        { title: '週末マーケット出店', done: false },
        { title: 'リピーター獲得', done: false },
        { title: 'フィードバック収集', done: false }
      ]
    }
  ];

  const comments = [
    {
      id: 1,
      user: 'Haruhi',
      content: 'このパッケージデザイン素敵！😍',
      time: '2時間前',
      replies: [
        { user: 'Yoko', content: 'ありがとう！時間かかったよ', time: '1時間前' }
      ]
    },
    {
      id: 2,
      user: 'Ryo',
      content: '法人向けギフト用のまとめ買い価格も考えた？',
      time: '1日前',
      replies: []
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFAF5]">
      <div className="bg-white border-b border-[#F0E8DF] px-4 py-3">
        <button onClick={onBack} className="text-[#F97B6B] text-sm mb-2">← 戻る</button>
        <div className="font-bold text-[#2D2D2D]">📁 ハンドメイドキャンドル</div>
        <div className="text-xs text-[#9E9E9E]">by Yoko · Planning → Active → Growing</div>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-2xl border border-[#F0E8DF] bg-white p-4 mb-4">
          <div className="text-sm font-bold text-[#2D2D2D] mb-2">🎯 現在の目標</div>
          <div className="text-sm text-[#2D2D2D] mb-2">Milestone 2: 初めてのお客様</div>
          <div className="text-xs text-[#9E9E9E] mb-3">✅ 2 of 3 tasks done</div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[#9E9E9E] mb-1">
              <span>全体の進捗</span>
              <span>67%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-[#F97B6B] rounded-full" style={{ width: '67%' }} />
            </div>
          </div>

          <div className="rounded-xl bg-[#FDECEA] p-3">
            <div className="text-xs font-semibold text-[#F97B6B] mb-1">💡 AI Insight</div>
            <div className="text-xs text-[#2D2D2D]">
              順調です！土曜日までに完了できそうです
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4 border-b border-[#F0E8DF]">
          {['milestones', 'living-doc', 'comments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-2 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[#F97B6B] text-[#F97B6B]'
                  : 'text-[#9E9E9E]'
              }`}
            >
              {tab === 'milestones' && 'マイルストーン'}
              {tab === 'living-doc' && 'Living Doc'}
              {tab === 'comments' && `コメント (${comments.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'milestones' && (
          <div className="space-y-3">
            {milestones.map(m => (
              <div key={m.id} className="rounded-xl border border-[#F0E8DF] bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {m.status === 'completed' && '✅'}
                    {m.status === 'in_progress' && '⏳'}
                    {m.status === 'not_started' && '☐'}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#2D2D2D]">{m.title}</div>
                    <div className="text-xs text-[#9E9E9E]">
                      {m.status === 'completed' && 'COMPLETED'}
                      {m.status === 'in_progress' && 'IN PROGRESS'}
                      {m.status === 'not_started' && 'NOT STARTED'}
                    </div>
                  </div>
                </div>
                
                {m.status !== 'not_started' && (
                  <div className="ml-7 space-y-1">
                    {m.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={task.done}
                          className="rounded"
                          readOnly
                        />
                        <span className={task.done ? 'line-through text-[#9E9E9E]' : 'text-[#2D2D2D]'}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'living-doc' && (
          <div className="rounded-xl border border-[#F0E8DF] bg-white p-4">
            <h3 className="text-base font-bold text-[#2D2D2D] mb-3">🌟 ビジョン</h3>
            <p className="text-sm text-[#2D2D2D] mb-4">
              持続可能な副収入として、人々の家に癒しをもたらすエコフレンドリーなキャンドルを作る。
            </p>

            <h3 className="text-base font-bold text-[#2D2D2D] mb-3">👥 ターゲット顧客</h3>
            <p className="text-sm text-[#2D2D2D] mb-4">
              オークランドの25-35歳の環境意識の高い若手プロフェッショナル
            </p>

            <h3 className="text-base font-bold text-[#2D2D2D] mb-3">💰 収益モデル</h3>
            <p className="text-sm text-[#2D2D2D]">
              • 直接販売: ¥3,000-5,000 / 個<br/>
              • 材料費: ¥800 / 個<br/>
              • 利益: ¥2,000-4,000 / 個
            </p>
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            <div className="space-y-4 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="rounded-xl border border-[#F0E8DF] bg-white p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar name={comment.user} size={32} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-[#2D2D2D]">{comment.user}</span>
                        <span className="text-xs text-[#9E9E9E]">{comment.time}</span>
                      </div>
                      <p className="text-sm text-[#2D2D2D]">{comment.content}</p>
                    </div>
                  </div>

                  {comment.replies.length > 0 && (
                    <div className="ml-11 pl-3 border-l-2 border-[#F0E8DF] space-y-2">
                      {comment.replies.map((reply, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Avatar name={reply.user} size={24} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-[#2D2D2D]">{reply.user}</span>
                              <span className="text-xs text-[#9E9E9E]">{reply.time}</span>
                            </div>
                            <p className="text-sm text-[#2D2D2D]">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="ml-11 text-xs text-[#F97B6B] font-semibold mt-2">
                    返信
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#F0E8DF] bg-white p-3">
              <textarea
                placeholder="コメントを追加..."
                className="w-full text-sm resize-none focus:outline-none"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button className="text-xs text-[#9E9E9E]">キャンセル</button>
                <button className="text-xs font-semibold text-[#F97B6B]">投稿</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [screen, setScreen] = useState('discovery');

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white shadow-xl">
      {/* Debug Navigation - for testing all screens */}
      <div className="bg-gray-800 text-white p-2 text-xs flex gap-1 overflow-x-auto sticky top-0 z-50">
        <button onClick={() => setScreen('discovery')} className={`px-2 py-1 rounded ${screen === 'discovery' ? 'bg-[#F97B6B]' : 'bg-gray-600'}`}>
          1.発見
        </button>
        <button onClick={() => setScreen('assessment-complete')} className={`px-2 py-1 rounded ${screen === 'assessment-complete' ? 'bg-[#F97B6B]' : 'bg-gray-600'}`}>
          2.完了
        </button>
        <button onClick={() => setScreen('idea-chat')} className={`px-2 py-1 rounded ${screen === 'idea-chat' ? 'bg-[#F97B6B]' : 'bg-gray-600'}`}>
          3.チャット
        </button>
        <button onClick={() => setScreen('summary')} className={`px-2 py-1 rounded ${screen === 'summary' ? 'bg-[#F97B6B]' : 'bg-gray-600'}`}>
          4.まとめ
        </button>
        <button onClick={() => setScreen('feed')} className={`px-2 py-1 rounded ${screen === 'feed' ? 'bg-[#F97B6B]' : 'bg-gray-600'}`}>
          5.フィード
        </button>
        <button onClick={() => setScreen('project')} className={`px-2 py-1 rounded ${screen === 'project' ? 'bg-[#F97B6B]' : 'bg-gray-600'}`}>
          6.プロジェクト
        </button>
      </div>

      {screen === 'discovery' && (
        <DiscoveryScreen onComplete={() => setScreen('assessment-complete')} />
      )}
      {screen === 'assessment-complete' && (
        <AssessmentComplete onContinue={() => setScreen('idea-chat')} />
      )}
      {screen === 'idea-chat' && (
        <IdeaChatScreen onComplete={() => setScreen('summary')} />
      )}
      {screen === 'summary' && (
        <BusinessSummaryScreen onUpgrade={() => setScreen('feed')} />
      )}
      {screen === 'feed' && (
        <ActivityFeedScreen onNavigate={(s) => setScreen(s)} />
      )}
      {screen === 'project' && (
        <ProjectDetailScreen onBack={() => setScreen('feed')} />
      )}
    </div>
  );
}

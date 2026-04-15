"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultAppData, defaultProfile, defaultShoppingItems } from "@/lib/defaults";
import { buildAssessmentSummary, getLatestIntake, nutritionAssessment } from "@/lib/nutrition";
import type { AppData, FoodKey, PopulationGroup, ProfileState, ShoppingListItem } from "@/lib/types";
import { FoodGuardianAuth } from "@/components/food-guardian-auth";
import { FoodGuardianSections } from "@/components/food-guardian-sections";
import {
  initialIntakeForm,
  sectionLabels,
  voiceRecognitionCtor,
  type AppStateResponse,
  type AuthMode,
  type ChatItem,
  type SectionKey,
  type SpeechRecognitionLike,
} from "@/components/food-guardian-product-types";
import styles from "./food-guardian-web.module.css";

export function FoodGuardianProduct() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [appData, setAppData] = useState<AppData>(defaultAppData);
  const [shoppingItems, setShoppingItems] = useState<ShoppingListItem[]>(defaultShoppingItems);
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([
    { role: "assistant", content: "你好，我已经准备好根据你的摄入、库存和目标帮你给出饮食建议。" },
  ]);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [chatPrompt, setChatPrompt] = useState("请根据我今天的摄入情况给一个更均衡的晚餐建议。");
  const [recipeRequest, setRecipeRequest] = useState("黄瓜、蘑菇、鸡蛋，2 人晚餐，清淡一些");
  const [recipeResult, setRecipeResult] = useState("登录后可以把食谱、库存和分析全部写入你的真实账户。");
  const [fridgeForm, setFridgeForm] = useState({ name: "", quantity: 300, unit: "g" });
  const [shoppingForm, setShoppingForm] = useState({ name: "", note: "" });
  const [intakeForm, setIntakeForm] = useState(initialIntakeForm);
  const [voiceStatus, setVoiceStatus] = useState("待命");
  const [voiceText, setVoiceText] = useState("点击开始录音后，这里会显示识别文本。");
  const [visionResult, setVisionResult] = useState("上传餐盘图片后，这里会展示识别结果。");
  const [savingProfile, setSavingProfile] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const populationGroup = (profile.population_group === "all" ? "adults" : profile.population_group) as PopulationGroup;
  const latestIntake = useMemo(() => getLatestIntake(appData.daily_intake_records), [appData.daily_intake_records]);
  const assessment = useMemo(() => nutritionAssessment(latestIntake, populationGroup), [latestIntake, populationGroup]);
  const assessmentSummary = useMemo(() => buildAssessmentSummary(assessment), [assessment]);

  useEffect(() => {
    void loadSession();
    return () => recognitionRef.current?.stop();
  }, []);

  async function loadSession() {
    setAuthLoading(true);
    try {
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!meRes.ok) {
        setIsAuthenticated(false);
        return;
      }
      const me = (await meRes.json()) as { user: ProfileState };
      setProfile(me.user);
      setIsAuthenticated(true);
      await loadAppState();
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadAppState() {
    const response = await fetch("/api/app/state", { cache: "no-store" });
    if (!response.ok) return;
    const result = (await response.json()) as AppStateResponse;
    setProfile(result.profile);
    setAppData({
      nickname: result.profile.nickname,
      waste_reduced: result.profile.waste_reduced,
      water_saved: result.profile.water_saved,
      co2_reduced: result.profile.co2_reduced,
      population_group: result.profile.population_group,
      daily_intake_records: result.daily_intake_records,
      fridge_inventory: result.fridge_inventory,
    });
    setShoppingItems(result.shopping_items.length ? result.shopping_items : defaultShoppingItems);
    setChatMessages(
      result.chat_messages.length
        ? result.chat_messages
        : [{ role: "assistant", content: "你好，我已经准备好根据你的摄入、库存和目标帮你给出饮食建议。" }],
    );
  }

  async function submitAuth() {
    setAuthError("");
    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = authMode === "login" ? { email: authForm.email, password: authForm.password } : authForm;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setAuthError(result.error || "认证失败");
      return;
    }
    setIsAuthenticated(true);
    await loadSession();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    setProfile(defaultProfile);
    setAppData(defaultAppData);
    setShoppingItems(defaultShoppingItems);
    setChatMessages([{ role: "assistant", content: "你已退出登录。重新登录后可以继续同步真实数据。" }]);
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: profile.nickname, population_group: populationGroup }),
      });
      if (response.ok) await loadAppState();
    } finally {
      setSavingProfile(false);
    }
  }

  async function postJson(url: string, body: object) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) await loadAppState();
    return response;
  }

  async function addIntakeRecord() {
    const now = new Date();
    await postJson("/api/intake", {
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      vegetables: Number(intakeForm.vegetables),
      fruits: Number(intakeForm.fruits),
      meat: Number(intakeForm.meat),
      eggs: Number(intakeForm.eggs),
    });
  }

  async function addFridgeItem() {
    const response = await postJson("/api/fridge", {
      name: fridgeForm.name,
      quantity: Number(fridgeForm.quantity),
      unit: fridgeForm.unit,
    });
    if (response.ok) setFridgeForm({ name: "", quantity: 300, unit: "g" });
  }

  async function addShoppingItem() {
    const response = await postJson("/api/shopping", shoppingForm);
    if (response.ok) setShoppingForm({ name: "", note: "" });
  }

  async function toggleShoppingItem(item: ShoppingListItem) {
    if (!item.id) return;
    const response = await fetch("/api/shopping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, checked: !item.checked }),
    });
    if (response.ok) await loadAppState();
  }

  async function askAi(prompt: string) {
    const optimistic = [...chatMessages, { role: "user" as const, content: prompt }];
    setChatMessages(optimistic);
    const response = await postJson("/api/ai/chat", { prompt });
    const result = (await response.json()) as { content?: string; error?: string };
    if (!response.ok) {
      setChatMessages([...optimistic, { role: "assistant", content: result.error || "暂时没有收到回复。" }]);
      return;
    }
    setChatPrompt("");
  }

  async function generateRecipe() {
    const prompt = `请结合人群 ${populationGroup}、今日摄入 ${JSON.stringify(latestIntake)}、库存 ${appData.fridge_inventory
      .map((item) => item.name)
      .join("、")}，根据这个需求生成晚餐建议：${recipeRequest}`;
    const response = await postJson("/api/ai/chat", { prompt });
    const result = (await response.json()) as { content?: string; error?: string };
    setRecipeResult(result.content || result.error || "暂时没有生成结果。");
  }

  function handleVoiceInput() {
    if (!voiceRecognitionCtor) {
      setVoiceStatus("当前浏览器不支持原生语音识别");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new voiceRecognitionCtor();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("正在聆听...");
    };
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      setVoiceText(text || "没有识别到内容。");
      setVoiceStatus("识别成功，正在发送...");
      if (text) {
        // Auto-submit to AI after a short delay
        setTimeout(() => {
          void askAi(text);
          setVoiceStatus("已发送给 AI，请在对话框查看回复");
        }, 800);
      }
    };
    recognition.onerror = () => {
      setVoiceStatus("识别失败，请检查麦克风权限");
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      setVoiceStatus((current) => (current === "正在聆听..." ? "已停止" : current));
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  function speakLatestReply() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceStatus("当前浏览器不支持语音播报");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chatMessages.at(-1)?.content || voiceText);
    utterance.lang = "zh-CN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setVoiceStatus("正在播报最新回复");
  }

  async function uploadVision(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/api/ai/vision", { method: "POST", body: formData });
    const result = (await response.json()) as { content?: string; error?: string };
    setVisionResult(result.content || result.error || "未返回识别内容。");
  }

  const metrics = [
    { label: "减少浪费", value: `${profile.waste_reduced.toFixed(0)} g` },
    { label: "节约用水", value: `${profile.water_saved.toFixed(0)} L` },
    { label: "减少排放", value: `${profile.co2_reduced.toFixed(2)} kg` },
  ];

  if (authLoading) return <div className="shell" style={{ padding: 48 }}>加载中...</div>;

  return (
    <div className="shell">
      <div className={styles.app}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <span className={styles.eyebrow}>FoodGuardian AI</span>
            <h1 className={styles.title}>Household Food Intelligence</h1>
            <p className={styles.sidebarLead}>这版已经按网站产品形态重构，视觉不再是工具页，而是更接近完整消费级健康产品的品牌体验。</p>
          </div>
          <nav className={styles.nav}>
            {(Object.keys(sectionLabels) as SectionKey[]).map((section) => (
              <button key={section} type="button" data-active={activeSection === section} onClick={() => setActiveSection(section)}>
                {sectionLabels[section]}
              </button>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>功能上继续保留营养分析、库存、食谱、对话、语音和识图；架构上已经进入可持续迭代的 Web 产品路线。</div>
        </aside>

        <main className={styles.main}>
          <div className={styles.mobileBrand}>
            <span>FoodGuardian AI</span>
            <strong>Household Food Intelligence</strong>
          </div>
          <section className={styles.topbar}>
            <div className={styles.topbarMeta}>
              <span className={styles.chip}>当前身份：{isAuthenticated ? profile.nickname : "未登录"}</span>
              <span className={styles.chip}>人群标签：{populationGroup}</span>
              <span className={styles.chip}>库存食材：{appData.fridge_inventory.length} 项</span>
            </div>
            <div className={styles.topbarActions}>
              {isAuthenticated ? (
                <button type="button" className={styles.ghost} onClick={logout}>退出登录</button>
              ) : (
                <button type="button" className={styles.ghost}>登录后自动同步数据</button>
              )}
            </div>
          </section>

          <section className={styles.hero}>
            <div className={styles.heroMain}>
              <span className={styles.eyebrow}>Reference-inspired product UI</span>
              <h2 className={styles.title}>把原桌面功能做成更像正式产品的健康饮食平台</h2>
              <p className={styles.heroText}>视觉上改成更有品牌感的分层卡片、编辑式大标题和柔和暖色体系；功能上已经开始走真实持久化、登录会话和多模态能力。</p>
              <div className={styles.heroActions}>
                <button type="button" className={styles.cta} onClick={() => setActiveSection("nutrition")}>打开营养分析</button>
                <button type="button" className={styles.secondary} onClick={() => setActiveSection("chat")}>进入 AI 对话</button>
                <button type="button" className={styles.ghost} onClick={() => setActiveSection("voice")}>开始语音交互</button>
              </div>
            </div>
            <div className={styles.heroSide}>
              <div className={styles.metricGrid}>
                {metrics.map((metric) => (
                  <div key={metric.label} className={styles.metricCard}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.featureStrip}>
                <div className={styles.featureCell}><strong>数据库</strong><div className={styles.muted}>摄入、库存、采购、聊天都能持久化。</div></div>
                <div className={styles.featureCell}><strong>登录会话</strong><div className={styles.muted}>邮箱账号登录，浏览器 Cookie 维持会话。</div></div>
                <div className={styles.featureCell}><strong>图片识别</strong><div className={styles.muted}>已接视觉路由，配置密钥后可返回正式识别结果。</div></div>
              </div>
            </div>
          </section>

          {!isAuthenticated ? (
            <FoodGuardianAuth
              authMode={authMode}
              authForm={authForm}
              authError={authError}
              onAuthModeChange={setAuthMode}
              onAuthFormChange={setAuthForm}
              onSubmit={submitAuth}
            />
          ) : (
            <FoodGuardianSections
              activeSection={activeSection}
              profile={profile}
              populationGroup={populationGroup}
              latestSummary={assessmentSummary.summary}
              assessmentEntries={Object.entries(assessment) as Array<[FoodKey, (typeof assessment)[FoodKey]]>}
              intakeRecords={appData.daily_intake_records}
              fridgeItems={appData.fridge_inventory}
              shoppingItems={shoppingItems}
              chatMessages={chatMessages}
              recipeRequest={recipeRequest}
              recipeResult={recipeResult}
              chatPrompt={chatPrompt}
              intakeForm={intakeForm}
              fridgeForm={fridgeForm}
              shoppingForm={shoppingForm}
              visionResult={visionResult}
              voiceText={voiceText}
              voiceStatus={voiceStatus}
              isListening={isListening}
              savingProfile={savingProfile}
              onProfileChange={(next) => setProfile((current) => ({ ...current, ...next }))}
              onSaveProfile={saveProfile}
              onIntakeFormChange={(key, value) => setIntakeForm((current) => ({ ...current, [key]: value }))}
              onAddIntake={addIntakeRecord}
              onRecipeRequestChange={setRecipeRequest}
              onGenerateRecipe={generateRecipe}
              onChatPromptChange={setChatPrompt}
              onAskAi={askAi}
              onFridgeFormChange={setFridgeForm}
              onAddFridgeItem={addFridgeItem}
              onShoppingFormChange={setShoppingForm}
              onAddShoppingItem={addShoppingItem}
              onToggleShoppingItem={toggleShoppingItem}
              onUploadVision={(file) => void uploadVision(file)}
              onStartVoice={handleVoiceInput}
              onSpeak={speakLatestReply}
            />
          )}
        </main>

        <nav className={styles.mobileNav}>
          <button className={styles.mobileNavLink} data-active={activeSection === "overview"} onClick={() => setActiveSection("overview")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>总览</span>
          </button>
          <button className={styles.mobileNavLink} data-active={activeSection === "nutrition"} onClick={() => setActiveSection("nutrition")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            <span>营养</span>
          </button>
          <button className={styles.mobileNavLink} data-active={activeSection === "chat"} onClick={() => setActiveSection("chat")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>对话</span>
          </button>
          <button className={styles.mobileNavLink} data-active={activeSection === "fridge"} onClick={() => setActiveSection("fridge")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M3 10h18"/><path d="M10 4v4"/><path d="M14 4v4"/></svg>
            <span>库存</span>
          </button>
          <button className={styles.mobileNavLink} data-active={activeSection === "voice"} onClick={() => setActiveSection("voice")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            <span>语音</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

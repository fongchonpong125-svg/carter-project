import type { FoodKey, PopulationGroup, ProfileState, ShoppingListItem } from "@/lib/types";
import styles from "./food-guardian-web.module.css";
import type { ChatItem, SectionKey } from "@/components/food-guardian-product-types";

type AssessmentItem = {
  intake: number;
  status: "未录入" | "不足" | "超标" | "达标";
  gap: number;
  chinese_name: string;
  suggestion: string;
};

type Props = {
  activeSection: SectionKey;
  profile: ProfileState;
  populationGroup: PopulationGroup;
  latestSummary: string;
  assessmentEntries: Array<[FoodKey, AssessmentItem]>;
  intakeRecords: Array<{ date: string; time: string; vegetables: number; fruits: number; meat: number; eggs: number }>;
  fridgeItems: Array<{ name: string; quantity: number; unit: string; added_date: string }>;
  shoppingItems: ShoppingListItem[];
  chatMessages: ChatItem[];
  recipeRequest: string;
  recipeResult: string;
  chatPrompt: string;
  intakeForm: Record<FoodKey, number>;
  fridgeForm: { name: string; quantity: number; unit: string };
  shoppingForm: { name: string; note: string };
  visionResult: string;
  voiceText: string;
  voiceStatus: string;
  isListening: boolean;
  savingProfile: boolean;
  onProfileChange: (next: Partial<ProfileState>) => void;
  onSaveProfile: () => void;
  onIntakeFormChange: (key: FoodKey, value: number) => void;
  onAddIntake: () => void;
  onRecipeRequestChange: (value: string) => void;
  onGenerateRecipe: () => void;
  onChatPromptChange: (value: string) => void;
  onAskAi: (prompt: string) => void;
  onFridgeFormChange: (next: { name: string; quantity: number; unit: string }) => void;
  onAddFridgeItem: () => void;
  onShoppingFormChange: (next: { name: string; note: string }) => void;
  onAddShoppingItem: () => void;
  onToggleShoppingItem: (item: ShoppingListItem) => void;
  onUploadVision: (file: File) => void;
  onStartVoice: () => void;
  onSpeak: () => void;
};

export function FoodGuardianSections(props: Props) {
  const {
    activeSection,
    profile,
    populationGroup,
    latestSummary,
    assessmentEntries,
    intakeRecords,
    fridgeItems,
    shoppingItems,
    chatMessages,
    recipeRequest,
    recipeResult,
    chatPrompt,
    intakeForm,
    fridgeForm,
    shoppingForm,
    visionResult,
    voiceText,
    voiceStatus,
    isListening,
    savingProfile,
    onProfileChange,
    onSaveProfile,
    onIntakeFormChange,
    onAddIntake,
    onRecipeRequestChange,
    onGenerateRecipe,
    onChatPromptChange,
    onAskAi,
    onFridgeFormChange,
    onAddFridgeItem,
    onShoppingFormChange,
    onAddShoppingItem,
    onToggleShoppingItem,
    onUploadVision,
    onStartVoice,
    onSpeak,
  } = props;

  return (
    <>
      <section className={styles.twoCol}>
        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>个人资料</h2>
              <p>这里直接决定营养分析口径和整个产品的推荐方向。</p>
            </div>
          </div>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              昵称
              <input
                className={styles.input}
                value={profile.nickname}
                onChange={(event) => onProfileChange({ nickname: event.target.value })}
              />
            </label>
            <label className={styles.label}>
              人群标签
              <select
                className={styles.select}
                value={populationGroup}
                onChange={(event) => onProfileChange({ population_group: event.target.value as PopulationGroup })}
              >
                <option value="adults">成年人</option>
                <option value="children">儿童</option>
                <option value="teens">青少年</option>
                <option value="elderly">老年人</option>
              </select>
            </label>
          </div>
          <div className={styles.inlineActions}>
            <button type="button" className={styles.secondary} onClick={onSaveProfile}>
              {savingProfile ? "保存中..." : "保存资料"}
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>营养总览</h2>
              <p>{latestSummary}</p>
            </div>
          </div>
          <div className={styles.list}>
            {assessmentEntries.map(([, item]) => (
              <div key={item.chinese_name} className={styles.item}>
                <div className={styles.itemHeader}>
                  <strong>{item.chinese_name}</strong>
                  <span className={styles.badge}>{item.status}</span>
                </div>
                <div className={styles.muted}>{item.suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(activeSection === "overview" || activeSection === "nutrition") && (
        <section className={styles.twoCol}>
          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>录入摄入</h2>
                <p>把原来的桌面表单升级成可持续保存的 Web 记录。</p>
              </div>
            </div>
            <div className={styles.formGrid}>
              {(["vegetables", "fruits", "meat", "eggs"] as FoodKey[]).map((key) => (
                <label key={key} className={styles.label}>
                  {key === "vegetables" ? "蔬菜" : key === "fruits" ? "水果" : key === "meat" ? "肉类" : "蛋类"}
                  <input
                    className={styles.input}
                    type="number"
                    value={intakeForm[key]}
                    onChange={(event) => onIntakeFormChange(key, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
            <div className={styles.inlineActions}>
              <button type="button" className={styles.cta} onClick={onAddIntake}>
                保存今日摄入
              </button>
            </div>
          </div>

          <div className={styles.listCard}>
            <strong>最近记录</strong>
            <div className={styles.list}>
              {intakeRecords.slice(-5).reverse().map((item, index) => (
                <div key={`${item.date}-${item.time}-${index}`} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <strong>{item.date}</strong>
                    <span className={styles.badge}>{item.time}</span>
                  </div>
                  <div className={styles.muted}>
                    蔬菜 {item.vegetables}g，水果 {item.fruits}g，肉类 {item.meat}g，蛋类 {item.eggs}g
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(activeSection === "overview" || activeSection === "recipes") && (
        <section className={styles.twoCol}>
          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>智能食谱</h2>
                <p>继续沿用“结合人群、库存和营养缺口”的核心逻辑，但结果会写进你的聊天历史。</p>
              </div>
            </div>
            <label className={styles.label}>
              食谱需求
              <textarea className={styles.textarea} value={recipeRequest} onChange={(event) => onRecipeRequestChange(event.target.value)} />
            </label>
            <div className={styles.inlineActions}>
              <button type="button" className={styles.cta} onClick={onGenerateRecipe}>
                生成晚餐方案
              </button>
            </div>
          </div>

          <div className={styles.listCard}>
            <strong>结果预览</strong>
            <div className={styles.muted}>{recipeResult}</div>
          </div>
        </section>
      )}

      {(activeSection === "overview" || activeSection === "chat") && (
        <section className={styles.twoCol}>
          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>AI 对话</h2>
                <p>问答、食谱、营养建议都通过同一个账户沉淀下来。</p>
              </div>
            </div>
            <label className={styles.label}>
              输入问题
              <textarea className={styles.textarea} value={chatPrompt} onChange={(event) => onChatPromptChange(event.target.value)} />
            </label>
            <div className={styles.inlineActions}>
              <button type="button" className={styles.cta} onClick={() => onAskAi(chatPrompt)}>
                发送给 AI
              </button>
            </div>
          </div>
          <div className={styles.chatLayout}>
            {chatMessages.slice(-8).map((message, index) => (
              <div key={`${message.role}-${index}`} className={styles.chatBubble} data-role={message.role}>
                <strong>{message.role === "assistant" ? "FoodGuardian AI" : "你"}</strong>
                <div className={styles.muted}>{message.content}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(activeSection === "overview" || activeSection === "fridge" || activeSection === "shopping") && (
        <section className={styles.threeCol}>
          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>冰箱库存</h2>
                <p>库存是推荐食谱与减少浪费的核心输入。</p>
              </div>
            </div>
            <div className={styles.stack}>
              <label className={styles.label}>
                食材名称
                <input className={styles.input} value={fridgeForm.name} onChange={(event) => onFridgeFormChange({ ...fridgeForm, name: event.target.value })} />
              </label>
              <div className={styles.formGrid}>
                <label className={styles.label}>
                  数量
                  <input className={styles.input} type="number" value={fridgeForm.quantity} onChange={(event) => onFridgeFormChange({ ...fridgeForm, quantity: Number(event.target.value) })} />
                </label>
                <label className={styles.label}>
                  单位
                  <input className={styles.input} value={fridgeForm.unit} onChange={(event) => onFridgeFormChange({ ...fridgeForm, unit: event.target.value })} />
                </label>
              </div>
              <button type="button" className={styles.secondary} onClick={onAddFridgeItem}>
                添加库存
              </button>
            </div>
            <div className={styles.list}>
              {fridgeItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <strong>{item.name}</strong>
                    <span className={styles.badge}>{item.added_date}</span>
                  </div>
                  <div className={styles.muted}>
                    {item.quantity}
                    {item.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>采购清单</h2>
                <p>后续可以继续加自动推导，现在已经支持真实保存和勾选。</p>
              </div>
            </div>
            <div className={styles.stack}>
              <label className={styles.label}>
                采购项
                <input className={styles.input} value={shoppingForm.name} onChange={(event) => onShoppingFormChange({ ...shoppingForm, name: event.target.value })} />
              </label>
              <label className={styles.label}>
                备注
                <input className={styles.input} value={shoppingForm.note} onChange={(event) => onShoppingFormChange({ ...shoppingForm, note: event.target.value })} />
              </label>
              <button type="button" className={styles.secondary} onClick={onAddShoppingItem}>
                添加采购项
              </button>
            </div>
            <div className={styles.list}>
              {shoppingItems.map((item) => (
                <label key={`${item.id || item.name}`} className={styles.item}>
                  <div className={styles.checkboxRow}>
                    <input type="checkbox" checked={item.checked} onChange={() => onToggleShoppingItem(item)} />
                    <div>
                      <strong>{item.name}</strong>
                      <div className={styles.muted}>{item.note || "待采购"}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>图片识别</h2>
                <p>上传餐盘、食材或成品图，服务端会走视觉接口。</p>
              </div>
            </div>
            <div className={styles.stack}>
              <label className={styles.label}>
                上传图片
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onUploadVision(file);
                    }
                  }}
                />
              </label>
              <div className={styles.emptyState}>{visionResult}</div>
            </div>
          </div>
        </section>
      )}

      {(activeSection === "overview" || activeSection === "voice") && (
        <section className={styles.twoCol}>
          <div className={styles.voiceCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>语音交互</h2>
                <p>浏览器端录音识别，服务端仍然使用同一个账户上下文和 AI 能力。</p>
              </div>
            </div>
            <div className={styles.voiceActions}>
              <button type="button" className={styles.cta} onClick={onStartVoice}>
                {isListening ? "停止录音" : "开始录音"}
              </button>
              <button type="button" className={styles.secondary} onClick={() => onAskAi(voiceText)}>
                识别文本发给 AI
              </button>
              <button type="button" className={styles.ghost} onClick={onSpeak}>
                播报最新回复
              </button>
            </div>
            <div className={styles.muted}>当前状态：{voiceStatus}</div>
            <div className={styles.voiceTranscript}>{voiceText}</div>
          </div>

          <div className={styles.listCard}>
            <strong>上线提示</strong>
            <div className={styles.list}>
              <div className={styles.item}>开发期使用 SQLite，适合本地快速验证。</div>
              <div className={styles.item}>部署到线上时建议把数据库切到托管 PostgreSQL。</div>
              <div className={styles.item}>只要配置 `ZHIPU_API_KEY` / `SESSION_SECRET` 就能跑完整链路。</div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

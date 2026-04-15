import type { AuthMode } from "@/components/food-guardian-product-types";
import styles from "./food-guardian-web.module.css";

type AuthFormState = {
  name: string;
  email: string;
  password: string;
};

type Props = {
  authMode: AuthMode;
  authForm: AuthFormState;
  authError: string;
  onAuthModeChange: (mode: AuthMode) => void;
  onAuthFormChange: (next: AuthFormState) => void;
  onSubmit: () => void;
};

export function FoodGuardianAuth(props: Props) {
  const { authMode, authForm, authError, onAuthModeChange, onAuthFormChange, onSubmit } = props;

  return (
    <section className={styles.authShell}>
      <div className={styles.authCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>登录与账户</h2>
            <p>先用邮箱登录，把现在这版从演示页切换成真正属于你的可同步应用。</p>
          </div>
        </div>
        <div className={styles.authTabs}>
          <button type="button" className={styles.tab} data-active={authMode === "login"} onClick={() => onAuthModeChange("login")}>
            登录
          </button>
          <button type="button" className={styles.tab} data-active={authMode === "register"} onClick={() => onAuthModeChange("register")}>
            注册
          </button>
        </div>
        <div className={styles.stack}>
          {authMode === "register" ? (
            <label className={styles.label}>
              昵称
              <input
                className={styles.input}
                value={authForm.name}
                onChange={(event) => onAuthFormChange({ ...authForm, name: event.target.value })}
              />
            </label>
          ) : null}
          <label className={styles.label}>
            邮箱
            <input
              className={styles.input}
              type="email"
              value={authForm.email}
              onChange={(event) => onAuthFormChange({ ...authForm, email: event.target.value })}
            />
          </label>
          <label className={styles.label}>
            密码
            <input
              className={styles.input}
              type="password"
              value={authForm.password}
              onChange={(event) => onAuthFormChange({ ...authForm, password: event.target.value })}
            />
          </label>
          {authError ? <div className={styles.emptyState}>{authError}</div> : null}
          <div className={styles.inlineActions}>
            <button type="button" className={styles.cta} onClick={onSubmit}>
              {authMode === "login" ? "登录并同步" : "注册并开始使用"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.listCard}>
        <strong>上线级补齐范围</strong>
        <div className={styles.list}>
          <div className={styles.item}>摄入记录、库存、购物清单、聊天历史进入数据库。</div>
          <div className={styles.item}>登录状态通过服务端 Cookie 会话维持。</div>
          <div className={styles.item}>图片识别改成真实服务端视觉调用入口。</div>
          <div className={styles.item}>后续部署到 Vercel 只需补环境变量即可。</div>
        </div>
      </div>
    </section>
  );
}

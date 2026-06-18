import { useSettings, type ThemeMode } from "../stores/settingsStore.tsx";
import "../styles/settings-panel.css";

type SettingsPanelProps = {
  onClose: () => void;
};

function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();

  const themes: { value: ThemeMode; label: string }[] = [
    { value: "light", label: "亮色" },
    { value: "dark", label: "暗色" },
    { value: "system", label: "跟随系统" },
  ];

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">设置</span>
          <button className="settings-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 主题 */}
        <div className="settings-section">
          <label className="settings-label">主题</label>
          <div className="theme-options">
            {themes.map((t) => (
              <button
                key={t.value}
                className={`theme-btn ${settings.theme === t.value ? "active" : ""}`}
                onClick={() => updateSettings({ theme: t.value })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 字号 */}
        <div className="settings-section">
          <label className="settings-label">
            字号：{settings.fontSize}px
          </label>
          <div className="slider-row">
            <span className="slider-min">12</span>
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={settings.fontSize}
              onChange={(e) =>
                updateSettings({ fontSize: Number(e.target.value) })
              }
              className="settings-slider"
            />
            <span className="slider-max">24</span>
          </div>
        </div>

        {/* 行高 */}
        <div className="settings-section">
          <label className="settings-label">
            行高：{settings.lineHeight.toFixed(2)}
          </label>
          <div className="slider-row">
            <span className="slider-min">1.0</span>
            <input
              type="range"
              min="100"
              max="250"
              step="10"
              value={Math.round(settings.lineHeight * 100)}
              onChange={(e) =>
                updateSettings({ lineHeight: Number(e.target.value) / 100 })
              }
              className="settings-slider"
            />
            <span className="slider-max">2.5</span>
          </div>
        </div>

        {/* 内容宽度 */}
        <div className="settings-section">
          <label className="settings-label">内容宽度</label>
          <div className="theme-options">
            {[
              { value: "narrow" as const, label: "窄" },
              { value: "normal" as const, label: "标准" },
              { value: "wide" as const, label: "宽" },
            ].map((w) => (
              <button
                key={w.value}
                className={`theme-btn ${settings.contentWidth === w.value ? "active" : ""}`}
                onClick={() => updateSettings({ contentWidth: w.value })}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* 字体族 */}
        <div className="settings-section">
          <label className="settings-label">字体</label>
          <div className="theme-options">
            {[
              { value: "sans-serif", label: "无衬线" },
              { value: "serif", label: "衬线" },
              { value: "monospace", label: "等宽" },
              { value: "'Microsoft YaHei', sans-serif", label: "微软雅黑" },
              { value: "'Noto Serif SC', serif", label: "宋体" },
            ].map((f) => (
              <button
                key={f.value}
                className={`theme-btn ${settings.fontFamily === f.value ? "active" : ""}`}
                onClick={() => updateSettings({ fontFamily: f.value })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPanel;
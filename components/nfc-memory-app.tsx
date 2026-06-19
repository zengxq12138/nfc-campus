"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Images,
  LockKey,
  MapPin,
  PencilSimple,
  Plus,
  WarningCircle,
  X
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { campusOverview, campusSpots, schoolFacts } from "@/data/campus";
import type { EditableProfile, GraduateProfile } from "@/lib/types";

type NfcMemoryAppProps = {
  initialId: string;
  initialProfile?: GraduateProfile;
};

const MAX_PHOTOS = 5;

export function NfcMemoryApp({ initialId, initialProfile }: NfcMemoryAppProps) {
  const reduceMotion = useReducedMotion();
  const [profile, setProfile] = useState<GraduateProfile | undefined>(initialProfile);
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeSpot, setActiveSpot] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<EditableProfile | null>(
    initialProfile ? getEditableProfile(initialProfile) : null
  );
  const [setupPassword, setSetupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "error" | "success";
    text: string;
  }>({ type: "idle", text: "" });

  useEffect(() => {
    setProfile(initialProfile);
    setDraft(initialProfile ? getEditableProfile(initialProfile) : null);
    setActivePhoto(0);
  }, [initialId, initialProfile]);

  const activeImage = profile?.photos[activePhoto] ?? profile?.photos[0];
  const featuredSpot = campusSpots[activeSpot];

  const canAddPhoto = useMemo(() => {
    return (draft?.photos.length ?? 0) < MAX_PHOTOS;
  }, [draft?.photos.length]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSpot((current) => (current + 1) % campusSpots.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  function openEditor() {
    if (!profile) {
      return;
    }

    setDraft(getEditableProfile(profile));
    setConfirmPassword("");
    setSetupPassword("");
    setStatus({ type: "idle", text: "" });
    setEditorOpen(true);
  }

  function handleDraftChange(field: keyof EditableProfile, value: string) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value
      };
    });
  }

  async function uploadPhoto(file: File) {
    if (!canAddPhoto || !draft || !profile) {
      setStatus({ type: "error", text: "照片最多保留 5 张。" });
      return;
    }

    const password = profile.passwordSet ? confirmPassword : setupPassword;

    if (!password.trim()) {
      setStatus({ type: "error", text: "上传照片前请输入编辑密码。" });
      return;
    }

    if (!profile.passwordSet && password.trim().length < 4) {
      setStatus({ type: "error", text: "首次密码至少 4 位。" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    setUploadingPhoto(true);
    setStatus({ type: "idle", text: "" });

    try {
      const response = await fetch(`/api/students/${encodeURIComponent(profile.publicId)}/photos`, {
        method: "POST",
        body: formData
      });
      const payload = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", text: payload.error ?? "照片上传失败。" });
        return;
      }

      const nextProfile = payload.profile as GraduateProfile;
      setProfile(nextProfile);
      setDraft(getEditableProfile(nextProfile));
      setActivePhoto(Math.max(0, nextProfile.photos.length - 1));

      if (!profile.passwordSet) {
        setConfirmPassword(password.trim());
      }

      setStatus({ type: "success", text: "照片已上传到 Supabase Storage。" });
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handlePhotoInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      void uploadPhoto(file);
    }
  }

  function removePhoto(index: number) {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      photos: draft.photos.filter((_, photoIndex) => photoIndex !== index)
    });
  }

  async function saveDraft() {
    if (!draft || !profile) {
      return;
    }

    const trimmedName = draft.name.trim();
    const trimmedClass = draft.majorClass.trim();

    if (!trimmedName || !trimmedClass) {
      setStatus({ type: "error", text: "姓名和专业班级不能为空。" });
      return;
    }

    if (!profile.passwordSet) {
      if (setupPassword.trim().length < 4) {
        setStatus({ type: "error", text: "首次密码至少 4 位。" });
        return;
      }

    }

    const nextDraft = {
      ...draft,
      name: trimmedName,
      majorClass: trimmedClass,
      signature: draft.signature.trim(),
      photos: draft.photos.slice(0, MAX_PHOTOS)
    };

    setSavingProfile(true);
    setStatus({ type: "idle", text: "" });

    try {
      const response = await fetch(`/api/students/${encodeURIComponent(profile.publicId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: profile.passwordSet ? confirmPassword : setupPassword,
          profile: nextDraft
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", text: payload.error ?? "资料保存失败。" });
        return;
      }

      const nextProfile = payload.profile as GraduateProfile;
      setProfile(nextProfile);
      setDraft(getEditableProfile(nextProfile));
      setActivePhoto(0);
      setConfirmPassword("");
      setSetupPassword("");
      setStatus({ type: "success", text: "资料已保存到 Supabase。" });

      window.setTimeout(() => {
        setEditorOpen(false);
        setStatus({ type: "idle", text: "" });
      }, 650);
    } finally {
      setSavingProfile(false);
    }
  }

  function showPreviousSpot() {
    setActiveSpot((current) =>
      current === 0 ? campusSpots.length - 1 : current - 1
    );
  }

  function showNextSpot() {
    setActiveSpot((current) => (current + 1) % campusSpots.length);
  }

  if (!profile) {
    return <MissingProfile publicId={initialId} />;
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="返回页面顶部">
          <span className="brand-mark">GXU</span>
          <span>毕业留念</span>
        </a>
        <nav className="nav-links" aria-label="页面导航">
          <a href="#campus">母校风貌</a>
          <a href="#profile">个人留念</a>
          <button className="nav-edit" type="button" onClick={openEditor}>
            <PencilSimple size={16} weight="bold" />
            编辑
          </button>
        </nav>
      </header>

      <section id="top" className="hero-section">
        <motion.div
          className="hero-copy"
          initial={reduceMotion ? false : { y: 18 }}
          animate={reduceMotion ? undefined : { y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">GXU GRADUATION MEMORY</p>
          <h1 className="hero-title" aria-label="把西大的夏天，留给毕业后的你。">
            <span className="title-line title-line-primary">留住</span>
            <span className="title-line title-line-accent">西大的夏天</span>
          </h1>
          <p className="hero-subtitle">
            翻开这份毕业礼物，回到 {profile.name} 和母校一起发光的夏天
          </p>

          <div className="hero-person">
            <div>
              <span>毕业生</span>
              <strong>{profile.name}</strong>
            </div>
            <div>
              <span>专业班级</span>
              <strong>{profile.majorClass}</strong>
            </div>
          </div>

          <div className="hero-actions">
            <a className="primary-action" href="#profile">
              查看留念
              <ArrowRight size={18} weight="bold" />
            </a>
            <button className="secondary-action" type="button" onClick={openEditor}>
              编辑资料
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={reduceMotion ? false : { scale: 0.98 }}
          animate={reduceMotion ? undefined : { scale: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/images/campus/广西大学大门.jpeg"
            alt="广西大学大门"
            fill
            sizes="(max-width: 768px) 100vw, 48vw"
            priority
          />
        </motion.div>
      </section>

      <section id="campus" className="campus-overview">
        <div className="section-heading">
          <h2>广西大学，留在毕业记忆里的母校</h2>
          <p>
            坐落在南宁的广西大学，是广西办学历史最悠久、规模最大的综合性大学
          </p>
        </div>

        <div className="overview-grid">
          <div className="overview-text">
            {campusOverview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="fact-board" aria-label="广西大学基本信息">
            {schoolFacts.map((fact) => (
              <div key={fact.label} className="fact-item">
                <strong>{fact.label}</strong>
                <span>{fact.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="spot-section">
        <div className="section-heading compact">
          <h2>校园风光</h2>
          <br></br>
          <br></br>
        </div>

        <div className="campus-carousel">
          <div className="campus-feature">
            <AnimatePresence mode="wait">
              <motion.div
                className="campus-feature-image"
                key={featuredSpot.slug}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={featuredSpot.imageUrl}
                  alt={featuredSpot.imageAlt}
                  fill
                  sizes="(max-width: 900px) 100vw, 64vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="campus-feature-copy">
            <span>{String(activeSpot + 1).padStart(2, "0")} / {campusSpots.length}</span>
            <h3>{featuredSpot.name}</h3>
            <p>{featuredSpot.description}</p>
            <a href={featuredSpot.sourceUrl} target="_blank" rel="noreferrer">
              广西大学官网来源
            </a>
            <div className="carousel-controls" aria-label="校园风光轮播控制">
              <button type="button" onClick={showPreviousSpot} aria-label="上一张校园风光">
                <ArrowLeft size={18} weight="bold" />
              </button>
              <button type="button" onClick={showNextSpot} aria-label="下一张校园风光">
                <ArrowRight size={18} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div className="campus-thumb-track" aria-label="校园风光缩略图">
          {campusSpots.map((spot, index) => (
            <button
              className={index === activeSpot ? "campus-thumb active" : "campus-thumb"}
              key={spot.slug}
              type="button"
              onClick={() => setActiveSpot(index)}
              aria-label={`查看${spot.name}`}
            >
              <span className="campus-thumb-image">
                <Image src={spot.imageUrl} alt={spot.imageAlt} fill sizes="160px" />
              </span>
              <span className="campus-thumb-label">{spot.shortName}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="profile" className="profile-section">
        <div className="profile-card">
          <div className="carousel-panel">
            <div className="photo-stage">
              {activeImage ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage.url}
                    className="photo-frame"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                    animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.36 }}
                  >
                    <Image
                      src={activeImage.url}
                      alt={activeImage.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 44vw"
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="empty-photo">
                  <Images size={36} />
                  <span>还没有上传照片</span>
                </div>
              )}
            </div>

            {profile.photos.length > 1 ? (
              <div className="thumb-strip" aria-label="照片轮播">
                {profile.photos.map((photo, index) => (
                  <button
                    type="button"
                    key={photo.url}
                    className={index === activePhoto ? "thumb active" : "thumb"}
                    onClick={() => setActivePhoto(index)}
                    aria-label={`查看第 ${index + 1} 张照片`}
                  >
                    <Image src={photo.url} alt={photo.alt} fill sizes="80px" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="profile-copy">
            <p className="profile-kicker">GRADUATE PROFILE</p>
            <h2>{profile.name}</h2>
            <p className="major">{profile.majorClass}</p>
            <blockquote>{profile.signature}</blockquote>
            <div className="profile-meta">
              <span>
                <MapPin size={16} weight="bold" />
                广西大学
              </span>
            </div>
            <button className="profile-edit" type="button" onClick={openEditor}>
              <PencilSimple size={18} weight="bold" />
              编辑个人资料
            </button>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>图片与学校概况参考广西大学官网公开页面。</p>
        <a href="https://www.gxu.edu.cn/xdgl1/xxgk1.htm" target="_blank" rel="noreferrer">
          广西大学学校概况
        </a>
      </footer>

      <AnimatePresence>
        {editorOpen && draft ? (
          <motion.div
            className="editor-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside
              className="editor-panel"
              initial={reduceMotion ? false : { x: 420 }}
              animate={reduceMotion ? undefined : { x: 0 }}
              exit={reduceMotion ? undefined : { x: 420 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              aria-label="编辑个人资料"
            >
              <div className="editor-head">
                <div>
                  <p>编辑资料</p>
                  <h2>{profile.passwordSet ? "保存前校验密码" : "首次设置密码"}</h2>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  aria-label="关闭编辑面板"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              <div className="form-grid">
                <label>
                  <span>姓名</span>
                  <input
                    value={draft.name}
                    onChange={(event) => handleDraftChange("name", event.target.value)}
                  />
                </label>

                <label>
                  <span>专业班级</span>
                  <input
                    value={draft.majorClass}
                    onChange={(event) =>
                      handleDraftChange("majorClass", event.target.value)
                    }
                  />
                </label>

                <label className="wide">
                  <span>个性签名</span>
                  <textarea
                    rows={4}
                    value={draft.signature}
                    onChange={(event) =>
                      handleDraftChange("signature", event.target.value)
                    }
                  />
                </label>

                <div className="wide photo-editor">
                  <div className="photo-editor-head">
                    <span>照片轮播</span>
                    <label
                      className={
                        canAddPhoto && !uploadingPhoto
                          ? "photo-upload-button"
                          : "photo-upload-button disabled"
                      }
                    >
                      <Plus size={16} weight="bold" />
                      {uploadingPhoto ? "上传中" : "上传照片"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={!canAddPhoto || uploadingPhoto}
                        onChange={handlePhotoInputChange}
                      />
                    </label>
                  </div>

                  <div className="edit-photos">
                    {draft.photos.map((photo, index) => (
                      <div className="edit-photo" key={`${photo.url}-${index}`}>
                        <Image src={photo.url} alt={photo.alt} fill sizes="96px" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          aria-label={`删除第 ${index + 1} 张照片`}
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <small>照片会上传到 Supabase Storage。支持 JPG、PNG、WebP，最多 5 张。</small>
                </div>

                {!profile.passwordSet ? (
                  <label className="wide">
                    <span>设置编辑密码</span>
                    <input
                      type="password"
                      value={setupPassword}
                      onChange={(event) => setSetupPassword(event.target.value)}
                    />
                  </label>
                ) : (
                  <label className="wide">
                    <span>确认编辑密码</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </label>
                )}
              </div>

              {status.type !== "idle" ? (
                <div className={`status ${status.type}`}>
                  {status.type === "success" ? (
                    <CheckCircle size={18} weight="bold" />
                  ) : (
                    <WarningCircle size={18} weight="bold" />
                  )}
                  {status.text}
                </div>
              ) : null}

              <div className="editor-actions">
                <button className="ghost-button" type="button" onClick={() => setEditorOpen(false)}>
                  取消
                </button>
                <button
                  className="save-button"
                  type="button"
                  onClick={saveDraft}
                  disabled={savingProfile}
                >
                  <LockKey size={18} weight="bold" />
                  {savingProfile ? "保存中" : "保存资料"}
                </button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function getEditableProfile(profile: GraduateProfile): EditableProfile {
  return {
    name: profile.name,
    majorClass: profile.majorClass,
    signature: profile.signature,
    photos: profile.photos
  };
}

function MissingProfile({ publicId }: { publicId: string }) {
  return (
    <main className="missing-page">
      <div className="missing-card">
        <WarningCircle size={42} weight="duotone" />
        <h1>没有找到对应的留念页</h1>
        <p>
          当前访问 ID 为 <strong>{publicId}</strong>。请检查访问地址，或先在
          Supabase 中创建对应的毕业生记录。
        </p>
        <a href="/?id=gxu-2026-lin-yu">查看示例页面</a>
      </div>
    </main>
  );
}

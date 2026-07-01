import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Save, Send, ImagePlus } from "lucide-react";
import { createPost, updatePost, uploadImage } from "../lib/api";
import { GAMES_META, GROUPS } from "../lib/utils";
import { formatMnt, t } from "../lib/i18n";
import { useToast } from "../components/Toast";

const empty = {
  title: "",
  description: "",
  price: "",
  phone: "",
  facebook: "",
  game_slug: "mobile-legends",
  category: "",
  group: "300K-900K",
  images: [],
  status: "published",
};

export default function PostForm({ editing, onClose, onSaved }) {
  const [form, setForm] = useState(editing || empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (editing) setForm({ ...empty, ...editing, price: String(editing.price ?? "") });
    else setForm(empty);
  }, [editing]);

  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const { url } = await uploadImage(f);
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      }
      toast.success(`${files.length} ${t.postForm.uploaded}`);
    } catch (err) {
      toast.error(t.postForm.uploadFailed);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => {
    patch("images", form.images.filter((_, i) => i !== idx));
  };

  const submit = async (status) => {
    if (!form.title || !form.description || !form.price) {
      toast.warning(t.postForm.requiredWarn);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), status };
      if (editing) await updatePost(editing.id, payload);
      else await createPost(payload);
      toast.success(editing ? t.postForm.updated : (status === "draft" ? t.postForm.savedDraft : t.postForm.published));
      onSaved && onSaved();
    } catch (err) {
      toast.error(t.postForm.saveFail);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9995] bg-black/70 backdrop-blur-lg overflow-y-auto p-4 md:p-8"
      onClick={onClose}
      data-testid="post-form-modal"
    >
      <motion.div
        initial={{ y: 30, opacity: 0, filter: "blur(10px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto max-w-[1000px] glass-strong clip-angled relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300">
              {editing ? t.postForm.editKicker : t.postForm.createKicker}
            </div>
            <div className="font-display font-black text-3xl mt-1">{editing ? t.postForm.editTitle : t.postForm.createTitle}</div>
          </div>
          <button onClick={onClose} className="w-10 h-10 grid place-items-center rounded-full border border-white/10 text-white/60 hover:text-white transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <Field label={t.postForm.title} value={form.title} onChange={(v) => patch("title", v)} testid="form-title" placeholder={t.postForm.placeholderTitle} />
            <Field label={t.postForm.description} value={form.description} onChange={(v) => patch("description", v)} multiline testid="form-description" placeholder={t.postForm.placeholderDesc} />
            <div className="grid grid-cols-2 gap-4">
              <Field label={t.postForm.priceMnt} value={form.price} onChange={(v) => patch("price", v)} type="number" testid="form-price" placeholder={t.postForm.placeholderPrice} />
              <SelectField label={t.postForm.game} value={form.game_slug} onChange={(v) => patch("game_slug", v)} options={Object.values(GAMES_META).map((g) => ({ value: g.slug, label: g.name }))} testid="form-game" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t.postForm.group} value={form.group} onChange={(v) => patch("group", v)} options={GROUPS.map((g) => ({ value: g, label: g }))} testid="form-group" />
              <Field label={t.postForm.category} value={form.category} onChange={(v) => patch("category", v)} testid="form-category" placeholder={t.postForm.placeholderCategory} />
            </div>
            <Field label={t.postForm.phone} value={form.phone} onChange={(v) => patch("phone", v)} testid="form-phone" placeholder={t.postForm.placeholderPhone} />
            <Field label={t.postForm.facebook} value={form.facebook} onChange={(v) => patch("facebook", v)} testid="form-facebook" placeholder={t.postForm.placeholderFb} />
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/60 block mb-2">{t.postForm.images} ({form.images.length})</label>
            <div className="grid grid-cols-3 gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10 bg-[#05070B]">
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110" aria-hidden="true" />
                  <img src={img} alt="" className="relative w-full h-full object-contain p-1" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-black/70 border border-white/20 opacity-0 group-hover:opacity-100 transition z-10">
                    <Trash2 className="w-3 h-3 text-red-300" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-white/15 hover:border-cyan-400/60 grid place-items-center cursor-pointer transition text-white/50 hover:text-cyan-300" data-testid="form-upload">
                <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                {uploading ? (
                  <div className="text-[10px] font-mono uppercase tracking-widest">{t.postForm.uploading}</div>
                ) : (
                  <div className="text-center">
                    <ImagePlus className="w-5 h-5 mx-auto" />
                    <div className="mt-1 font-mono text-[9px] uppercase tracking-widest">{t.postForm.add}</div>
                  </div>
                )}
              </label>
            </div>

            {form.images[0] && (
              <div className="mt-6">
                <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/60 mb-2">{t.postForm.preview}</div>
                <div className="glass p-4 rounded-xl relative overflow-hidden">
                  <div className="rounded-lg overflow-hidden bg-[#05070B] relative">
                    <img src={form.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110" aria-hidden="true" />
                    <img src={form.images[0]} alt="" className="relative w-full max-h-[280px] object-contain mx-auto" />
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-display font-bold">{form.title || t.postForm.untitled}</div>
                    <div className="font-display font-black text-2xl text-cyan-300 mt-1">{formatMnt(parseFloat(form.price || 0))}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-white/5 flex flex-wrap items-center gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost" data-testid="form-cancel">{t.postForm.cancel}</button>
          <button onClick={() => submit("draft")} disabled={saving} className="btn-ghost" data-testid="form-save-draft">
            <Save className="w-4 h-4" /> {t.postForm.saveDraft}
          </button>
          <button onClick={() => submit("published")} disabled={saving} className="btn-primary" data-testid="form-publish">
            <Send className="w-4 h-4" /> {editing ? t.postForm.update : t.postForm.publish}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, onChange, type = "text", multiline, testid, placeholder }) {
  const Cmp = multiline ? "textarea" : "input";
  return (
    <div>
      <label className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/60 block mb-2">{label}</label>
      <Cmp
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 4 : undefined}
        data-testid={testid}
        className="w-full bg-[#05070B] border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none rounded-lg px-4 py-3 text-sm placeholder:text-white/30"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, testid }) {
  return (
    <div>
      <label className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/60 block mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="w-full bg-[#05070B] border border-white/10 focus:border-cyan-400/60 outline-none rounded-lg px-4 py-3 text-sm"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

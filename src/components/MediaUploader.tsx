import React, { useEffect, useMemo, useRef, useState } from "react";
import { Images, Video, FileText, Upload, Trash2 } from "lucide-react";

export type SavedMeta = {
  mediaType: "IMAGE" | "VIDEO" | "BROCHURE";
  name: string;
  size: number;
};

// ---- Limits (tweak as needed) ----
const MAX_IMAGE_SIZE_MB = 100;     // per image
const MAX_VIDEO_SIZE_MB = 2500;    // single video
const MAX_BROCHURE_SIZE_MB = 200; // single brochure
const MAX_TOTAL_SIZE_MB = 3500;   // images + video + brochure combined

// ---- Toast (no deps) ----
function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = (text: string) => {
    setMsg(text);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2800);
  };
  const Toast = () =>
    msg ? (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded bg-black/80 text-white px-3 py-2 text-sm shadow">
        {msg}
      </div>
    ) : null;
  return { show, Toast };
}

const bytesToMB = (b: number) => +(b / (1024 * 1024)).toFixed(2);

const clearInput = (ref: React.RefObject<HTMLInputElement | null>) => {
  if (ref.current) {
    ref.current.value = "";
  }
};

type FilesPayload = {
  video: File | null;
  images: File[];
  brochure: File | null;
};

type Props = {
  // same callback you already use in the parent
  onChanged: (meta: SavedMeta[], files?: FilesPayload) => void;
  // optional caps
  minImages?: number;  // default 4
  maxImages?: number;  // default 8
};

const MediaUploader: React.FC<Props> = ({ onChanged, minImages = 4, maxImages = 8 }) => {
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [brochure, setBrochure] = useState<File | null>(null);

  // inputs (kept hidden; buttons trigger clicks)
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const vidInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const { show, Toast } = useToast();

  const totalSizeBytes = useMemo(() => {
    const imgSum = images.reduce((s, f) => s + f.size, 0);
    const vid = video?.size ?? 0;
    const doc = brochure?.size ?? 0;
    return imgSum + vid + doc;
  }, [images, video, brochure]);

  // Build lightweight meta for parent
  const meta = useMemo<SavedMeta[]>(() => {
    const imgMeta = images.map((f) => ({ mediaType: "IMAGE" as const, name: f.name, size: f.size }));
    const vidMeta = video ? [{ mediaType: "VIDEO" as const, name: video.name, size: video.size }] : [];
    const docMeta = brochure ? [{ mediaType: "BROCHURE" as const, name: brochure.name, size: brochure.size }] : [];
    return [...imgMeta, ...vidMeta, ...docMeta];
  }, [images, video, brochure]);

  // Notify parent on any change
  useEffect(() => {
    onChanged(meta, { images, video, brochure });
  }, [meta, images, video, brochure, onChanged]);

  // ---------- Handlers ----------
  // const handleAddImages = (files: FileList | null) => {
  //   if (!files || files.length === 0) return;
  //   const selected = Array.from(files).filter((f) => f.type.startsWith("image/"));

  //   if (images.length + selected.length > maxImages) {
  //     const allowed = maxImages - images.length;
  //     if (allowed <= 0) {
  //       alert(`You can upload up to ${maxImages} images.`);
  //       return;
  //     }
  //     alert(`Only ${allowed} more image(s) allowed (max ${maxImages}). Trimming selection.`);
  //     selected.splice(allowed);
  //   }

  //   setImages((prev) => [...prev, ...selected]);
  //   // clear the input so the same file can be re-picked if needed
  //   if (imgInputRef.current) imgInputRef.current.value = "";
  // };

  const handleAddImages = (files: FileList | null) => {
  // always clear at the end (even on early returns)
  try {
    if (!files || files.length === 0) return;

    // type + per-file size filter
    const picked = Array.from(files).filter((f) => {
      const okType = f.type.startsWith("image/") || /\.heic$/i.test(f.name) || /\.heif$/i.test(f.name);
      const okSize = bytesToMB(f.size) <= MAX_IMAGE_SIZE_MB;
      if (!okType) show(`Unsupported image type: ${f.name}`);
      if (!okSize) show(`Image too large (>${MAX_IMAGE_SIZE_MB} MB): ${f.name}`);
      return okType && okSize;
    });

    if (picked.length === 0) return;

    // enforce max image count
    let allowedCount = Math.min(picked.length, maxImages - images.length);
    if (allowedCount <= 0) {
      show(`You can upload up to ${maxImages} images.`);
      return;
    }

    let candidate = picked.slice(0, allowedCount);

    // enforce total size cap
    const nextTotal = candidate.reduce((s, f) => s + f.size, totalSizeBytes);
    if (bytesToMB(nextTotal) > MAX_TOTAL_SIZE_MB) {
      // trim until under cap
      while (candidate.length && bytesToMB(candidate.reduce((s, f) => s + f.size, totalSizeBytes)) > MAX_TOTAL_SIZE_MB) {
        candidate.pop();
      }
      if (candidate.length === 0) {
        show(`Total upload limit ${MAX_TOTAL_SIZE_MB} MB exceeded.`);
        return;
      }
      show(`Trimmed selection to stay under ${MAX_TOTAL_SIZE_MB} MB.`);
    }

    setImages((prev) => [...prev, ...candidate]);
  } finally {
    clearInput(imgInputRef);
  }
};


  // const handleAddVideo = (files: FileList | null) => {
  //   if (!files || files.length === 0) return;
  //   const f = files[0];
  //   if (!f.type.startsWith("video/")) {
  //     alert("Please select a valid video file.");
  //     return;
  //   }
  //   setVideo(f);
  //   if (vidInputRef.current) vidInputRef.current.value = "";
  // };

const handleAddVideo = (files: FileList | null) => {
  try {
    if (!files || files.length === 0) return;
    const f = files[0];
    const okType = f.type.startsWith("video/");
    const okSize = bytesToMB(f.size) <= MAX_VIDEO_SIZE_MB;
    if (!okType) return show("Please select a valid video file.");
    if (!okSize) return show(`Video must be ≤ ${MAX_VIDEO_SIZE_MB} MB.`);

    const nextTotal = totalSizeBytes - (video?.size ?? 0) + f.size;
    if (bytesToMB(nextTotal) > MAX_TOTAL_SIZE_MB) {
      return show(`Total upload limit ${MAX_TOTAL_SIZE_MB} MB exceeded.`);
    }
    setVideo(f);
  } finally {
    clearInput(vidInputRef);
  }
};

  // const handleAddBrochure = (files: FileList | null) => {
  //   if (!files || files.length === 0) return;
  //   const f = files[0];
  //   // allow common docs + pdf
  //   const ok =
  //     f.type === "application/pdf" ||
  //     f.name.toLowerCase().endsWith(".pdf") ||
  //     f.name.toLowerCase().endsWith(".doc") ||
  //     f.name.toLowerCase().endsWith(".docx");
  //   if (!ok) {
  //     alert("Please select a PDF or DOC/DOCX file for the brochure.");
  //     return;
  //   }
  //   setBrochure(f);
  //   if (docInputRef.current) docInputRef.current.value = "";
  // };

const handleAddBrochure = (files: FileList | null) => {
  try {
    if (!files || files.length === 0) return;
    const f = files[0];
    const okType = f.type === "application/pdf" || /\.pdf$/i.test(f.name) || /\.docx?$/i.test(f.name);
    if (!okType) return show("Brochure must be PDF or DOC/DOCX.");
    const okSize = bytesToMB(f.size) <= MAX_BROCHURE_SIZE_MB;
    if (!okSize) return show(`Brochure must be ≤ ${MAX_BROCHURE_SIZE_MB} MB.`);

    const nextTotal = totalSizeBytes - (brochure?.size ?? 0) + f.size;
    if (bytesToMB(nextTotal) > MAX_TOTAL_SIZE_MB) {
      return show(`Total upload limit ${MAX_TOTAL_SIZE_MB} MB exceeded.`);
    }
    setBrochure(f);
  } finally {
    clearInput(docInputRef);
  }
};


  const removeImageAt = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeVideo = () => setVideo(null);
  const removeBrochure = () => setBrochure(null);

  // Previews (object URLs) — cleaned up automatically by the browser when inputs are cleared
  const imageUrls = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);

  return (
  <div className="space-y-4">
    {/* Action buttons */}
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => imgInputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] transition"
      >
        <Images className="w-4 h-4" />
        Add Images ({images.length}/{maxImages})
      </button>

      <button
        type="button"
        onClick={() => vidInputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] transition"
      >
        <Video className="w-4 h-4" />
        {video ? "Replace Video" : "Add Video"}
      </button>

      <button
        type="button"
        onClick={() => docInputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] transition"
      >
        <FileText className="w-4 h-4" />
        {brochure ? "Replace Brochure" : "Add Brochure"}
      </button>
    </div>

    {/* Hidden Inputs */}
    <input
      ref={imgInputRef}
      type="file"
      multiple
      accept="image/*"
      className="hidden"
      onClick={() => clearInput(imgInputRef)}
      onChange={(e) => handleAddImages(e.target.files)}
    />
    <input
      ref={vidInputRef}
      type="file"
      accept="video/*"
      className="hidden"
      onClick={() => clearInput(vidInputRef)}
      onChange={(e) => handleAddVideo(e.target.files)}
    />
    <input
      ref={docInputRef}
      type="file"
      accept=".pdf,.doc,.docx,application/pdf"
      className="hidden"
      onClick={() => clearInput(docInputRef)}
      onChange={(e) => handleAddBrochure(e.target.files)}
    />

    {/* Images grid with remove X */}
    {images.length > 0 && (
      <div>
        <div className="mb-2 text-sm text-gray-600">
          Upload between {minImages}–{maxImages} images.
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {imageUrls.map((src, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white transition transform duration-200 hover:scale-[1.02]"
            >
              <img src={src} alt={`img-${idx}`} className="w-full h-28 object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => removeImageAt(idx)}
                className="absolute top-2 right-2 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
              >
                <Trash2 className="w-5 h-5 text-orange-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Video chip */}
    {video && (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="truncate text-sm inline-flex items-center gap-2">
          <Video className="w-4 h-4 text-orange-500" />
          {video.name}
        </div>
        <button
          type="button"
          onClick={removeVideo}
          className="ml-3 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
          aria-label="Remove video"
        >
          <Trash2 className="w-5 h-5 text-orange-500" />
        </button>
      </div>
    )}

    {/* Brochure chip */}
    {brochure && (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="truncate text-sm inline-flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-500" />
          {brochure.name}
        </div>
        <button
          type="button"
          onClick={removeBrochure}
          className="ml-3 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
          aria-label="Remove brochure"
        >
          <Trash2 className="w-5 h-5 text-orange-500" />
        </button>
      </div>
    )}

    {/* Total size indicator */}
    <div className="text-sm text-gray-600 inline-flex items-center gap-2">
      <Upload className="w-4 h-4 text-orange-500" />
      Total selected: {bytesToMB(totalSizeBytes)} MB (limit {MAX_TOTAL_SIZE_MB} MB)
    </div>

    {/* Toast portal */}
    <Toast />
  </div>
);

};

export default MediaUploader;

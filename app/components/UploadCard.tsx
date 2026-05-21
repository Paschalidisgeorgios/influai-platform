"use client";

import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";

import { supabase } from "@/app/lib/supabase";

interface UploadCardProps {
  title: string;
}

export default function UploadCard({
  title,
}: UploadCardProps) {

  const [preview, setPreview] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [uploaded, setUploaded] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  async function uploadFile(file: File) {

    try {

      setUploading(true);
      setUploaded(false);

      const fileExt = file.name.split(".").pop();

      const fileName = `${Date.now()}.${fileExt}`;

      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (error) {

        alert(error.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setPreview(data.publicUrl);

      setUploaded(true);

    } catch (error) {

      console.error(error);

      alert("Upload failed");

    } finally {

      setUploading(false);
    }
  }

  const handleChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = event.target.files?.[0];

    if (!file) return;

    await uploadFile(file);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLDivElement>
  ) => {

    event.preventDefault();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    await uploadFile(file);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`group relative flex aspect-[3/4] cursor-pointer overflow-hidden rounded-[28px] border transition-all duration-300 ${
        dragActive
          ? "border-[#D6A35D] bg-[#D6A35D]/10 shadow-[0_0_40px_rgba(214,163,93,0.25)]"
          : "border-white/10 bg-black/30 hover:border-[#D6A35D]/40 hover:bg-[#D6A35D]/5"
      }`}
    >

      {/* Preview */}
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex w-full flex-col items-center justify-center p-6 text-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04] transition group-hover:bg-[#D6A35D]/10">

            <UploadCloud className="h-9 w-9 text-zinc-500 transition group-hover:text-[#D6A35D]" />

          </div>

          <h3 className="mt-6 text-lg font-medium text-white">

            {title}

          </h3>

          <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-zinc-500">

            Drag & drop image here or click to upload.

          </p>

        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md">

          <div className="rounded-2xl border border-white/10 bg-black/50 px-6 py-4 text-sm text-white">

            Uploading...

          </div>

        </div>
      )}

      {/* Success */}
      {uploaded && !uploading && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-400 backdrop-blur-xl">

          <CheckCircle2 className="h-4 w-4" />

          Uploaded

        </div>
      )}

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" />

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

    </motion.div>
  );
}
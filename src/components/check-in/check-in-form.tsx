"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUpload } from "@/components/camera/photo-upload";
import { createClient } from "@/lib/supabase/client";
import { checkInCandidate } from "@/lib/supabase/rpc";

const checkInSchema = z.object({
  full_name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid").or(z.literal("")),
  phone: z.string().min(10, "Nomor WhatsApp wajib diisi"),
  position: z.string().min(1, "Posisi wajib diisi"),
  outlet_id: z.string().min(1, "Outlet wajib dipilih"),
  notes: z.string().optional(),
});

type CheckInValues = z.infer<typeof checkInSchema>;

interface Outlet {
  id: string;
  name: string;
  code: string;
}

interface CheckInFormProps {
  outlets: Outlet[];
}

export function CheckInForm({ outlets }: CheckInFormProps) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckInValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: { outlet_id: outlets[0]?.id ?? "", notes: "", email: "" },
  });

  const onSubmit = async (values: CheckInValues) => {
    if (!photoUrl) {
      toast.error("Foto wajib diambil menggunakan kamera");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await checkInCandidate(supabase, {
      ...values,
      photo_url: photoUrl,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error);
    } else if (data) {
      toast.success(`Kandidat ${data.queue_number} berhasil check-in`);
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Foto Kandidat *</Label>
        <PhotoUpload onUploaded={setPhotoUrl} />
      </div>

      {/* Name + Position */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nama Lengkap *</Label>
          <Input id="full_name" {...register("full_name")} placeholder="Nama lengkap" className="rounded-xl" />
          {errors.full_name && <p className="text-xs text-rose-500">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="position">Posisi *</Label>
          <Input id="position" {...register("position")} placeholder="Posisi yang dilamar" className="rounded-xl" />
          {errors.position && <p className="text-xs text-rose-500">{errors.position.message}</p>}
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register("email")} placeholder="email@example.com" className="rounded-xl" />
          {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">WhatsApp *</Label>
          <Input id="phone" {...register("phone")} placeholder="08123456789" className="rounded-xl" />
          {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Outlet */}
      <div className="space-y-1.5">
        <Label>Outlet *</Label>
        <Select
          defaultValue={outlets[0]?.id}
          onValueChange={(v) => v && setValue("outlet_id", v)}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Pilih outlet" />
          </SelectTrigger>
          <SelectContent>
            {outlets.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.outlet_id && <p className="text-xs text-rose-500">{errors.outlet_id.message}</p>}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Catatan opsional..." className="rounded-xl" rows={2} />
      </div>

      <button
        type="submit"
        disabled={submitting || !photoUrl}
        className="w-full rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {submitting ? "Menyimpan..." : "Check In Kandidat"}
      </button>
    </form>
  );
}

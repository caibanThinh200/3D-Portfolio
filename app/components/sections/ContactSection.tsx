"use client";

import { useForm } from "react-hook-form";

type ContactFormValues = {
  fullName: string;
  phone: string;
  email: string;
  note: string;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/90 placeholder:text-white/30 outline-none transition-colors focus:border-cyan-400/60 focus:bg-white/[0.05]";
const labelClass = "mb-2 block text-[11px] uppercase tracking-[0.3em] text-cyan-400";
const errorClass = "mt-1.5 text-xs text-rose-400";

export default function ContactSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactFormValues>({
    defaultValues: { fullName: "", phone: "", email: "", note: "" },
  });

  const onSubmit = async (data: ContactFormValues) => {
    // Mock submit — replace with a real API call
    await new Promise((r) => setTimeout(r, 800));
    console.log("Contact form submitted:", data);
    reset();
  };

  return (
    <section
      id="contact"
      className="flex min-h-screen items-center px-6 py-24 sm:px-12 lg:px-16 xl:px-24 border-t border-white/5"
    >
      <div className="pointer-events-auto flex w-full flex-col gap-6 lg:ml-auto lg:w-1/2">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyan-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />
          <span>Phase 05 &bull; Contact</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex w-full max-w-lg flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#14172b] to-[#0a0c1a] px-6 pb-6 pt-5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
        >
          <div>
            <h2 className="font-serif text-2xl font-light text-white/90 sm:text-3xl">
              Contact &amp; Connect
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Have a project in mind? Leave a note and I&apos;ll get back to you.
            </p>
          </div>

          <div>
            <label htmlFor="fullName" className={labelClass}>Full name</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              className={inputClass}
              {...register("fullName", { required: "Full name is required" })}
            />
            {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+84 900 000 000"
                className={inputClass}
                {...register("phone", {
                  required: "Phone is required",
                  pattern: { value: /^[+\d][\d\s().-]{6,}$/, message: "Invalid phone number" },
                })}
              />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                })}
              />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="note" className={labelClass}>Note</label>
            <textarea
              id="note"
              rows={4}
              placeholder="Tell me about your project..."
              className={`${inputClass} resize-none`}
              {...register("note", { required: "Please leave a short note" })}
            />
            {errors.note && <p className={errorClass}>{errors.note.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-xs uppercase tracking-[0.3em] text-cyan-300 transition-all hover:bg-cyan-400/20 hover:shadow-[0_0_20px_-4px_#00d4ff] disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send message"}
          </button>

          {isSubmitSuccessful && (
            <p className="text-xs text-cyan-300" role="status">
              Thanks! Your message has been sent.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

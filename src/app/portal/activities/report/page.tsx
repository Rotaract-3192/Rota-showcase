"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Send, CheckCircle2, UploadCloud, Loader2 } from "lucide-react";
import { useCreateActivity } from "@/mutations/activity.mutations";
import { useProfile } from "@/hooks/useProfile";

// Form Schema Definition
const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  venue: z.string().min(2, "Venue is required."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  sameAsStart: z.boolean().optional(),
  activityType: z.enum(["Standalone", "Collaborative"]),
  externalNGO: z.boolean().optional(),
  organizationName: z.string().optional(),
  avenues: z.array(z.string()).min(1, "Select at least one avenue."),
  focusAreas: z.array(z.string()).optional(),
  activityExpenses: z.coerce.number().min(0).optional(),
  cashContribution: z.coerce.number().min(0).optional(),
  inKindContribution: z.coerce.number().min(0).optional(),
  participants: z.coerce.number().min(1, "Participants must be at least 1"),
  beneficiaries: z.coerce.number().min(0),
  volunteers: z.coerce.number().min(1, "Volunteers must be at least 1"),
  volunteerHours: z.coerce.number().min(1, "Hours must be at least 1"),
  submitForPublication: z.boolean().optional(),
  featureActivity: z.boolean().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const avenuesList = [
  "Club Service", "Community Service", "Professional Development",
  "International Service", "Public Relations", "Public Image", "Next Gen"
];

const focusList = [
  "Peacebuilding", "Disease Prevention", "Water & Sanitation",
  "Maternal & Child Health", "Education & Literacy", 
  "Community Economic Development", "Environmental Support"
];

const steps = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Schedule & Type" },
  { id: 3, title: "Avenues & Focus" },
  { id: 4, title: "Finance & Impact" },
  { id: 5, title: "Media & Publish" },
];

export default function ReportActivityPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { club } = useProfile();
  const { mutateAsync: createActivity, isPending } = useCreateActivity();

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      avenues: [],
      focusAreas: [],
      activityType: "Standalone",
      sameAsStart: false,
      externalNGO: false,
      submitForPublication: false,
      featureActivity: false,
      activityExpenses: 0,
      cashContribution: 0,
      inKindContribution: 0,
    },
  });

  const sameAsStart = watch("sameAsStart");
  const externalNGO = watch("externalNGO");

  const nextStep = async () => {
    // We could trigger validation for specific fields per step here
    // For simplicity, we just allow advancing until final submit where Zod catches everything
    let isValid = false;
    if (currentStep === 1) isValid = await trigger(["title", "venue", "description"]);
    if (currentStep === 2) isValid = await trigger(["startDate", "endDate"]);
    if (currentStep === 3) isValid = await trigger(["avenues", "focusAreas"]);
    if (currentStep === 4) isValid = await trigger(["participants", "beneficiaries", "volunteers", "volunteerHours"]);
    
    if (isValid || currentStep === 5) {
      if (currentStep < 5) setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (data: ReportFormValues) => {
    if (!club?.id) {
      setErrorMsg("You must be assigned to a Club to report an activity. Please update your profile or contact district support.");
      return;
    }

    try {
      setErrorMsg("");
      const payload: any = {
        club_id: club.id,
        title: data.title,
        description: data.description,
        status: "DRAFT",
        activity_category: data.activityType,
        is_external_ngo: data.externalNGO || false,
        organization_name: data.organizationName || null,
        avenues: data.avenues,
        focus_areas: data.focusAreas || [],
        activity_expenses: data.activityExpenses || 0,
        cash_contribution: data.cashContribution || 0,
        in_kind_contribution: data.inKindContribution || 0,
        participants: data.participants,
        beneficiaries: data.beneficiaries,
        volunteers: data.volunteers,
        volunteer_hours: data.volunteerHours,
        submit_for_publication: data.submitForPublication || false,
        feature_activity: data.featureActivity || false,
        start_time: new Date(data.startDate).toISOString(),
        end_time: new Date(data.sameAsStart ? data.startDate : (data.endDate || data.startDate)).toISOString(),
        venue: data.venue,
      };

      await createActivity(payload);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit activity");
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    setErrorMsg("Validation failed on one or more steps. Please go back and check your inputs.");
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center">
        <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6 animate-bounce" />
        <h2 className="font-headline text-3xl font-bold text-white mb-2">Activity Reported Successfully!</h2>
        <p className="text-slate-400 font-body mb-8">
          Your project report has been securely transmitted to the district command center. 
          It is now pending review for showcase publication.
        </p>
        <Link
          href="/portal/activities"
          className="px-6 py-3 rounded-full bg-electric-blue text-navy-deep font-bold text-sm uppercase tracking-wider hover:bg-ocean-glow transition-all"
        >
          Return to Activities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <Link href="/portal/activities" className="inline-flex items-center gap-2 text-xs font-metadata font-bold text-slate-500 hover:text-white uppercase mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Activities
        </Link>
        <h1 className="font-headline text-3xl font-bold text-white tracking-tight">Report Activity</h1>
        <p className="text-slate-400 text-sm font-body mt-1">
          Submit details about your club's project to record impact and qualify for district rankings.
        </p>
      </div>

      {errorMsg && (
        <div className="text-red-500 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-metadata uppercase tracking-wider">
          {errorMsg}
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center justify-between relative mb-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800/60 -z-10 rounded-full" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-electric-blue -z-10 rounded-full transition-all duration-500" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-metadata transition-colors ${
              currentStep >= step.id ? "bg-electric-blue text-navy-deep" : "bg-navy-dark border border-slate-700 text-slate-500"
            }`}>
              {step.id}
            </div>
            <span className={`text-[10px] font-metadata uppercase tracking-wider hidden sm:block ${
              currentStep >= step.id ? "text-electric-blue" : "text-slate-500"
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="bg-navy-dark/40 border border-slate-800/60 p-6 md:p-8 rounded-2xl flex flex-col gap-6">
        
        {/* STEP 1: Basic Info */}
        <div className={currentStep === 1 ? "block" : "hidden"}>
          <h2 className="font-headline text-xl font-bold text-white mb-6 border-b border-slate-800/60 pb-3">Basic Information</h2>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Activity Title *</label>
              <input
                {...register("title")}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                placeholder="e.g. Project Jal Dhara"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Venue *</label>
              <input
                {...register("venue")}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                placeholder="Location name"
              />
              {errors.venue && <p className="text-red-400 text-xs mt-1">{errors.venue.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Description *</label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-y"
                placeholder="Provide a detailed description of the activity and its objectives..."
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* STEP 2: Schedule & Type */}
        <div className={currentStep === 2 ? "block" : "hidden"}>
          <h2 className="font-headline text-xl font-bold text-white mb-6 border-b border-slate-800/60 pb-3">Schedule & Classification</h2>
          <div className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Start Date *</label>
                <input
                  type="date"
                  {...register("startDate")}
                  className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none transition-all [color-scheme:dark]"
                />
                {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">End Date *</label>
                <input
                  type="date"
                  disabled={sameAsStart}
                  {...register("endDate")}
                  className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none transition-all [color-scheme:dark] disabled:opacity-50"
                />
                {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="sameAsStart" {...register("sameAsStart")} className="w-4 h-4 rounded border-slate-600 bg-navy-deep/60 accent-electric-blue" />
              <label htmlFor="sameAsStart" className="text-sm text-slate-300">End date is the same as Start date (Single day event)</label>
            </div>

            <div className="h-px w-full bg-slate-800/60 my-2" />

            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Activity Type *</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input type="radio" value="Standalone" {...register("activityType")} className="accent-electric-blue w-4 h-4" />
                  Standalone Activity
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input type="radio" value="Collaborative" {...register("activityType")} className="accent-electric-blue w-4 h-4" />
                  Collaborative Activity
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="externalNGO" {...register("externalNGO")} className="w-4 h-4 rounded border-slate-600 bg-navy-deep/60 accent-electric-blue" />
                <label htmlFor="externalNGO" className="text-sm text-slate-300">External NGO Involved</label>
              </div>
              {externalNGO && (
                <input
                  {...register("organizationName")}
                  className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all mt-2"
                  placeholder="Enter Organization Name"
                />
              )}
            </div>

          </div>
        </div>

        {/* STEP 3: Avenues & Focus */}
        <div className={currentStep === 3 ? "block" : "hidden"}>
          <h2 className="font-headline text-xl font-bold text-white mb-6 border-b border-slate-800/60 pb-3">Avenues & Focus Areas</h2>
          
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Avenue Of Service * (Select all that apply)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {avenuesList.map(ave => (
                  <label key={ave} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-navy-deep/40 hover:bg-navy-dark transition-colors cursor-pointer text-sm text-slate-300">
                    <input type="checkbox" value={ave} {...register("avenues")} className="accent-electric-blue w-4 h-4" />
                    {ave}
                  </label>
                ))}
              </div>
              {errors.avenues && <p className="text-red-400 text-xs mt-1">{errors.avenues.message}</p>}
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Area of Focus (Select all that apply)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {focusList.map(foc => (
                  <label key={foc} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-navy-deep/40 hover:bg-navy-dark transition-colors cursor-pointer text-sm text-slate-300">
                    <input type="checkbox" value={foc} {...register("focusAreas")} className="accent-electric-blue w-4 h-4" />
                    {foc}
                  </label>
                ))}
              </div>
              {errors.focusAreas && <p className="text-red-400 text-xs mt-1">{errors.focusAreas.message}</p>}
            </div>
          </div>
        </div>

        {/* STEP 4: Finance & Impact */}
        <div className={currentStep === 4 ? "block" : "hidden"}>
          <h2 className="font-headline text-xl font-bold text-white mb-6 border-b border-slate-800/60 pb-3">Finance & Impact Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Financial Details */}
            <div className="flex flex-col gap-5">
              <h3 className="font-metadata text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Financial Details (INR)</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Activity Expenses</label>
                <input type="number" {...register("activityExpenses", { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" placeholder="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Cash Contribution Raised</label>
                <input type="number" {...register("cashContribution", { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" placeholder="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">In-Kind Contribution Value</label>
                  <span className="text-[9px] text-slate-500 font-metadata lowercase italic">Non-monetary donations like goods/services instead of cash</span>
                </div>
                <input type="number" {...register("inKindContribution", { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" placeholder="0" />
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="flex flex-col gap-5">
              <h3 className="font-metadata text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Impact Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Participants *</label>
                  <input type="number" {...register("participants", { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" placeholder="0" />
                  {errors.participants && <p className="text-red-400 text-xs">{errors.participants.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Beneficiaries *</label>
                  <input type="number" {...register("beneficiaries", { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" placeholder="0" />
                  {errors.beneficiaries && <p className="text-red-400 text-xs">{errors.beneficiaries.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Volunteers *</label>
                  <input type="number" {...register("volunteers", { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" placeholder="0" />
                  {errors.volunteers && <p className="text-red-400 text-xs">{errors.volunteers.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Volunteer Hours *</label>
                  <input type="number" {...register("volunteerHours", { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl bg-navy-deep/60 border border-slate-800 focus:border-electric-blue/40 text-sm text-slate-200 focus:outline-none" placeholder="0" />
                  {errors.volunteerHours && <p className="text-red-400 text-xs">{errors.volunteerHours.message}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 5: Media & Publish */}
        <div className={currentStep === 5 ? "block" : "hidden"}>
          <h2 className="font-headline text-xl font-bold text-white mb-6 border-b border-slate-800/60 pb-3">Media & Publication</h2>
          
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">Upload Photos</label>
              <label className="border-2 border-dashed border-slate-700/80 rounded-2xl p-12 flex flex-col items-center justify-center bg-navy-deep/30 hover:bg-navy-deep/50 transition-colors cursor-pointer group relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-electric-blue mb-4 transition-colors" />
                <p className="text-sm text-slate-300 font-bold">
                  {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-body">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              </label>
            </div>

            <div className="flex flex-col gap-4 p-5 rounded-xl bg-navy-deep/50 border border-slate-800/60">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register("submitForPublication")} className="w-5 h-5 rounded border-slate-600 bg-navy-deep/60 accent-electric-blue" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Submit For District Publication</span>
                  <span className="text-xs text-slate-400">Request the PR team to publish this on the District Social Media handles. (Maximum of 2 events per club per month).</span>
                </div>
              </label>

              <div className="h-px w-full bg-slate-800/40 my-1" />

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register("featureActivity")} className="w-5 h-5 rounded border-slate-600 bg-navy-deep/60 accent-electric-blue" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Feature This Activity</span>
                  <span className="text-xs text-slate-400">Nominate this activity to be featured on the District Portal Showcase homepage.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div className="mt-4 pt-6 border-t border-slate-800/60 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm font-bold"
            >
              Previous Step
            </button>
          ) : (
            <div /> // Placeholder for alignment
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 rounded-lg bg-electric-blue text-navy-deep hover:bg-ocean-glow transition-colors text-sm font-bold"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-electric-blue to-ocean-glow text-navy-deep hover:opacity-90 transition-opacity text-sm font-bold flex items-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Activity
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}

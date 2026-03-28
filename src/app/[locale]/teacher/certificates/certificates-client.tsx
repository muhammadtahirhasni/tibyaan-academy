"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Award, Download, Eye, X, Inbox } from "lucide-react";

interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  certificateType: string;
  issuedAt: string;
  certificateUrl: string | null;
}

const typeLabels: Record<string, string> = {
  course_complete: "Course Complete",
  level_complete: "Level Complete",
  hafiz: "Hafiz",
  aalim: "Aalim",
  faazil: "Faazil",
};

const typeColors: Record<string, string> = {
  course_complete: "border-green-300 text-green-700 dark:text-green-400",
  level_complete: "border-blue-300 text-blue-700 dark:text-blue-400",
  hafiz: "border-emerald-300 text-emerald-700 dark:text-emerald-400",
  aalim: "border-purple-300 text-purple-700 dark:text-purple-400",
  faazil: "border-amber-300 text-amber-700 dark:text-amber-400",
};

export function CertificatesClient({ certificates }: { certificates: Certificate[] }) {
  const t = useTranslations("teacher");
  const [showPreview, setShowPreview] = useState<Certificate | null>(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
          <Award className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("certificatesTitle")}</h1>
          <p className="text-sm text-muted-foreground">{certificates.length} issued</p>
        </div>
      </motion.div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t("noCertificatesYet")}</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-3">
          {certificates.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="rounded-xl border bg-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-amber-900 dark:to-emerald-900 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{cert.studentName}</p>
                    <p className="text-xs text-muted-foreground">{cert.courseName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("issuedDate")}: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={typeColors[cert.certificateType] ?? ""}>{typeLabels[cert.certificateType] ?? cert.certificateType}</Badge>
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setShowPreview(cert)}><Eye className="w-3 h-3" />{t("previewCertificate")}</Button>
                  {cert.certificateUrl && (
                    <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="text-xs gap-1"><Download className="w-3 h-3" />{t("downloadPDF")}</Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-card border-b">
              <h3 className="text-lg font-semibold text-foreground">{t("previewCertificate")}</h3>
              <button onClick={() => setShowPreview(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
              <div className="border-4 border-double border-emerald-600 rounded-lg p-8 text-center relative">
                <div className="absolute top-2 start-2 w-8 h-8 border-t-2 border-s-2 border-amber-500 rounded-tl-lg" />
                <div className="absolute top-2 end-2 w-8 h-8 border-t-2 border-e-2 border-amber-500 rounded-tr-lg" />
                <div className="absolute bottom-2 start-2 w-8 h-8 border-b-2 border-s-2 border-amber-500 rounded-bl-lg" />
                <div className="absolute bottom-2 end-2 w-8 h-8 border-b-2 border-e-2 border-amber-500 rounded-br-lg" />
                <p className="text-amber-600 text-xl font-bold mb-1" style={{ fontFamily: "serif" }}>بسم الله الرحمن الرحيم</p>
                <div className="w-16 h-0.5 bg-emerald-500 mx-auto my-3" />
                <h2 className="text-emerald-800 text-3xl font-bold mb-2" style={{ fontFamily: "serif" }}>Tibyaan Academy</h2>
                <p className="text-emerald-600 text-sm mb-6">Certificate of Achievement</p>
                <p className="text-gray-600 text-sm mb-2">This is to certify that</p>
                <p className="text-emerald-800 text-2xl font-bold mb-2">{showPreview.studentName}</p>
                <p className="text-gray-600 text-sm mb-1">has successfully completed</p>
                <p className="text-emerald-700 text-lg font-semibold mb-4">{showPreview.courseName} — {typeLabels[showPreview.certificateType] ?? showPreview.certificateType}</p>
                <div className="w-24 h-0.5 bg-amber-400 mx-auto my-4" />
                <div className="flex justify-between items-end mt-6 px-8">
                  <div className="text-center"><div className="w-32 border-b border-gray-400 mb-1" /><p className="text-xs text-gray-500">Date: {new Date(showPreview.issuedAt).toLocaleDateString()}</p></div>
                  <div className="text-center"><div className="w-32 border-b border-gray-400 mb-1" /><p className="text-xs text-gray-500">Director, Tibyaan Academy</p></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card border-t flex justify-end"><Button variant="outline" onClick={() => setShowPreview(null)}>Close</Button></div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

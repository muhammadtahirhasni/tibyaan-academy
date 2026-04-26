"use client";

import { motion } from "framer-motion";
import { Award, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  course_complete: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  level_complete: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  hafiz: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  aalim: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  faazil: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function AdminCertificatesClient({ certificates }: { certificates: Certificate[] }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
        <p className="text-sm text-muted-foreground">
          Issue and manage certificates for students. Only admins have this authority.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card overflow-hidden"
      >
        {certificates.length === 0 ? (
          <div className="text-center py-16">
            <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No certificates issued yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Certificates can be issued once students complete courses
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-start px-4 py-3 font-medium">Student</th>
                  <th className="text-start px-4 py-3 font-medium">Course</th>
                  <th className="text-start px-4 py-3 font-medium">Type</th>
                  <th className="text-start px-4 py-3 font-medium">Issued</th>
                  <th className="text-start px-4 py-3 font-medium">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{cert.studentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cert.courseName}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${typeColors[cert.certificateType] ?? "bg-muted text-muted-foreground"}`}>
                        {typeLabels[cert.certificateType] ?? cert.certificateType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {cert.certificateUrl ? (
                        <div className="flex gap-2">
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <a
                            href={cert.certificateUrl}
                            download
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

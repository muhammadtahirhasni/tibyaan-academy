"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, X, Check } from "lucide-react";

interface Course {
  id: string;
  slug: string;
  nameEn: string;
  nameUr: string;
  nameAr: string;
  nameFr: string;
  nameId: string;
  courseType: string;
  pricePlan1Monthly: string | null;
  pricePlan2Monthly: string | null;
  isActive: boolean;
  enrollmentCount: number;
}

const emptyCourse = {
  slug: "", nameEn: "", nameUr: "", nameAr: "", nameFr: "", nameId: "",
  courseType: "nazra" as string,
  pricePlan1Monthly: "", pricePlan2Monthly: "",
  descriptionEn: "", descriptionUr: "", descriptionAr: "", descriptionFr: "", descriptionId: "",
};

export default function AdminCoursesPage() {
  const t = useTranslations("admin");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyCourse);

  const fetchCourses = () => {
    setLoading(true);
    fetch("/api/admin/courses")
      .then((res) => res.json())
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCreate = async () => {
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowAdd(false);
    setForm(emptyCourse);
    fetchCourses();
  };

  const handleUpdate = async (id: string, data: Record<string, unknown>) => {
    await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingId(null);
    fetchCourses();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await handleUpdate(id, { isActive: !isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t("sidebarCourses")}</h2>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 me-1" />
          {t("addCourse")}
        </Button>
      </div>

      {/* Add Course Form */}
      {showAdd && (
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold">{t("addCourse")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm" />
            <select value={form.courseType} onChange={(e) => setForm({ ...form, courseType: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm">
              <option value="nazra">Nazra</option>
              <option value="hifz">Hifz</option>
              <option value="arabic">Arabic</option>
              <option value="aalim">Aalim</option>
            </select>
            <input placeholder="Name (EN)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm" />
            <input placeholder="Name (UR)" value={form.nameUr} onChange={(e) => setForm({ ...form, nameUr: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm" />
            <input placeholder="Name (AR)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm" />
            <input placeholder="Name (FR)" value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm" />
            <input placeholder="Name (ID)" value={form.nameId} onChange={(e) => setForm({ ...form, nameId: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm" />
            <input placeholder="Plan 1 Price" type="number" value={form.pricePlan1Monthly}
              onChange={(e) => setForm({ ...form, pricePlan1Monthly: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm" />
            <input placeholder="Plan 2 Price" type="number" value={form.pricePlan2Monthly}
              onChange={(e) => setForm({ ...form, pricePlan2Monthly: e.target.value })}
              className="border rounded-lg px-3 py-2 bg-background text-sm" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>
              <Check className="w-4 h-4 me-1" /> {t("save")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setForm(emptyCourse); }}>
              <X className="w-4 h-4 me-1" /> {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start px-4 py-3 font-medium">{t("courseName")}</th>
                <th className="text-start px-4 py-3 font-medium">{t("courseType")}</th>
                <th className="text-start px-4 py-3 font-medium">{t("price")} (P1/P2)</th>
                <th className="text-start px-4 py-3 font-medium">{t("enrollments")}</th>
                <th className="text-start px-4 py-3 font-medium">{t("status")}</th>
                <th className="text-start px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("noResults")}</td></tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{course.nameEn}</td>
                    <td className="px-4 py-3 capitalize">{course.courseType}</td>
                    <td className="px-4 py-3">
                      ${course.pricePlan1Monthly ?? "—"} / ${course.pricePlan2Monthly ?? "—"}
                    </td>
                    <td className="px-4 py-3">{course.enrollmentCount}</td>
                    <td className="px-4 py-3">
                      {course.isActive ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                          {t("active")}
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full dark:bg-gray-800 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(course.id, course.isActive)}
                      >
                        {course.isActive ? t("deactivateCourse") : t("activateCourse")}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

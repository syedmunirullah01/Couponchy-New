"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { ConfirmModal } from "@/components/ui/AppModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, useDialogA11yIds } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

const blogSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and URL-friendly."),
  excerpt: z.string().trim().min(1, "Excerpt is required.").max(500, "Excerpt must stay under 500 characters."),
  content: z.string().trim().min(1, "Content is required."),
  image: z.string().trim().min(1, "Cover image URL or upload is required."),
  category: z.string().trim().min(1, "Category is required."),
  readTime: z.string().trim().default("5 min read"),
  isFeatured: z.boolean().default(false),
  authorName: z.string().trim().default("Couponchy Team"),
  authorRole: z.string().trim().default("Savings Experts"),
  authorAvatar: z.string().trim().default("C"),
  authorBio: z.string().trim().default("The Couponchy Team is dedicated to automated coupon verification, checkout optimizations, and sharing the best savings strategies to help you get the lowest price."),
});

const defaultValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  category: "Savings Hacks",
  readTime: "5 min read",
  isFeatured: false,
  authorName: "Couponchy Team",
  authorRole: "Savings Experts",
  authorAvatar: "C",
  authorBio: "The Couponchy Team is dedicated to automated coupon verification, checkout optimizations, and sharing the best savings strategies to help you get the lowest price.",
};

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="stroke-current opacity-25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanHTMLContent(rawHtml) {
  if (typeof window === "undefined" || !rawHtml) return "";
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  function cleanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tagName = node.tagName.toUpperCase();

    // Disallowed tags
    if (["SCRIPT", "STYLE", "META", "LINK", "HEAD", "TITLE", "SVG", "IMG"].includes(tagName)) {
      return "";
    }

    // Recursively clean children
    let childContent = "";
    for (let i = 0; i < node.childNodes.length; i++) {
      childContent += cleanNode(node.childNodes[i]);
    }

    const tag = tagName.toLowerCase();

    // Standard styling & structure tags
    if (["P", "H2", "H3", "H4", "STRONG", "B", "EM", "I", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE"].includes(tagName)) {
      const finalTag = (tag === "b" ? "strong" : tag === "i" ? "em" : tag);
      if (finalTag === "p" && node.classList.contains("lead")) {
        return `<p class="lead">${childContent}</p>`;
      }
      return `<${finalTag}>${childContent}</${finalTag}>`;
    }

    if (tagName === "A") {
      const href = node.getAttribute("href");
      if (href) {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${childContent}</a>`;
      }
      return childContent;
    }

    if (tagName === "BR") {
      return "<br />";
    }

    if (tagName === "H1") {
      return `<h2>${childContent}</h2>`;
    }
    if (["H5", "H6"].includes(tagName)) {
      return `<h3>${childContent}</h3>`;
    }

    // Unwrap divs, spans, tables etc.
    return childContent;
  }

  let result = "";
  for (let i = 0; i < doc.body.childNodes.length; i++) {
    result += cleanNode(doc.body.childNodes[i]);
  }

  return result
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

export default function AdminBlogsManager() {
  const [blogs, setBlogs] = useState([]);
  const [isHydrating, setIsHydrating] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editorTab, setEditorTab] = useState("write"); // 'write' or 'preview'
  const slugEditedRef = useRef(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [editorDragActive, setEditorDragActive] = useState(false);

  const { titleId, descriptionId } = useDialogA11yIds();

  const handleEditorDragOver = (e) => {
    e.preventDefault();
    setEditorDragActive(true);
  };

  const handleEditorDragLeave = (e) => {
    e.preventDefault();
    setEditorDragActive(false);
  };

  const handleEditorDrop = (e) => {
    e.preventDefault();
    setEditorDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith(".html") || file.type === "text/html") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileContent = event.target.result;
          const cleaned = cleanHTMLContent(fileContent);
          insertHTMLContent(cleaned);
          toast.success("HTML file content cleaned and inserted!");
        };
        reader.readAsText(file);
      } else {
        toast.error("Please drop a valid .html file.");
      }
    }
  };

  const handleEditorPaste = (e) => {
    const html = e.clipboardData?.getData("text/html");
    if (html && html.trim()) {
      e.preventDefault();
      const cleaned = cleanHTMLContent(html);
      if (cleaned.trim()) {
        insertHTMLContent(cleaned);
        toast.success("Rich text parsed, cleaned, and inserted!");
      } else {
        const text = e.clipboardData.getData("text/plain");
        if (text) {
          insertHTMLContent(text);
        }
      }
    }
  };

  function insertHTMLContent(html) {
    const textarea = textareaRef.current;
    if (!textarea) {
      const text = watch("content") || "";
      setValue("content", text + html, { shouldDirty: true, shouldValidate: true });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const replacement = html;

    setValue("content", text.substring(0, start) + replacement + text.substring(end), {
      shouldDirty: true,
      shouldValidate: true,
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues,
  });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedExcerpt = watch("excerpt");
  const watchedContent = watch("content");
  const watchedImage = watch("image");
  const watchedCategory = watch("category");
  const watchedReadTime = watch("readTime");
  const watchedIsFeatured = watch("isFeatured");
  const watchedAuthorName = watch("authorName");
  const watchedAuthorRole = watch("authorRole");
  const watchedAuthorAvatar = watch("authorAvatar");
  const watchedAuthorBio = watch("authorBio");

  async function loadData(showRefreshState = false) {
    if (showRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsHydrating(true);
    }

    try {
      const response = await fetch("/api/blogs", { cache: "no-store" });
      const payload = await response.json();
      setBlogs(payload.data || []);
    } catch (err) {
      toast.error("Failed to load blog posts.");
    } finally {
      setIsHydrating(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Autofill slug from title unless manually edited
  useEffect(() => {
    if (!slugEditedRef.current && !editingBlog) {
      setValue("slug", slugify(watchedTitle || ""), { shouldValidate: true });
    }
  }, [setValue, watchedTitle, editingBlog]);

  function openCreateModal() {
    slugEditedRef.current = false;
    setEditingBlog(null);
    setEditorTab("write");
    reset(defaultValues);
    setOpen(true);
  }

  function openEditModal(blog) {
    slugEditedRef.current = true;
    setEditingBlog(blog);
    setEditorTab("write");
    reset({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image: blog.image || "",
      category: blog.category,
      readTime: blog.readTime || "5 min read",
      isFeatured: Boolean(blog.isFeatured),
      authorName: blog.authorName || "Couponchy Team",
      authorRole: blog.authorRole || "Savings Experts",
      authorAvatar: blog.authorAvatar || "C",
      authorBio: blog.authorBio || "",
    });
    setOpen(true);
  }

  async function submitBlog(values) {
    const endpoint = editingBlog ? `/api/blogs/${editingBlog.id}` : "/api/blogs";
    const method = editingBlog ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error || "Unable to save blog post.");
      return;
    }

    await loadData();
    setOpen(false);
    setEditingBlog(null);
    slugEditedRef.current = false;
    reset(defaultValues);
    toast.success(editingBlog ? "Blog post updated." : "Blog post created.");
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/blogs/${deleteTarget.id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error || "Unable to delete blog post.");
        return;
      }

      await loadData();
      setDeleteTarget(null);
      toast.success("Blog post deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete blog post.");
    } finally {
      setIsDeleting(false);
    }
  }

  // --- Image Upload Handlers ---
  function validateImage(file) {
    const acceptedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
      return "Cover image must be PNG, JPG, or WEBP.";
    }
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      return "Cover image must be 5MB or smaller.";
    }
    return null;
  }

  async function uploadImageFile(file) {
    const errorMsg = validateImage(file);
    if (errorMsg) {
      setError("image", { type: "manual", message: errorMsg });
      toast.error(errorMsg);
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", watchedSlug || slugify(watchedTitle || "blog-cover"));

      const response = await fetch("/api/uploads/blog-image", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Image upload failed.");
      }

      setValue("image", payload.data.secureUrl, { shouldDirty: true, shouldValidate: true });
      clearErrors("image");
      toast.success("Cover image uploaded successfully!");
    } catch (err) {
      setError("image", { type: "manual", message: err.message });
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileInputChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageFile(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImageFile(file);
    }
  }

  // Insert tags in HTML content editor
  function insertHTMLTag(tagOpen, tagClose = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + selectedText + tagClose;

    setValue("content", text.substring(0, start) + replacement + text.substring(end), {
      shouldDirty: true,
      shouldValidate: true,
    });

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selectedText.length);
    }, 50);
  }

  return (
    <>
      <Card className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-white">Blog Posts Management</CardTitle>
            <CardDescription className="text-sm text-[var(--muted)]">
              Create, update, and manage editorial articles, guides, and news.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-lg border border-[var(--border)] px-0 text-white hover:bg-[var(--surface-soft)]"
              onClick={() => loadData(true)}
              aria-label="Refresh blog posts"
              disabled={isRefreshing}
            >
              {isRefreshing ? <Spinner /> : <RefreshIcon />}
            </Button>
            <Button type="button" onClick={openCreateModal} className="bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)]">
              Add Blog Post
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[var(--border)]">
                  <TableHead className="text-[var(--muted)] font-semibold">Post</TableHead>
                  <TableHead className="text-[var(--muted)] font-semibold">Category</TableHead>
                  <TableHead className="text-[var(--muted)] font-semibold">Author</TableHead>
                  <TableHead className="text-[var(--muted)] font-semibold text-center">Status</TableHead>
                  <TableHead className="text-[var(--muted)] font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id} className="border-b border-[var(--border)] hover:bg-white/[0.01]">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-neutral-900">
                          {blog.image ? (
                            <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted)]">No Image</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-[280px]" title={blog.title}>{blog.title}</p>
                          <p className="text-xs text-[var(--muted)] truncate max-w-[240px]">/{blog.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-2 py-0.5 text-xs font-medium">
                        {blog.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-white">{blog.authorName}</p>
                        <p className="text-xs text-[var(--muted)]">{blog.authorRole}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {blog.isFeatured ? (
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold leading-5 text-emerald-400 border border-emerald-500/20">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-neutral-500/10 px-2.5 py-0.5 text-xs font-semibold leading-5 text-neutral-400 border border-neutral-500/10">
                          Standard
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEditModal(blog)} className="text-white border-[var(--border)] hover:bg-[var(--surface-soft)]">
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="border border-red-500/20 text-red-400 hover:bg-red-500/10"
                          onClick={() => setDeleteTarget(blog)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!blogs.length && !isHydrating ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-5 py-8 text-center text-sm text-[var(--muted)]">
              No blog posts added yet. Click "Add Blog Post" to publish your first article.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          titleId={titleId}
          descriptionId={descriptionId}
          className="max-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-0 sm:max-h-[calc(100vh-3rem)]"
        >
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-h-[calc(100vh-3rem)] lg:grid lg:grid-cols-[1.1fr_1.9fr]">
            {/* Left Column: Metadata Inputs */}
            <div className="border-b border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),var(--surface))] p-6 lg:border-r lg:border-b-0 lg:p-8 overflow-y-auto max-h-[calc(100vh-10rem)] lg:max-h-[none]">
              <DialogHeader className="mb-6">
                <Badge className="w-fit border border-[var(--color-primary)]/20 bg-[var(--surface)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  Editorial Desk
                </Badge>
                <DialogTitle id={titleId} className="text-xl font-bold text-white mt-3">
                  {editingBlog ? "Edit Article" : "Create Article"}
                </DialogTitle>
                <DialogDescription id={descriptionId} className="text-xs text-[var(--muted)]">
                  Configure categories, SEO handles, cover images, and author badges.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Image Upload Area */}
                <div className="grid gap-2 text-sm">
                  <span className="font-semibold text-white">Cover Image</span>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-all ${
                      dragActive
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-primary)]/40"
                    }`}
                  >
                    {watchedImage ? (
                      <div className="absolute inset-0 p-1.5">
                        <div className="relative h-full w-full overflow-hidden rounded-xl">
                          <Image src={watchedImage} alt="Cover image preview" fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                            Change Image
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Spinner />
                        <span className="text-xs text-[var(--muted)]">Uploading image...</span>
                      </div>
                    ) : !watchedImage ? (
                      <>
                        <svg className="mx-auto h-8 w-8 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-xs font-semibold text-white">Drag & drop cover or click to browse</p>
                        <p className="mt-1 text-[10px] text-[var(--muted)]">PNG, JPG, WEBP up to 5MB</p>
                      </>
                    ) : null}

                    <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept="image/*" className="hidden" />
                  </div>
                  <Input
                    placeholder="Or enter image URL manually..."
                    className="rounded-lg bg-[var(--surface)] mt-1"
                    {...register("image")}
                  />
                  {errors.image ? <span className="text-xs text-[var(--color-primary)]">{errors.image.message}</span> : null}
                </div>

                {/* Form Fields: General Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                    <span className="font-semibold text-white">Category</span>
                    <Input placeholder="Savings Hacks" className="rounded-lg bg-[var(--surface)]" {...register("category")} />
                    {errors.category ? <span className="text-xs text-[var(--color-primary)]">{errors.category.message}</span> : null}
                  </label>

                  <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                    <span className="font-semibold text-white">Read Time</span>
                    <Input placeholder="5 min read" className="rounded-lg bg-[var(--surface)]" {...register("readTime")} />
                    {errors.readTime ? <span className="text-xs text-[var(--color-primary)]">{errors.readTime.message}</span> : null}
                  </label>
                </div>

                {/* Author Credentials */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Author Metadata</p>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    <label className="grid gap-1 text-[10px] text-[var(--muted)]">
                      <span className="font-semibold text-white">Name</span>
                      <Input placeholder="Couponchy Team" className="rounded-lg bg-[var(--surface-soft)] px-2.5 py-1 text-xs" {...register("authorName")} />
                    </label>
                    <label className="grid gap-1 text-[10px] text-[var(--muted)]">
                      <span className="font-semibold text-white">Role</span>
                      <Input placeholder="Savings Experts" className="rounded-lg bg-[var(--surface-soft)] px-2.5 py-1 text-xs" {...register("authorRole")} />
                    </label>
                    <label className="grid gap-1 text-[10px] text-[var(--muted)]">
                      <span className="font-semibold text-white">Avatar Letter</span>
                      <Input maxLength={1} placeholder="C" className="rounded-lg bg-[var(--surface-soft)] px-2.5 py-1 text-xs text-center" {...register("authorAvatar")} />
                    </label>
                  </div>

                  <label className="grid gap-1 text-[10px] text-[var(--muted)]">
                    <span className="font-semibold text-white">Bio Description</span>
                    <textarea
                      rows={2}
                      className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs text-white outline-none"
                      placeholder="Brief author credentials..."
                      {...register("authorBio")}
                    />
                  </label>
                </div>

                {/* Featured Checkbox */}
                <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 cursor-pointer select-none">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-[var(--surface)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" {...register("isFeatured")} />
                  <div>
                    <p className="text-sm font-semibold text-white">Feature this article</p>
                    <p className="text-xs text-[var(--muted)]">Display at the top grid hero spot of the public blog feed.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Column: Title, Slug, Excerpt, Content Editor with Live Preview */}
            <form className="flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]" onSubmit={handleSubmit(submitBlog)}>
              <div className="flex-1 p-6 lg:p-8 space-y-5 overflow-y-auto max-h-[calc(100vh-9rem)]">
                
                {/* Title */}
                <label className="grid gap-1.5 text-sm text-[var(--muted)]">
                  <span className="font-semibold text-white">Article Title</span>
                  <Input
                    placeholder="Mastering the checkout discount stack"
                    className="rounded-lg bg-[var(--surface)] text-base font-medium"
                    {...register("title")}
                  />
                  {errors.title ? <span className="text-xs text-[var(--color-primary)]">{errors.title.message}</span> : null}
                </label>

                {/* Slug */}
                <label className="grid gap-1.5 text-sm text-[var(--muted)]">
                  <span className="font-semibold text-white">URL Slug</span>
                  <Input
                    placeholder="mastering-discount-stack"
                    className="rounded-lg bg-[var(--surface)] font-mono text-sm"
                    {...register("slug", {
                      onChange: () => {
                        slugEditedRef.current = true;
                      },
                    })}
                  />
                  <span className="text-xs text-[var(--muted)]">The URL handle: <code>/blog/{watchedSlug || "slug-preview"}</code></span>
                  {errors.slug ? <span className="text-xs text-[var(--color-primary)]">{errors.slug.message}</span> : null}
                </label>

                {/* Excerpt */}
                <label className="grid gap-1.5 text-sm text-[var(--muted)]">
                  <span className="font-semibold text-white">Summary / Excerpt</span>
                  <textarea
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-primary)]"
                    placeholder="Provide a click-worthy 1-2 sentence lead overview of the article content..."
                    {...register("excerpt")}
                  />
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>Appears on listings and summaries.</span>
                    <span>{watchedExcerpt?.length || 0}/500</span>
                  </div>
                  {errors.excerpt ? <span className="text-xs text-[var(--color-primary)]">{errors.excerpt.message}</span> : null}
                </label>

                {/* Rich Content Tab Controller */}
                <div className="border-t border-[var(--border)] pt-5">
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="font-semibold text-white text-sm">Article Content (HTML formatting)</span>
                    <div className="flex rounded-lg bg-[var(--surface-soft)] p-0.5 border border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => setEditorTab("write")}
                        className={`rounded-md px-3.5 py-1 text-xs font-bold transition ${
                          editorTab === "write" ? "bg-[var(--surface)] text-white shadow-sm" : "text-[var(--muted)] hover:text-white"
                        }`}
                      >
                        Write HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab("preview")}
                        className={`rounded-md px-3.5 py-1 text-xs font-bold transition ${
                          editorTab === "preview" ? "bg-[var(--surface)] text-white shadow-sm" : "text-[var(--muted)] hover:text-white"
                        }`}
                      >
                        Live Preview
                      </button>
                    </div>
                  </div>

                  {editorTab === "write" ? (
                    <div className="space-y-2">
                      {/* Formatter Helpers Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Structure */}
                          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5" title="Structure tag insertion">
                            <button type="button" onClick={() => insertHTMLTag("<p class=\"lead\">", "</p>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--surface-soft)] transition" title="Introductory lead paragraph">Lead</button>
                            <button type="button" onClick={() => insertHTMLTag("<p>", "</p>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition" title="Standard paragraph">P</button>
                            <button type="button" onClick={() => insertHTMLTag("<h2>", "</h2>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition" title="Heading H2">H2</button>
                            <button type="button" onClick={() => insertHTMLTag("<h3>", "</h3>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition" title="Heading H3">H3</button>
                          </div>

                          {/* Inline Styling */}
                          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5" title="Emphasis">
                            <button type="button" onClick={() => insertHTMLTag("<strong>", "</strong>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition" title="Bold text">B</button>
                            <button type="button" onClick={() => insertHTMLTag("<em>", "</em>")} className="rounded px-2.5 py-1.5 text-xs italic font-bold text-white hover:bg-[var(--surface-soft)] transition" title="Italic text">I</button>
                          </div>

                          {/* Block Styling */}
                          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5" title="Layout Blocks">
                            <button type="button" onClick={() => insertHTMLTag("<blockquote>\n  \"", "\"\n</blockquote>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition" title="Block Quote">Quote</button>
                            <button type="button" onClick={() => insertHTMLTag("<div class=\"my-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6\">\n  <h4 class=\"text-white font-extrabold mb-3\">Title</h4>\n  <ol class=\"space-y-2 text-white/70 pl-5 list-decimal\">\n    <li>Item 1</li>\n  </ol>\n</div>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition" title="Framed Feature Box">Box</button>
                            <button type="button" onClick={() => insertHTMLTag("<div class=\"my-8 rounded-2xl border border-white/8 bg-[#070707] p-6 font-mono text-[13px] leading-relaxed text-white/80 overflow-x-auto\">\n  ", "\n</div>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-cyan-400 hover:bg-[var(--surface-soft)] transition" title="Code Block">Code</button>
                            <button type="button" onClick={() => insertHTMLTag("<ul>\n  <li>", "</li>\n</ul>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition" title="Bullet List">List</button>
                          </div>
                        </div>
                      </div>

                      <textarea
                        {...register("content")}
                        ref={(el) => {
                          register("content").ref(el);
                          textareaRef.current = el;
                        }}
                        rows={14}
                        className={`w-full resize-y rounded-xl border px-4 py-3 font-mono text-xs text-white outline-none transition-all ${
                          editorDragActive
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            : "border-[var(--border)] bg-[var(--surface)] focus:border-[var(--color-primary)]"
                        }`}
                        placeholder="Write content HTML here... (You can also drop a .html file or paste rich text from Word/Docs directly to parse it!)"
                        onPaste={handleEditorPaste}
                        onDragOver={handleEditorDragOver}
                        onDragLeave={handleEditorDragLeave}
                        onDrop={handleEditorDrop}
                      />
                      {errors.content ? <span className="text-xs text-[var(--color-primary)]">{errors.content.message}</span> : null}
                    </div>
                  ) : (
                    <div className="min-h-[280px] max-h-[460px] overflow-y-auto rounded-xl border border-[var(--border)] bg-black/60 p-6 md:p-8">
                      {watchedContent ? (
                        <article
                          className="prose prose-invert prose-custom max-w-none text-white/80 leading-[1.8] text-[0.98rem] space-y-5
                            prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-headings:mt-6 prose-headings:mb-3
                            prose-h2:text-[22px] prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-2
                            prose-strong:text-white prose-strong:font-black
                            prose-a:text-[var(--color-primary)] prose-a:underline
                            prose-li:text-white/75"
                          dangerouslySetInnerHTML={{ __html: watchedContent }}
                        />
                      ) : (
                        <p className="text-sm italic text-[var(--muted)] text-center mt-12">Nothing to preview. Enter some HTML content first.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col gap-3 border-t border-[var(--border)] p-6 bg-[var(--surface-soft)] sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" className="rounded-lg text-white border-[var(--border)] hover:bg-[var(--surface)]" onClick={() => setOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] font-bold px-6"
                  disabled={isSubmitting}
                  leadingIcon={isSubmitting ? <Spinner /> : null}
                >
                  {isSubmitting ? (editingBlog ? "Updating Article..." : "Saving Article...") : editingBlog ? "Update Article" : "Publish Article"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteTarget(null);
          }
        }}
        title="Delete Article"
        description={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.title}"? This cannot be undone, and the URL slug /blog/${deleteTarget.slug} will stop working.`
            : ""
        }
        confirmLabel="Delete Article"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirmed}
        isSubmitting={isDeleting}
      />
    </>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Bot,
    Plus,
    Edit,
    Trash2,
    Search,
    LayoutGrid,
    MessageSquare,
    Loader2,
    X,
    Check,
    ChevronRight,
    Languages,
    Tag as TagIcon,
    FileText,
    Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { AiKnowledgeCategory, AiKnowledgeEntry } from "@/lib/api";

export default function AiKnowledgePage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("entries");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data
    const [categories, setCategories] = useState<AiKnowledgeCategory[]>([]);
    const [entries, setEntries] = useState<AiKnowledgeEntry[]>([]);
    const [files, setFiles] = useState<api.AiKnowledgeFile[]>([]);

    // Filters
    const [entrySearch, setEntrySearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [langFilter, setLangFilter] = useState("all");

    // Dialogs
    const [catDialogOpen, setCatDialogOpen] = useState(false);
    const [entryDialogOpen, setEntryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AiKnowledgeCategory | null>(null);
    const [editingEntry, setEditingEntry] = useState<AiKnowledgeEntry | null>(null);

    // Form States
    const [catFormData, setCatFormData] = useState({
        name: "",
        description: "",
        isActive: true
    });

    const [entryFormData, setEntryFormData] = useState({
        title: "",
        question: "",
        answer: "",
        categoryId: "" as string,
        language: "en",
        tags: [] as string[],
        isActive: true
    });

    const [tagInput, setTagInput] = useState("");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [catsRes, entriesRes, filesRes] = await Promise.all([
                api.getAdminAiCategories(),
                api.getAdminAiEntries(),
                api.getAdminAiFiles()
            ]);

            if (catsRes.success) setCategories(catsRes.data || []);
            if (entriesRes.success) setEntries(entriesRes.data || []);
            if (filesRes.success) setFiles(filesRes.data || []);
        } catch (error) {
            console.error("Failed to fetch AI knowledge:", error);
            toast({
                title: "Error",
                description: "Failed to load AI knowledge data",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Category Actions ---

    const handleOpenCategoryDialog = (cat: AiKnowledgeCategory | null = null) => {
        if (cat) {
            setEditingCategory(cat);
            setCatFormData({
                name: cat.name,
                description: cat.description || "",
                isActive: cat.isActive
            });
        } else {
            setEditingCategory(null);
            setCatFormData({
                name: "",
                description: "",
                isActive: true
            });
        }
        setCatDialogOpen(true);
    };

    const handleSaveCategory = async () => {
        if (!catFormData.name) {
            toast({ title: "Error", description: "Category name is required", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            let res;
            if (editingCategory) {
                res = await api.updateAdminAiCategory(editingCategory.id, catFormData);
            } else {
                res = await api.createAdminAiCategory(catFormData);
            }

            if (res.success) {
                toast({ title: "Success", description: `Category ${editingCategory ? 'updated' : 'created'} successfully` });
                setCatDialogOpen(false);
                fetchData();
            } else {
                toast({ title: "Error", description: res.error?.message || "Failed to save category", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure? This will delete the category but not the entries (they will become uncategorized).")) return;

        try {
            const res = await api.deleteAdminAiCategory(id);
            if (res.success) {
                toast({ title: "Success", description: "Category deleted successfully" });
                fetchData();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
        }
    };

    // --- Entry Actions ---

    const handleOpenEntryDialog = (entry: AiKnowledgeEntry | null = null) => {
        if (entry) {
            setEditingEntry(entry);
            setEntryFormData({
                title: entry.title,
                question: entry.question || "",
                answer: entry.answer,
                categoryId: entry.categoryId || "none",
                language: entry.language,
                tags: entry.tags || [],
                isActive: entry.isActive
            });
        } else {
            setEditingEntry(null);
            setEntryFormData({
                title: "",
                question: "",
                answer: "",
                categoryId: "none",
                language: "en",
                tags: [],
                isActive: true
            });
        }
        setEntryDialogOpen(true);
    };

    const handleSaveEntry = async () => {
        if (!entryFormData.title || !entryFormData.answer) {
            toast({ title: "Error", description: "Title and Answer are required", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...entryFormData,
                categoryId: entryFormData.categoryId === "none" ? undefined : entryFormData.categoryId
            };

            let res;
            if (editingEntry) {
                res = await api.updateAdminAiEntry(editingEntry.id, payload);
            } else {
                res = await api.createAdminAiEntry(payload);
            }

            if (res.success) {
                toast({ title: "Success", description: `Entry ${editingEntry ? 'updated' : 'created'} successfully` });
                setEntryDialogOpen(false);
                fetchData();
            } else {
                toast({ title: "Error", description: res.error?.message || "Failed to save entry", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;

        try {
            const res = await api.deleteAdminAiEntry(id);
            if (res.success) {
                toast({ title: "Success", description: "Entry deleted successfully" });
                fetchData();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
        }
    };

    // --- File Actions ---

    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast({ title: "Error", description: "Only PDF files are allowed", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.uploadAdminAiFile(file);
            if (res.success) {
                toast({ title: "Success", description: "PDF uploaded and processed successfully" });
                fetchData();
            } else {
                toast({ title: "Error", description: res.error?.message || "Failed to upload PDF", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            e.target.value = "";
        }
    };

    const handleDeleteFile = async (id: string) => {
        if (!confirm("Are you sure? This will remove the knowledge derived from this PDF.")) return;

        try {
            const res = await api.deleteAdminAiFile(id);
            if (res.success) {
                toast({ title: "Success", description: "File deleted successfully" });
                fetchData();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
        }
    };

    const handleToggleFileStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await api.toggleAdminAiFileStatus(id, !currentStatus);
            if (res.success) {
                fetchData();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const handleAddTag = () => {
        if (!tagInput) return;
        if (!entryFormData.tags.includes(tagInput)) {
            setEntryFormData({
                ...entryFormData,
                tags: [...entryFormData.tags, tagInput]
            });
        }
        setTagInput("");
    };

    const handleRemoveTag = (tag: string) => {
        setEntryFormData({
            ...entryFormData,
            tags: entryFormData.tags.filter(t => t !== tag)
        });
    };

    const filteredEntries = entries.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(entrySearch.toLowerCase()) ||
            e.answer.toLowerCase().includes(entrySearch.toLowerCase());
        const matchesCat = catFilter === "all" || e.categoryId === catFilter;
        const matchesLang = langFilter === "all" || e.language === langFilter;
        return matchesSearch && matchesCat && matchesLang;
    });

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 sm:p-8 text-white"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Bot className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">AI Knowledge Base</h1>
                            <p className="text-white/70 text-sm">Train your support AI with custom knowledge</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            id="pdf-upload"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleUploadFile}
                            disabled={isSubmitting}
                        />
                        <Button
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                            onClick={() => document.getElementById('pdf-upload')?.click()}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                            Upload PDF
                        </Button>
                        <Button
                            className="bg-white text-indigo-600 hover:bg-white/90"
                            onClick={() => handleOpenEntryDialog()}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Knowledge
                        </Button>
                    </div>
                </div>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white p-1 rounded-xl shadow-sm border h-12">
                    <TabsTrigger value="entries" className="rounded-lg px-6 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Knowledge Entries
                    </TabsTrigger>
                    <TabsTrigger value="files" className="rounded-lg px-6 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <FileText className="h-4 w-4 mr-2" />
                        PDF Knowledge
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-lg px-6 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Categories
                    </TabsTrigger>
                </TabsList>

                {/* Entries Tab */}
                <TabsContent value="entries" className="space-y-6 outline-none">
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search titles or answers..."
                                        className="pl-10"
                                        value={entrySearch}
                                        onChange={(e) => setEntrySearch(e.target.value)}
                                    />
                                </div>
                                <Select value={catFilter} onValueChange={setCatFilter}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={langFilter} onValueChange={setLangFilter}>
                                    <SelectTrigger className="w-full md:w-32">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Languages</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[30%]">Title / Question</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Lang</TableHead>
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={6} className="h-16 animate-pulse bg-gray-50/20" />
                                        </TableRow>
                                    ))
                                ) : filteredEntries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            No knowledge entries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEntries.map(entry => (
                                        <TableRow key={entry.id} className="hover:bg-gray-50/30">
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-gray-900 line-clamp-1">{entry.title}</p>
                                                    {entry.question && (
                                                        <p className="text-xs text-gray-500 line-clamp-1 italic">Q: {entry.question}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                    {entry.category?.name || "Uncategorized"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="uppercase text-[10px]">
                                                    {entry.language}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-xs text-gray-500 line-clamp-2 max-w-[200px]">{entry.answer}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={entry.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                                    {entry.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEntryDialog(entry)}>
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value="files" className="space-y-6 outline-none">
                    <Card className="border-0 shadow-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Uploaded On</TableHead>
                                    <TableHead>Size / Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5} className="h-16 animate-pulse bg-gray-50/20" />
                                        </TableRow>
                                    ))
                                ) : files.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                            No training PDFs uploaded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    files.map(file => (
                                        <TableRow key={file.id} className="hover:bg-gray-50/30">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-red-50 flex items-center justify-center">
                                                        <FileText className="h-4 w-4 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{file.fileName}</p>
                                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline">View PDF</a>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(file.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500 uppercase">
                                                PDF
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={file.isActive}
                                                        onCheckedChange={() => handleToggleFileStatus(file.id, file.isActive)}
                                                    />
                                                    <span className="text-xs text-gray-500">{file.isActive ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="h-48 animate-pulse bg-gray-50" />
                            ))
                        ) : categories.length === 0 ? (
                            <div className="col-span-full h-48 flex items-center justify-center border-2 border-dashed rounded-2xl text-gray-400">
                                No categories created yet.
                            </div>
                        ) : (
                            categories.map(cat => (
                                <Card key={cat.id} className="border-0 shadow-md group overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-2">
                                                <LayoutGrid className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <Badge className={cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 font-normal border-0"}>
                                                {cat.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl">{cat.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                            {cat.description || "No description provided."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-50">
                                            <span className="text-sm font-medium text-gray-500">
                                                {cat._count?.entries || 0} Entries
                                            </span>
                                            <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenCategoryDialog(cat)}>
                                                    <Edit className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Category Dialog */}
            <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "New AI Knowledge Category"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="catName">Category Name</Label>
                            <Input
                                id="catName"
                                placeholder="e.g., Pest Control, Seeds..."
                                value={catFormData.name}
                                onChange={e => setCatFormData({ ...catFormData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="catDesc">Description</Label>
                            <Textarea
                                id="catDesc"
                                placeholder="What kind of knowledge does this category hold?"
                                value={catFormData.description}
                                onChange={e => setCatFormData({ ...catFormData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <Label htmlFor="catActive">Is Active</Label>
                            <Switch
                                id="catActive"
                                checked={catFormData.isActive}
                                onCheckedChange={checked => setCatFormData({ ...catFormData, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveCategory} disabled={isSubmitting} className="bg-indigo-600">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingCategory ? "Update" : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Entry Dialog */}
            <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                            {editingEntry ? "Edit Knowledge Entry" : "New Knowledge Entry"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="entryTitle">Title / Reference *</Label>
                                <Input
                                    id="entryTitle"
                                    placeholder="e.g., Tomato Blight Treatment"
                                    value={entryFormData.title}
                                    onChange={e => setEntryFormData({ ...entryFormData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="entryLang">Language</Label>
                                <Select value={entryFormData.language} onValueChange={v => setEntryFormData({ ...entryFormData, language: v })}>
                                    <SelectTrigger id="entryLang">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="entryCat">Category</Label>
                                <Select value={entryFormData.categoryId} onValueChange={v => setEntryFormData({ ...entryFormData, categoryId: v })}>
                                    <SelectTrigger id="entryCat">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (General)</SelectItem>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add tag..."
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                    />
                                    <Button type="button" size="icon" variant="outline" onClick={handleAddTag}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {entryFormData.tags.map(tag => (
                                        <Badge key={tag} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 pr-1 border-0">
                                            {tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-indigo-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="entryQuest">Related Question (Optional)</Label>
                                <Input
                                    id="entryQuest"
                                    placeholder="What users might ask..."
                                    value={entryFormData.question}
                                    onChange={e => setEntryFormData({ ...entryFormData, question: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="entryAns">Answer / Content *</Label>
                                <Textarea
                                    id="entryAns"
                                    placeholder="Provide the detailed information here..."
                                    className="min-h-[200px] resize-none"
                                    value={entryFormData.answer}
                                    onChange={e => setEntryFormData({ ...entryFormData, answer: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <Label htmlFor="entryActive">Is Active</Label>
                                <Switch
                                    id="entryActive"
                                    checked={entryFormData.isActive}
                                    onCheckedChange={checked => setEntryFormData({ ...entryFormData, isActive: checked })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEntryDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEntry} disabled={isSubmitting} className="bg-indigo-600 px-8">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingEntry ? "Update Entry" : "Save Knowledge"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

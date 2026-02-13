'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi as api } from '@/lib/api';

export default function BulkCouponUploadPage() {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const res = await api.bulkUploadCoupons(file);

            if (res.success && res.data) {
                setResult(res.data);
                toast({
                    title: 'Success',
                    description: 'File uploaded successfully',
                    variant: 'default',
                });
                setFile(null); // Reset file input
            } else {
                const errorMessage = res.error?.message || res.message || 'Upload failed';
                setError(errorMessage);
                toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                });
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Network error occurred');
            toast({
                title: 'Error',
                description: 'Network error occurred',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bulk Coupon Upload</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload an Excel file (.xlsx) containing Serial Numbers and Authentic Codes to generate product coupons.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                            Upload Excel File
                        </CardTitle>
                        <CardDescription>
                            The file must have columns: &quot;Serial Num&quot; and &quot;Authentic Code&quot;.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="w-full sm:w-auto"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Coupons
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle2 className="h-5 w-5" />
                                {result.count === 0 && result.duplicateRows > 0 ? 'Duplicate Upload Detected' : 'Upload Successful'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between py-1 border-b">
                                    <span className="font-medium">Assigned Batch ID:</span>
                                    <span className="font-mono font-bold text-primary">{result.batchId}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b">
                                    <span className="font-medium">Total Rows in File:</span>
                                    <span>{result.totalRows}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b">
                                    <span className="font-medium">Valid Records Found:</span>
                                    <span>{result.validRows}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b">
                                    <span className="font-medium">New Coupons Created:</span>
                                    <span className="text-green-600 font-bold">{result.count}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b text-amber-600">
                                    <span className="font-medium">Skipped (Already Exist):</span>
                                    <span>{result.duplicateRows}</span>
                                </div>

                                {result.count > 0 && (
                                    <div className="mt-6">
                                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                            <Link href="/admin/coupons">
                                                Go to Inventory
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {result.errors && result.errors.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-bold text-amber-700 dark:text-amber-400 mb-2">Warnings ({result.errors.length}):</p>
                                        <ul className="list-disc pl-5 space-y-1 text-amber-600 dark:text-amber-500 max-h-40 overflow-y-auto">
                                            {result.errors.map((e: string, i: number) => (
                                                <li key={i}>{e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <AlertCircle className="h-5 w-5" />
                                Upload Failed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

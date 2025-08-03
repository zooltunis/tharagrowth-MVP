import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ObjectUploader } from '@/components/ObjectUploader';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { UploadResult } from '@uppy/core';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  objectPath: string;
}

export default function UploadDataPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/upload', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setUploadStatus('uploading');
    
    try {
      for (const file of result.successful || []) {
        const response = await fetch('/api/upload-complete', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileURL: file.uploadURL,
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to complete upload');
        }

        const data = await response.json();
        
        // Add to uploaded files list
        const newFile: UploadedFile = {
          name: file.name || 'Unknown file',
          size: file.size || 0,
          type: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
          objectPath: data.objectPath,
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      }
      
      setUploadStatus('success');
      setUploadMessage(`تم رفع ${result.successful?.length || 0} ملف بنجاح!`);
    } catch (error) {
      console.error('Upload completion error:', error);
      setUploadStatus('error');
      setUploadMessage('حدث خطأ أثناء معالجة الملف');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          رفع ملفات البيانات الوهمية
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ارفع ملفات Excel أو CSV التي تحتوي على بيانات الاستثمار الوهمية للاختبار
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            رفع ملفات جديدة
          </CardTitle>
          <CardDescription>
            اختر ملفات Excel (.xlsx, .xls) أو CSV (.csv) أو JSON (.json) لرفعها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="w-full h-24 border-2 border-dashed border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 transition-colors"
            >
              <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
                <FileSpreadsheet className="h-8 w-8" />
                <span className="font-medium">اضغط لرفع الملفات</span>
                <span className="text-sm">Excel, CSV, JSON - حتى 10 ميجابايت</span>
              </div>
            </ObjectUploader>

            {/* Upload Status */}
            {uploadStatus !== 'idle' && (
              <div className={`p-4 rounded-lg flex items-center gap-2 ${
                uploadStatus === 'success' 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200' 
                  : uploadStatus === 'error'
                  ? 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                  : 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
              }`}>
                {uploadStatus === 'success' && <CheckCircle className="h-5 w-5" />}
                {uploadStatus === 'error' && <AlertCircle className="h-5 w-5" />}
                {uploadStatus === 'uploading' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                )}
                <span>{uploadMessage}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الملفات المرفوعة</CardTitle>
            <CardDescription>
              قائمة بجميع الملفات التي تم رفعها بنجاح
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <p>الحجم: {formatFileSize(file.size)}</p>
                          <p>النوع: {file.type}</p>
                          <p>تاريخ الرفع: {formatDate(file.uploadedAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">تم الرفع</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>تعليمات الاستخدام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">أنواع الملفات المدعومة:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>ملفات Excel (.xlsx, .xls)</li>
                <li>ملفات CSV (.csv)</li>
                <li>ملفات JSON (.json)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">البيانات المطلوبة:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>بيانات الأسهم (الرمز، السعر، القطاع، المعلومات المالية)</li>
                <li>بيانات العقارات (الأسعار، المواقع، خطط الدفع)</li>
                <li>بيانات الذهب والمعادن الثمينة</li>
                <li>بيانات السندات والصكوك</li>
                <li>مشاريع التمويل الجماعي</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">ملاحظات:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>الحد الأقصى لحجم الملف: 10 ميجابايت</li>
                <li>يمكن رفع حتى 5 ملفات في المرة الواحدة</li>
                <li>تأكد من صحة تنسيق البيانات قبل الرفع</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
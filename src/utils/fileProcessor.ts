import { Attachment } from '../types';
import { generateId, getFileType, compressImage } from './helpers';

// 处理文件，返回附件对象
export const processFile = async (file: File): Promise<Attachment> => {
  const fileType = getFileType(file);
  const attachment: Attachment = {
    id: generateId(),
    type: fileType === 'image' ? 'image' : 'file',
    name: file.name,
    content: '',
    size: file.size,
    mimeType: file.type,
  };

  try {
    switch (fileType) {
      case 'image':
        attachment.content = await processImage(file);
        break;
      case 'text':
        attachment.content = await processTextFile(file);
        break;
      case 'pdf':
        attachment.content = await processPdfFile(file);
        break;
      default:
        throw new Error(`不支持的文件类型: ${file.type}`);
    }
  } catch (error) {
    console.error('文件处理失败:', error);
    throw new Error(`处理文件 ${file.name} 失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  return attachment;
};

// 处理图片文件
const processImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 检查文件大小，如果太大则压缩
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const processImageFile = (imageFile: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('读取图片失败'));
      reader.readAsDataURL(imageFile);
    };

    if (file.size > maxSize) {
      // 压缩图片
      compressImage(file, 1024, 0.8)
        .then(processImageFile)
        .catch(reject);
    } else {
      processImageFile(file);
    }
  });
};

// 处理文本文件
const processTextFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // 限制文本长度
      const maxLength = 50000; // 50k 字符
      if (result.length > maxLength) {
        resolve(result.substring(0, maxLength) + '\n\n[文件内容已截断...]');
      } else {
        resolve(result);
      }
    };
    reader.onerror = () => reject(new Error('读取文本文件失败'));
    reader.readAsText(file, 'utf-8');
  });
};

// 处理 PDF 文件
const processPdfFile = async (file: File): Promise<string> => {
  // 注意：这里需要 PDF.js 库来解析 PDF
  // 为了简化，这里只返回文件信息
  return `[PDF 文件: ${file.name}, 大小: ${formatFileSize(file.size)}]\n\n注意：PDF 文件内容解析需要额外的库支持。`;
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 验证文件类型
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 20 * 1024 * 1024; // 20MB
  const allowedTypes = [
    'text/plain',
    'text/markdown',
    'application/json',
    'text/csv',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  // 检查文件大小
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `文件大小超过限制 (${formatFileSize(maxSize)})`
    };
  }

  // 检查文件类型
  const fileType = getFileType(file);
  if (fileType === 'other' && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的文件类型'
    };
  }

  return { valid: true };
};

// 批量处理文件
export const processFiles = async (files: File[]): Promise<Attachment[]> => {
  const results: Attachment[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      // 验证文件
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // 处理文件
      const attachment = await processFile(file);
      results.push(attachment);
    } catch (error) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : '处理失败'}`);
    }
  }

  if (errors.length > 0) {
    console.warn('部分文件处理失败:', errors);
  }

  return results;
};

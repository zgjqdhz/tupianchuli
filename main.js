document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.querySelector('.upload-btn');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const downloadBtn = document.getElementById('downloadBtn');
    const compressionControls = document.querySelector('.compression-controls');
    const previewSection = document.querySelector('.preview-section');

    let originalFile = null;
    let compressedFile = null;

    // 上传按钮点击事件
    uploadBtn.addEventListener('click', () => fileInput.click());

    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007AFF';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#E5E5E5';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#E5E5E5';
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFile(files[0]);
        }
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
        if (originalFile) {
            compressImage(originalFile, this.value / 100);
        }
    });

    // 下载按钮事件
    downloadBtn.addEventListener('click', () => {
        if (compressedFile) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedFile);
            link.download = 'compressed_' + originalFile.name;
            link.click();
        }
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    async function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }

        originalFile = file;
        compressionControls.style.display = 'block';
        previewSection.style.display = 'block';

        // 显示原始图片
        originalPreview.src = URL.createObjectURL(file);
        originalSize.textContent = `文件大小: ${formatFileSize(file.size)}`;

        // 压缩图片
        await compressImage(file, qualitySlider.value / 100);
    }

    async function compressImage(file, quality) {
        try {
            const options = {
                maxSizeMB: file.size / (1024 * 1024) * quality,
                maxWidthOrHeight: 4096,
                useWebWorker: true,
                initialQuality: quality,
                alwaysKeepResolution: true
            };

            compressedFile = await imageCompression(file, options);
            
            if (compressedFile.size > file.size) {
                compressedFile = file;
            }
            
            compressedPreview.src = URL.createObjectURL(compressedFile);
            compressedSize.textContent = `文件大小: ${formatFileSize(compressedFile.size)}`;
            
            const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
            compressedSize.textContent += ` (压缩率: ${compressionRatio}%)`;
        } catch (error) {
            console.error('压缩失败:', error);
            alert('图片压缩失败，请重试！');
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 
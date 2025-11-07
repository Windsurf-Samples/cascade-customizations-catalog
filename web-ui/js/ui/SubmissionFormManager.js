export class SubmissionFormManager {
    constructor() {
        this.selectedLabels = new Set();
        this.setupEventListeners();
        this.populateLabels();
    }
    
    setupEventListeners() {
        const submitBtn = document.getElementById('submitCustomizationBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.openModal());
        }
        
        const closeBtn = document.getElementById('closeSubmissionModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        const cancelBtn = document.getElementById('cancelSubmission');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        const modal = document.getElementById('submissionModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'submissionModal') this.closeModal();
            });
        }
        
        const categorySelect = document.getElementById('submitCategory');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.handleCategoryChange(e.target.value);
            });
        }
        
        const form = document.getElementById('submissionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
        
        this.setupFileUpload();
    }
    
    setupFileUpload() {
        const fileUploadZone = document.getElementById('fileUploadZone');
        const fileInput = document.getElementById('fileInput');
        
        if (!fileUploadZone || !fileInput) return;
        
        fileUploadZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadZone.classList.add('border-blue-500', 'bg-blue-50');
        });
        
        fileUploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadZone.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        fileUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadZone.classList.remove('border-blue-500', 'bg-blue-50');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
    }
    
    async handleFileUpload(file) {
        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
            alert('Please upload a markdown (.md) file');
            return;
        }
        
        try {
            const content = await file.text();
            
            const contentTextarea = document.getElementById('submitContent');
            if (contentTextarea) {
                contentTextarea.value = content;
            }
            
            this.showUploadSuccess(file.name);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Failed to read file. Please try again.');
        }
    }
    
    showUploadSuccess(filename) {
        const uploadPrompt = document.getElementById('uploadPrompt');
        const uploadSuccess = document.getElementById('uploadSuccess');
        const uploadedFileName = document.getElementById('uploadedFileName');
        
        if (uploadPrompt) uploadPrompt.classList.add('hidden');
        if (uploadSuccess) uploadSuccess.classList.remove('hidden');
        if (uploadedFileName) uploadedFileName.textContent = filename;
    }
    
    resetUploadUI() {
        const uploadPrompt = document.getElementById('uploadPrompt');
        const uploadSuccess = document.getElementById('uploadSuccess');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadPrompt) uploadPrompt.classList.remove('hidden');
        if (uploadSuccess) uploadSuccess.classList.add('hidden');
        if (fileInput) fileInput.value = '';
    }
    
    openModal() {
        const modal = document.getElementById('submissionModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal() {
        const modal = document.getElementById('submissionModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        this.resetForm();
    }
    
    resetForm() {
        document.getElementById('submissionForm').reset();
        this.selectedLabels.clear();
        this.updateLabelsDisplay();
        document.getElementById('subcategoryContainer').classList.add('hidden');
        document.getElementById('activationContainer').classList.add('hidden');
        this.resetUploadUI();
    }
    
    handleCategoryChange(category) {
        const subcategoryContainer = document.getElementById('subcategoryContainer');
        const activationContainer = document.getElementById('activationContainer');
        const subcategorySelect = document.getElementById('submitSubcategory');
        
        if (category === 'Rule') {
            subcategoryContainer.classList.remove('hidden');
            activationContainer.classList.remove('hidden');
            subcategorySelect.required = true;
        } else {
            subcategoryContainer.classList.add('hidden');
            activationContainer.classList.add('hidden');
            subcategorySelect.required = false;
            subcategorySelect.value = '';
        }
    }
    
    populateLabels() {
        const container = document.getElementById('labelsContainer');
        if (!container) return;
        
        const labelGroups = {
            'Languages': ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'rust', 'go', 'php', 'ruby', 'swift', 'kotlin', 'dart'],
            'Frameworks': ['react', 'vue', 'angular', 'svelte', 'nextjs', 'express', 'django', 'flask', 'spring', 'laravel'],
            'Tools': ['docker', 'kubernetes', 'git', 'github', 'aws', 'azure', 'terraform', 'jest', 'cypress'],
            'Areas': ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'security', 'testing', 'performance'],
            'Types': ['always-on', 'model-decision', 'glob-based', 'manual', 'beginner', 'intermediate', 'advanced']
        };
        
        let html = '';
        for (const [group, labels] of Object.entries(labelGroups)) {
            html += `<div class="mb-3">
                <div class="text-xs font-semibold text-gray-600 mb-1">${group}</div>
                <div class="flex flex-wrap gap-1">`;
            
            for (const label of labels) {
                html += `<button type="button" class="label-option px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-all" data-label="${label}">
                    ${label}
                </button>`;
            }
            
            html += `</div></div>`;
        }
        
        container.innerHTML = html;
        
        container.querySelectorAll('.label-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const label = e.target.dataset.label;
                if (this.selectedLabels.has(label)) {
                    this.selectedLabels.delete(label);
                    e.target.classList.remove('bg-blue-100', 'border-blue-500', 'text-blue-700');
                } else {
                    this.selectedLabels.add(label);
                    e.target.classList.add('bg-blue-100', 'border-blue-500', 'text-blue-700');
                }
            });
        });
    }
    
    updateLabelsDisplay() {
        const container = document.getElementById('labelsContainer');
        if (!container) return;
        
        container.querySelectorAll('.label-option').forEach(btn => {
            const label = btn.dataset.label;
            if (this.selectedLabels.has(label)) {
                btn.classList.add('bg-blue-100', 'border-blue-500', 'text-blue-700');
            } else {
                btn.classList.remove('bg-blue-100', 'border-blue-500', 'text-blue-700');
            }
        });
    }
    
    handleSubmit() {
        const submitBtn = document.getElementById('submitButton');
        const originalText = submitBtn.innerHTML;
        
        try {
            if (this.selectedLabels.size === 0) {
                alert('Please select at least one tag/label');
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
            
            const formData = {
                title: document.getElementById('submitTitle').value,
                description: document.getElementById('submitDescription').value,
                category: document.getElementById('submitCategory').value,
                subcategory: document.getElementById('submitSubcategory').value,
                labels: Array.from(this.selectedLabels),
                activation: document.getElementById('submitActivation').value,
                content: document.getElementById('submitContent').value,
                instructions: document.getElementById('submitInstructions').value,
                examples: document.getElementById('submitExamples').value
            };
            
            this.createPullRequest(formData);
            
            alert('Opening GitHub to create your pull request. Please review and submit the PR.');
            this.closeModal();
            
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Submission failed: ' + error.message + '\n\nPlease try again or submit manually via GitHub.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    createPullRequest(formData) {
        const isRule = formData.category === 'Rule';
        const subcategoryPath = formData.subcategory ? `${formData.subcategory}/` : '';
        
        const filename = formData.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '.md';
        
        // Use customizations directory with rules/ and workflows/ structure
        const filePath = isRule 
            ? `customizations/rules/${subcategoryPath}${filename}`
            : `customizations/workflows/${subcategoryPath}${filename}`;
        
        let fileContent = '';
        
        if (isRule) {
            // Generate YAML frontmatter with correct order and format
            fileContent = '---\n';
            if (formData.activation) {
                fileContent += `trigger: ${formData.activation}\n`;
            }
            fileContent += `description: ${formData.description}\n`;
            fileContent += `labels: ${formData.labels.join(', ')}\n`;
            fileContent += `author: Community Contribution\n`;
            fileContent += `modified: ${new Date().toISOString().split('T')[0]}\n`;
            fileContent += '---\n\n';
            
            fileContent += `# ${formData.title}\n\n`;
            
            fileContent += `## Description\n\n`;
            fileContent += `${formData.description}\n\n`;
            
            // Add the main content
            if (formData.content) {
                fileContent += formData.content;
            }
            
            if (formData.instructions) {
                fileContent += '\n\n## Usage Instructions\n\n' + formData.instructions;
            }
            if (formData.examples) {
                fileContent += '\n\n## Examples\n\n' + formData.examples;
            }
        } else {
            // Workflow format
            fileContent = '---\n';
            fileContent += `description: ${formData.description}\n`;
            fileContent += `labels: ${formData.labels.join(', ')}\n`;
            fileContent += `author: Community Contribution\n`;
            fileContent += `modified: ${new Date().toISOString().split('T')[0]}\n`;
            fileContent += '---\n\n';
            
            fileContent += `# ${formData.title}\n\n`;
            
            fileContent += `## Description\n\n`;
            fileContent += `${formData.description}\n\n`;
            
            // Add the main content
            if (formData.content) {
                fileContent += formData.content;
            }
            
            if (formData.instructions) {
                fileContent += '\n\n## Usage Instructions\n\n' + formData.instructions;
            }
            if (formData.examples) {
                fileContent += '\n\n## Examples\n\n' + formData.examples;
            }
        }
        
        const encodedPath = encodeURIComponent(filePath);
        const encodedContent = encodeURIComponent(fileContent);
        const branchName = encodeURIComponent(`add-${filename.replace('.md', '')}`);
        const commitMessage = encodeURIComponent(`Add ${formData.title}`);
        
        const prUrl = `https://github.com/Windsurf-Samples/cascade-customizations-catalog/new/main?filename=${encodedPath}&value=${encodedContent}&message=${commitMessage}`;
        
        window.open(prUrl, '_blank');
    }
}

// إدارة التنقل بين التمارين
const NavigationManager = {
    currentPage: 1,
    problemsPerPage: 10,
    totalProblems: 0,
    currentProblems: [],
    
    init: function(problems, problemsPerPage = 10) {
        this.currentProblems = problems;
        this.totalProblems = problems.length;
        this.problemsPerPage = problemsPerPage;
        this.currentPage = 1;
        
        this.renderNavigation();
    },
    
    getCurrentPageProblems: function() {
        const startIndex = (this.currentPage - 1) * this.problemsPerPage;
        const endIndex = startIndex + this.problemsPerPage;
        return this.currentProblems.slice(startIndex, endIndex);
    },
    
    nextPage: function() {
        const totalPages = Math.ceil(this.totalProblems / this.problemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            return true;
        }
        return false;
    },
    
    prevPage: function() {
        if (this.currentPage > 1) {
            this.currentPage--;
            return true;
        }
        return false;
    },
    
    goToPage: function(page) {
        const totalPages = Math.ceil(this.totalProblems / this.problemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            return true;
        }
        return false;
    },
    
    renderNavigation: function() {
        const totalPages = Math.ceil(this.totalProblems / this.problemsPerPage);
        
        if (totalPages <= 1) return '';
        
        let navigationHTML = `
            <div class="navigation-buttons">
        `;
        
        // زر الصفحة السابقة
        if (this.currentPage > 1) {
            navigationHTML += `
                <button class="btn-secondary nav-button prev-button">
                    <i class="fas fa-arrow-right"></i> الصفحة السابقة
                </button>
            `;
        }
        
        // أرقام الصفحات
        navigationHTML += `<div class="page-numbers">`;
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;
        
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            navigationHTML += `<button class="page-number" data-page="1">1</button>`;
            if (startPage > 2) {
                navigationHTML += `<span class="page-dots">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            navigationHTML += `
                <button class="page-number ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                navigationHTML += `<span class="page-dots">...</span>`;
            }
            navigationHTML += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        navigationHTML += `</div>`;
        
        // زر الصفحة التالية
        if (this.currentPage < totalPages) {
            navigationHTML += `
                <button class="btn-secondary nav-button next-button">
                    الصفحة التالية <i class="fas fa-arrow-left"></i>
                </button>
            `;
        }
        
        navigationHTML += `</div>`;
        
        return navigationHTML;
    },
    
    attachNavigationEvents: function(callback) {
        // أزرار التنقل بين الصفحات
        document.querySelectorAll('.page-number').forEach(button => {
            button.addEventListener('click', () => {
                const page = parseInt(button.getAttribute('data-page'));
                if (this.goToPage(page)) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });
        });
        
        // زر الصفحة السابقة
        const prevButton = document.querySelector('.prev-button');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.prevPage()) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });
        }
        
        // زر الصفحة التالية
        const nextButton = document.querySelector('.next-button');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (this.nextPage()) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });
        }
    }
};

// تصدير المدير للاستخدام في ملفات أخرى
window.NavigationManager = NavigationManager;
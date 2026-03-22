/**
 * search.js - نسخة مبسطة ومضمونة
 */

// الانتظار حتى تحميل كل شيء
window.addEventListener('load', () => {
  console.log('🔍 تحميل نظام البحث...');
  
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchPanel = document.getElementById('search-panel');
  
  // إذا لم توجد عناصر البحث، توقف بهدوء
  if (!searchInput || !searchResults) {
    console.warn('⚠️ عناصر البحث غير موجودة، تخطي تهيئة البحث');
    return;
  }
  
  // بيانات تجريبية للاختبار (احذفها لاحقاً)
  const testData = [
    { question: "ما ناتج 5 + 3؟", level: "مبتدئ", type: "جمع" },
    { question: "احسب 12 × 4", level: "متوسط", type: "ضرب" },
    { question: "ما هو جذر 144؟", level: "متقدم", type: "جذر تربيعي" }
  ];
  
  // دالة البحث البسيطة
  function simpleSearch(query) {
    const lowerQuery = query.toLowerCase();
    const results = testData.filter(item => 
      item.question.toLowerCase().includes(lowerQuery) ||
      item.level.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    );
    
    displayResults(results, query);
  }
  
  // عرض النتائج
  function displayResults(results, query) {
    searchResults.innerHTML = '';
    
    if (results.length === 0 && query.length >= 2) {
      searchResults.innerHTML = '<div class="no-results">لا توجد نتائج</div>';
      return;
    }
    
    results.slice(0, 10).forEach(item => {
      const div = document.createElement('div');
      div.className = 'search-item';
      div.innerHTML = `
        <div class="search-item-title">${item.question}</div>
        <div class="search-item-meta">
          <span class="search-item-level level-${item.level === 'مبتدئ' ? 'beginner' : item.level === 'متوسط' ? 'intermediate' : 'advanced'}">
            ${item.level}
          </span>
          <span>${item.type}</span>
        </div>
      `;
      div.addEventListener('click', () => {
        alert(`تم اختيار: ${item.question}`);
        searchPanel.classList.remove('active');
        searchInput.value = '';
      });
      searchResults.appendChild(div);
    });
  }
  
  // مستمع الحدث للكتابة
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
      simpleSearch(query);
      searchResults.style.display = 'block';
    } else {
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
    }
  });
  
  console.log('✅ نظام البحث المبسط جاهز');
});
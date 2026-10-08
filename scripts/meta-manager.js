/**
 * Meta Manager & Share System - النسخة الشاملة والمكتملة v4.0
 * تحتوي على جميع وسوم SEO والـ Open Graph والهاشتاجات لجميع صفحات الدروس والألعاب
 */

const MetaManager = {
  // 📌 وسوم الموقع العامة الأساسية
  defaultMeta: {
    siteName: 'MathLinguistic',
    locale: 'ar_AR',
    type: 'website',
    defaultImage: `${window.location.origin}/icons/icon-512.png`
  },

  // 📌 الأقسام والوسوم المخصصة لكل صفحة/قسم
  sections: {
    'home': {
      title: 'MathLinguistic | الرئيسية • تعلّم الحساب الذهني بسرعة',
      description: 'منصة MathLinguistic لتعليم الحساب الذهني. دروس، تمارين، ألعاب، وتحديات سرعة لجميع المستويات.',
      keywords: 'حساب ذهني, رياضيات, تعلم الرياضيات, MathLinguistic, ألعاب تعليمية, الحساب السريع'
    },
    'beginner': {
      title: 'المستوى المبتدئ | MathLinguistic - أساسيات الحساب الذهني',
      description: 'ابدأ رحلتك في الحساب الذهني مع المستوى المبتدئ. تمارين بسيطة وشرح مفصل للخطوات الأولى.',
      keywords: 'حساب ذهني للمبتدئين, تعلم الحساب, رياضيات للأطفال, أساسيات الرياضيات, تمارين سهلة'
    },
    'intermediate': {
      title: 'المستوى المتوسط | MathLinguistic - تطوير المهارات الحسابية',
      description: 'طور مهاراتك في الحساب الذهني مع تمارين المستوى المتوسط. عمليات حسابية أكثر تعقيداً وتحديات.',
      keywords: 'حساب ذهني متوسط, تمارين رياضيات, تطوير المهارات الحسابية, حساب عقلي'
    },
    'advanced': {
      title: 'المستوى المتقدم | MathLinguistic - حساب ذهني متقدم',
      description: 'تحديات حسابية متقدمة للمحترفين. عمليات معقدة وسرعة في الحل مع نظام إنجازات.',
      keywords: 'حساب ذهني متقدم, تحديات رياضية, حساب سريع, تدريب الدماغ, رياضيات معقدة'
    },
    'complex': {
      title: 'المستوى المعقد | MathLinguistic - تحديات النخبة في الحساب',
      description: 'أعلى مستوى في الحساب الذهني. تحديات استثنائية للمتميزين فقط.',
      keywords: 'حساب ذهني معقد, تحديات النخبة, رياضيات متقدمة, عباقرة الحساب, حساب عقلي متقدم'
    },
    'learn-beginner': {
      title: 'دروس المبتدئ | MathLinguistic - شرح قواعد الحساب الذهني',
      description: 'دروس مفصلة لشرح قواعد الحساب الذهني للمبتدئين. أمثلة وحلول خطوة بخطوة.',
      keywords: 'دروس حساب ذهني, شرح الرياضيات, قواعد الحساب, تعلم خطوة بخطوة'
    },
    'learn-intermediate': {
      title: 'دروس المتوسط | MathLinguistic - تطوير التقنيات الحسابية',
      description: 'دروس متقدمة لشرح تقنيات الحساب الذهني. استراتيجيات للحساب السريع والدقيق.',
      keywords: 'تقنيات حسابية, استراتيجيات الحساب, دروس رياضيات متوسطة'
    },
    'learn-advanced': {
      title: 'دروس المتقدم | MathLinguistic - إتقان الحساب الذهني',
      description: 'دروس احترافية لإتقان الحساب الذهني. عمليات معقدة وحلول مبتكرة.',
      keywords: 'حساب ذهني احترافي, دروس متقدمة, حلول رياضية مبتكرة'
    },
    'learn-complex': {
      title: 'دروس المعقد | MathLinguistic - تحديات الحساب للنخبة',
      description: 'دروس استثنائية لأعلى مستويات الحساب الذهني. للمتميزين فقط.',
      keywords: 'حساب نخبة, دروس معقدة, تحديات رياضية قصوى'
    },
    'speed-test': {
      title: 'تحدي السرعة | MathLinguistic - اختبر سرعتك في الحساب الذهني',
      description: 'اختبر سرعتك في الحساب الذهني ضد الزمن. سجل أعلى النقاط ونافس نفسك!',
      keywords: 'تحدي السرعة, حساب سريع, مسابقة رياضيات, اختبار سرعة الحساب, تدريب السرعة'
    },
    'mental-math': {
      title: 'الحساب الذهني | MathLinguistic - 5 مستويات تدريبية',
      description: '5 مستويات متدرجة لتدريب الحساب الذهني. ابدأ من السهل إلى الصعب.',
      keywords: 'تدريب حساب ذهني, تمارين يومية, تحسين الذاكرة الرياضية, حساب عقلي'
    },
    'mixed-ops': {
      title: 'العمليات المختلطة | MathLinguistic - تحدي الجمع والطرح والضرب',
      description: 'تمارين تجمع بين عمليات الجمع والطرح والضرب والقسمة. اختبر براعتك!',
      keywords: 'عمليات مختلطة, جمع وطرح, ضرب وقسمة, تمارين شاملة'
    },
    'loudoukou': {
      title: 'لعبة السودوكو | MathLinguistic - ألغاز الأرقام المنطقية',
      description: 'استمتع بلعبة السودوكو الكلاسيكية بمستويات متعددة. طور منطقك الرياضي!',
      keywords: 'سودوكو, ألغاز الأرقام, ألعاب منطقية, تدريب العقل, سودوكو عربي'
    },
    'crossmath': {
      title: 'الأرقام المتقاطعة | MathLinguistic - تحدي الكلمات والأرقام',
      description: 'لعبة الأرقام المتقاطعة تجمع بين الرياضيات والكلمات. مستويات متعددة من الصعوبة.',
      keywords: 'أرقام متقاطعة, ألغاز رياضية, ألعاب كلمات وأرقام, كلمات متقاطعة رياضية'
    },
    'sliding_puzzle': {
      title: 'ترتيب الأرقام | MathLinguistic - لعبة الترتيب والتصنيف',
      description: 'رتب الأرقام بذكاء وسرعة. مستويات متعددة تختبر سرعتك ودقتك.',
      keywords: 'ترتيب الأرقام, ألعاب تصنيف, سرعة البديهة, ألعاب ذكاء, ألغاز ترتيب'
    },
    'calculator': {
      title: 'الآلة الحاسبة التعليمية | MathLinguistic - تعلم عبر التطبيق',
      description: 'آلة حاسبة تفاعلية تساعدك على فهم العمليات الحسابية خطوة بخطوة.',
      keywords: 'آلة حاسبة تعليمية, تعلم الحساب, عمليات حسابية تفاعلية'
    },
    'achievements': {
      title: 'الإنجازات والأوسمة | MathLinguistic - تتبع تقدمك في التعلم',
      description: 'شاهد جميع إنجازاتك وأوسمتك. تتبع تقدمك في رحلة تعلم الحساب الذهني.',
      keywords: 'إنجازات, أوسمة, تتبع التقدم, نظام النقاط, جوائز تعليمية'
    },
    'about': {
      title: 'من نحن | MathLinguistic - عن المنصة وفريق العمل',
      description: 'تعرف على قصة MathLinguistic وفريق العمل وراء هذه المنصة التعليمية.',
      keywords: 'من نحن, عن MathLinguistic, فريق العمل, قصة المنصة'
    },
    'contact': {
      title: 'اتصل بنا | MathLinguistic - تواصل مع فريق الدعم',
      description: 'لديك سؤال أو اقتراح؟ تواصل معنا عبر البريد أو واتساب.',
      keywords: 'اتصل بنا, دعم فني, تواصل, مساعدة, اقتراحات'
    },
    'terms': {
      title: 'شروط الاستخدام | MathLinguistic',
      description: 'شروط وأحكام استخدام منصة MathLinguistic التعليمية.',
      keywords: 'شروط الاستخدام, أحكام, سياسة, قانوني'
    },
    'privacy': {
      title: 'سياسة الخصوصية | MathLinguistic',
      description: 'كيف نحمي بياناتك وخصوصيتك في منصة MathLinguistic.',
      keywords: 'سياسة الخصوصية, حماية البيانات, خصوصية, GDPR'
    }
  },

  // ✅ دالة تحديث وسوم الـ Meta مع إضافة دعم كل خصائص Open Graph
  updateMetaTag(attrType, attrValue, content) {
    try {
      let meta = document.querySelector(`meta[${attrType}="${attrValue}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attrType, attrValue);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
      return true;
    } catch (err) {
      console.warn(`⚠️ Meta update failed for ${attrValue}:`, err);
      return false;
    }
  },

  // ✅ التحديث المكتمل لوسوم الـ Meta للصفحة
  updateMeta(sectionKey) {
    try {
      const data = this.sections[sectionKey] || this.sections['home'];
      if (!data) return true;

      const currentUrl = `${window.location.origin}${window.location.pathname}#${sectionKey}`;

      // 1. العنوان والوصف والكلمات المفتاحية
      document.title = data.title;
      this.updateMetaTag('name', 'description', data.description);
      this.updateMetaTag('name', 'keywords', data.keywords);

      // 2. وسوم Facebook Open Graph المكتملة
      this.updateMetaTag('property', 'og:title', data.title);
      this.updateMetaTag('property', 'og:description', data.description);
      this.updateMetaTag('property', 'og:type', this.defaultMeta.type);
      this.updateMetaTag('property', 'og:site_name', this.defaultMeta.siteName);
      this.updateMetaTag('property', 'og:locale', this.defaultMeta.locale);
      this.updateMetaTag('property', 'og:url', currentUrl);
      this.updateMetaTag('property', 'og:image', this.defaultMeta.defaultImage);

      // 3. وسوم Twitter Cards المكتملة
      this.updateMetaTag('name', 'twitter:card', 'summary_large_image');
      this.updateMetaTag('name', 'twitter:title', data.title);
      this.updateMetaTag('name', 'twitter:description', data.description);
      this.updateMetaTag('name', 'twitter:image', this.defaultMeta.defaultImage);

      try {
        if (window.history && sectionKey !== 'home') {
          if (window.location.hash !== `#${sectionKey}`) {
            window.history.pushState({ section: sectionKey }, data.title, `#${sectionKey}`);
          }
        }
      } catch (historyErr) {
        console.warn('⚠️ History update failed:', historyErr);
      }
    } catch (err) {
      console.error('❌ MetaManager Error:', err);
    }
  },

  // 🎨 دالة رسم وتوليد بطاقة المشاركة الذكية تلقائياً
  generateDynamicShareCard(page, title, category) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, '#1a202c');
      gradient.addColorStop(0.5, '#2d3748');
      gradient.addColorStop(1, '#2b6cb0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);

      ctx.strokeStyle = '#4299e1';
      ctx.lineWidth = 10;
      ctx.strokeRect(30, 30, 1140, 570);

      ctx.fillStyle = '#63b3ed';
      ctx.font = 'bold 36px sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText('📐 MathLinguistic | الحساب الذهني', 1100, 100);

      ctx.fillStyle = '#ecc94b';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(`• ${category || 'درس تفاعلي'}`, 1100, 180);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px sans-serif';
      const pageText = isNaN(page) ? page : `الصفحة رقم: ${page}`;
      ctx.fillText(pageText, 1100, 280);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'normal 42px sans-serif';
      const displayTitle = title || 'تعلم تقنيات الحساب الذهني السريع';
      ctx.fillText(displayTitle, 1100, 380);

      ctx.fillStyle = '#48bb78';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('🚀 اضغط على الرابط وابدأ التحدي الآن!', 1100, 520);

      canvas.toBlob((blob) => {
        const file = new File([blob], `mathlinguistic-page-${page}.png`, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  },

  // ✅ مشاركة الدرس مع تحديث الوسوم ديناميكياً
  async shareCurrentLesson(pageNumber, customTitle) {
    try {
      const page = pageNumber || window.currentPageNumber || window.currentLessonPage || 1;
      const sectionKey = window.location.hash.replace('#', '') || 'home';
      const sectionData = this.sections[sectionKey] || this.sections['home'];

      const title = customTitle || (sectionKey !== 'home' ? sectionData.title : `درس الصفحة ${page}`);
      const category = sectionKey.includes('learn') ? 'درس تفاعلي' : (sectionKey.includes('loudoukou') ? 'لعبة سودوكو' : 'تمارين حساب');
      const shareUrl = `${window.location.origin}${window.location.pathname}?page=${page}#${sectionKey}`;

      const imageFile = await this.generateDynamicShareCard(page, title, category);

      document.title = title;
      this.updateMetaTag('property', 'og:title', title);
      this.updateMetaTag('property', 'og:description', `شرح وتمارين الصفحة رقم ${page}`);
      this.updateMetaTag('property', 'og:url', shareUrl);

      const shareData = {
        title: title,
        text: `📚 ${title}\n🎯 انضم معي لحل تمارين وشرح الصفحة ${page} على MathLinguistic!\n\n`,
        url: shareUrl,
        files: [imageFile]
      };

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({ title: title, text: shareData.text, url: shareUrl });
      } else {
        this.copyLinkToClipboard(shareUrl);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const page = pageNumber || window.currentPageNumber || 1;
        this.copyLinkToClipboard(`${window.location.origin}${window.location.pathname}?page=${page}`);
      }
    }
  },

  copyLinkToClipboard(url) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    if (window.GameCore && window.GameCore.toast) {
      window.GameCore.toast('📋 تم نسخ رابط الصفحة للحافظة!', 'info');
    }
  },

  injectFloatingShareButton() {
    if (document.getElementById('global-floating-share-btn')) return;

    if (!document.getElementById('floating-share-styles')) {
      const style = document.createElement('style');
      style.id = 'floating-share-styles';
      style.textContent = `
        .floating-share-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3182ce, #2b6cb0);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .floating-share-btn:active { transform: scale(0.92); }
        @media (max-width: 480px) {
          .floating-share-btn { bottom: 16px; right: 16px; width: 44px; height: 44px; font-size: 1.1rem; }
        }
      `;
      document.head.appendChild(style);
    }

    const shareBtn = document.createElement('button');
    shareBtn.id = 'global-floating-share-btn';
    shareBtn.className = 'floating-share-btn';
    shareBtn.setAttribute('title', 'مشاركة هذه الصفحة / الدرس');
    shareBtn.setAttribute('aria-label', 'مشاركة الصفحة');
    shareBtn.innerHTML = '🔗';

    shareBtn.onclick = () => {
      const pageNum = window.currentPageNumber || window.currentLessonPage || 1;
      this.shareCurrentLesson(pageNum);
    };

    document.body.appendChild(shareBtn);
  },

  checkUrlParamsOnLoad() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');

      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        window.currentPageNumber = pageNum;

        setTimeout(() => {
          if (typeof window.loadLessonPage === 'function') {
            window.loadLessonPage(pageNum);
          } else if (typeof window.showLesson === 'function') {
            window.showLesson(pageNum);
          }
        }, 300);
      }
    } catch (err) {
      console.warn('⚠️ Deep link check failed:', err);
    }
  },

  init() {
    try {
      const initialHash = window.location.hash.replace('#', '') || 'home';
      this.updateMeta(initialHash);
      
      this.checkUrlParamsOnLoad();
      this.injectFloatingShareButton();

      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        this.updateMeta(hash);
      });

      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-target]');
        if (btn) {
          const target = btn.getAttribute('data-target');
          setTimeout(() => this.updateMeta(target), 100);
        }
        const footerBtn = e.target.closest('[data-static-page]');
        if (footerBtn) {
          const page = footerBtn.getAttribute('data-static-page');
          setTimeout(() => this.updateMeta(page), 100);
        }
      });

      console.log('✅ MetaManager v4.0 initialized successfully');
    } catch (err) {
      console.error('❌ MetaManager init failed:', err);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MetaManager.init());
} else {
  MetaManager.init();
}

window.MetaManager = MetaManager;
window.updatePageMeta = (sectionKey) => MetaManager.updateMeta(sectionKey);
window.shareLessonPage = (pageNumber, title) => MetaManager.shareCurrentLesson(pageNumber, title);

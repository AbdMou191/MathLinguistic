/**
 * Meta Manager - النسخة الآمنة v2.0
 * مع حماية كاملة من أخطاء null
 */

const MetaManager = {
  sections: {
    'home': {
      title: 'MathLinguistic | الرئيسية • تعلّم الحساب الذهني بسرعة',
      description: 'منصة MathLinguistic لتعليم الحساب الذهني. دروس، تمارين، ألعاب، وتحديات سرعة لجميع المستويات.',
      keywords: 'حساب ذهني, رياضيات, تعلم الرياضيات, MathLinguistic, ألعاب تعليمية'
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
      description: 'دروس استثنائية لأعلى مستويات الحساب الذهني. للمتميزين فقط.',      keywords: 'حساب نخبة, دروس معقدة, تحديات رياضية قصوى'
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
      description: 'لديك سؤال أو اقتراح؟ تواصل معنا عبر البريد أو واتساب.',      keywords: 'اتصل بنا, دعم فني, تواصل, مساعدة, اقتراحات'
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

  // ✅ دالة آمنة لتحديث وسم ميتا (مع حماية من null)
  updateMetaTag(attrType, attrValue, content) {
    try {
      let meta = document.querySelector(`meta[${attrType}="${attrValue}"]`);
      if (meta) {
        meta.setAttribute('content', content);
        return true;
      } else {
        // إنشاء وسم جديد إذا لم يكن موجوداً
        meta = document.createElement('meta');
        meta.setAttribute(attrType, attrValue);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
        return true;
      }
    } catch (err) {
      console.warn(`⚠️ Meta update failed for ${attrValue}:`, err);
      return false;
    }
  },

  // ✅ الدالة الرئيسية مع try-catch
  updateMeta(sectionKey) {
    try {
      const data = this.sections[sectionKey] || this.sections['home'];
      
      if (!data) {
        console.warn(`⚠️ No meta data found for: ${sectionKey}`);
        return true;
      }
      
      // تحديث العنوان
      document.title = data.title;
      
      // تحديث العناصر الأساسية
      this.updateMetaTag('name', 'description', data.description);      this.updateMetaTag('name', 'keywords', data.keywords);
      
      // تحديث Open Graph
      this.updateMetaTag('property', 'og:title', data.title);
      this.updateMetaTag('property', 'og:description', data.description);
      
      // تحديث Twitter
      this.updateMetaTag('name', 'twitter:title', data.title);
      this.updateMetaTag('name', 'twitter:description', data.description);
      
      // تحديث URL مع Hash
      try {
        if (window.history && sectionKey !== 'home') {
          const newUrl = `#${sectionKey}`;
          if (window.location.hash !== newUrl) {
            window.history.pushState({ section: sectionKey }, data.title, newUrl);
          }
        }
      } catch (historyErr) {
        console.warn('⚠️ History update failed:', historyErr);
      }
      
      console.log(`✅ Meta updated for: ${sectionKey}`);
      
    } catch (err) {
      console.error('❌ MetaManager Error:', err);
      console.error('Section:', sectionKey);
    }
  },

  // ✅ التهيئة الآمنة
  init() {
    try {
      // تحديث أولي
      const initialHash = window.location.hash.replace('#', '') || 'home';
      this.updateMeta(initialHash);
      
      // الاستماع لتغير الهاش
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        this.updateMeta(hash);
      });
      
      // الاستماع للنقر على أزرار القائمة
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
      
      console.log('✅ MetaManager initialized successfully');
    } catch (err) {
      console.error('❌ MetaManager init failed:', err);
    }
  }
};

// ✅ تفعيل المدير عند تحميل الصفحة (آمن)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MetaManager.init();
  });
} else {
  MetaManager.init();
}

// ✅ جعل الدالة متاحة عالمياً
window.updatePageMeta = (sectionKey) => MetaManager.updateMeta(sectionKey);
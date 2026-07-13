class I18n {
    constructor() {
        this.languages = ['en', 'fr', 'es', 'de', 'it'];
        this.defaultLanguage = 'en';
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        
        // Apply basic HTML lang immediately
        this.updateHTMLLang();
    }

    detectLanguage() {
        // 1. Check URL parameters (?lang=es) - Highest priority
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = (urlParams.get('lang') || '').toLowerCase();
        if (langParam && this.languages.includes(langParam)) {
            localStorage.setItem('preferred_language', langParam);
            return langParam;
        }

        // 2. Check localStorage (User explicit preference from previous visits)
        const saved = (localStorage.getItem('preferred_language') || '').toLowerCase();
        if (saved && this.languages.includes(saved)) return saved;

        // 3. Check System/Browser language preferences (Automatic detection)
        // navigator.languages returns an array of preferred languages in order of preference
        const preferredLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
        if (preferredLanguages) {
            for (const fullLang of preferredLanguages) {
                if (!fullLang) continue;
                const lang = fullLang.split('-')[0].toLowerCase();
                if (this.languages.includes(lang)) return lang;
            }
        }

        // 4. Default fallback
        return this.defaultLanguage;
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.applyTranslations();
        this.updateHTMLLang();
        this.setupSwitcher();
    }

    async loadTranslations(lang) {
        if (this.translations[lang]) return;
        try {
            const response = await fetch(`./locales/${lang}.json`);
            this.translations[lang] = await response.json();
        } catch (error) {
            console.error(`Could not load translations for ${lang}:`, error);
        }
    }

    async switchLanguage(lang) {
        if (!this.languages.includes(lang)) return;
        this.currentLanguage = lang;
        localStorage.setItem('preferred_language', lang);
        
        // Remove the lang parameter from URL without reloading
        const url = new URL(window.location);
        url.searchParams.delete('lang');
        window.history.replaceState({}, '', url);

        await this.loadTranslations(lang);
        this.applyTranslations();
        this.updateHTMLLang();
        this.updateActiveSwitcher(lang);
        // Trigger a custom event for other components if needed
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    updateHTMLLang() {
        document.documentElement.lang = this.currentLanguage;
    }

    updateActiveSwitcher(lang) {
        const switchers = document.querySelectorAll('[data-lang-switch]');
        switchers.forEach(btn => {
            if (btn.getAttribute('data-lang-switch') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    applyTranslations() {
        const data = this.translations[this.currentLanguage];
        if (!data) return;

        // Meta tags
        if (data.meta) {
            document.title = data.meta.title;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = data.meta.description;
            
            // Open Graph & Twitter
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.content = data.meta.title;
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.content = data.meta.description;
        }

        // Search for all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.getNestedValue(data, key);
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else if (el.hasAttribute('data-i18n-html')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // Search for all elements with data-i18n-attr attribute
        const attrElements = document.querySelectorAll('[data-i18n-attr]');
        attrElements.forEach(el => {
            const attrConfig = el.getAttribute('data-i18n-attr');
            // Format: "attr1:key1;attr2:key2"
            const pairs = attrConfig.split(';');
            pairs.forEach(pair => {
                const [attr, key] = pair.split(':');
                if (attr && key) {
                    const translation = this.getNestedValue(data, key.trim());
                    if (translation) {
                        el.setAttribute(attr.trim(), translation);
                    }
                }
            });
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : null;
        }, obj);
    }

    setupSwitcher() {
        const switchers = document.querySelectorAll('[data-lang-switch]');
        switchers.forEach(btn => {
            if (btn.dataset.langBound === '1') return;
            btn.dataset.langBound = '1';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.getAttribute('data-lang-switch');
                this.switchLanguage(lang);
            });
        });
        
        // Initial active state
        this.updateActiveSwitcher(this.currentLanguage);
    }
}

function bootstrapI18n() {
    if (window.i18n) return;
    window.i18n = new I18n();
    window.i18n.init();
}

// Initialize safely whether this script loads before or after DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapI18n, { once: true });
} else {
    bootstrapI18n();
}

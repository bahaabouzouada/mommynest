// Add social media content filtering
const socialMediaKeywords = [
    // كلمات غير مرغوبة على مواقع التواصل
    "porn", "xxx", "nude", "naked", "sex",
    "سكس", "جنس", "إباحي", "إباحية", "عاري", "عارية"
];

let socialFilterEnabled = false;

// تحميل الإعدادات
chrome.storage.local.get(['filterEnabled', 'socialFilterEnabled', 'blockedCount'], function(result) {
    filterEnabled = result.filterEnabled || false;
    socialFilterEnabled = result.socialFilterEnabled || false;
    blockedCount = result.blockedCount || 0;
});

// مراقبة التغييرات في الإعدادات
chrome.storage.onChanged.addListener(function(changes) {
    if (changes.filterEnabled) {
        filterEnabled = changes.filterEnabled.newValue;
    }
    if (changes.socialFilterEnabled) {
        socialFilterEnabled = changes.socialFilterEnabled.newValue;
    }
});

// تحديث التحقق من المحتوى
function checkContent(url, title = '', pageContent = '') {
    if (!filterEnabled) return false;
    
    const isSocialMedia = allowedDomains.some(domain => url.includes(domain));
    
    // إذا كان الموقع من مواقع التواصل وتم تفعيل فلتر مواقع التواصل
    if (isSocialMedia && socialFilterEnabled) {
        const contentToCheck = (url + ' ' + title + ' ' + pageContent).toLowerCase();
        return socialMediaKeywords.some(keyword => 
            contentToCheck.includes(keyword.toLowerCase())
        );
    }
    
    // للمواقع العادية
    if (!isSocialMedia && filterEnabled) {
        const contentToCheck = (url + ' ' + title).toLowerCase();
        return defaultBlockedKeywords.some(keyword => 
            contentToCheck.includes(keyword.toLowerCase())
        );
    }
    
    return false;
}

// The rest of the background.js code remains the same...

const defaultBlockedKeywords = [
    // كلمات إباحية باللغة العربية
    "سكس", "جنس", "إباحي", "إباحية", "بورن", "عاري", "عارية", "دعارة", "نيك", "زب", "كس", "طيز", "قحبة", "شرموطة",
    "بزاز", "مؤخرة", "جماع", "خلفي", "مص", "لحس", "فضائح", "ساخن", "محارم", "متحرش", "اغتصاب",
    
    // مواقع معروفة
    "xnxx", "xvideos", "pornhub", "sex", "porn", "xxx", "adult", "brazzers", "chaturbate", "youporn", 
    "redtube", "tube8", "xhamster", "livejasmin", "cam4", "streamate", "stripchat", "bongacams",
    "onlyfans", "manyvids", "clips4sale", "motherless", "spankbang", "eporner", "thumbzilla",
    
    // كلمات وصفية بالإنجليزية
    "nude", "naked", "pussy", "dick", "cock", "ass", "boobs", "tits", "nipples", "blowjob",
    "handjob", "cumshot", "anal", "hardcore", "softcore", "hentai", "masturbation", "orgasm",
    "virgin", "threesome", "gangbang", "bdsm", "fetish", "escort", "stripper", "webcam",
    
    // نطاقات شائعة
    ".sex", ".xxx", ".porn", ".adult", ".sexy"
];

// قائمة المواقع المستثناة
const allowedDomains = [
    "facebook.com", "twitter.com", "youtube.com", "linkedin.com", "instagram.com"
];

// تحديث rules.json ليشمل المواقع الجديدة
const additionalBlockedDomains = [
    "pornhd.com", "youjizz.com", "xnxx.com", "xvideos.com", "pornhub.com", "xhamster.com",
    "redtube.com", "youporn.com", "tube8.com", "spankbang.com", "drtuber.com", "vporn.com",
    "sexu.com", "nuvid.com", "ixxx.com", "sunporno.com", "pornhd.com", "porn.com", "4tube.com",
    "videosexarchive.com", "extremetube.com", "pornerbros.com", "pornhd.com", "porngo.com",
    "zbporn.com", "fuq.com", "porn300.com", "pornone.com", "camwhores.tv", "ashemaletube.com"
];

let filterEnabled = false;
let blockedCount = 0;

// تحميل الإعدادات
chrome.storage.local.get(['filterEnabled', 'blockedCount'], function(result) {
    filterEnabled = result.filterEnabled || false;
    blockedCount = result.blockedCount || 0;
});

// مراقبة التغييرات في الإعدادات
chrome.storage.onChanged.addListener(function(changes) {
    if (changes.filterEnabled) {
        filterEnabled = changes.filterEnabled.newValue;
        updateRules(changes.filterEnabled.newValue);
    }
});

// تحديث حالة القواعد
async function updateRules(enabled) {
    if (enabled) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: ["ruleset_1"]
        });
    } else {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ["ruleset_1"]
        });
    }
}

// التحقق مما إذا كان الموقع مستثنى
function isAllowedSite(url) {
    return allowedDomains.some(domain => url.includes(domain));
}

// فحص محتوى الصفحة
function checkContent(url, title = '') {
    if (!filterEnabled) return false;
    
    // السماح للمواقع الموجودة في قائمة الاستثناءات
    if (isAllowedSite(url)) return false;

    const contentToCheck = (url + ' ' + title).toLowerCase();
    return defaultBlockedKeywords.some(keyword => 
        contentToCheck.includes(keyword.toLowerCase())
    );
}

// إغلاق التبويب
function closeTab(tabId) {
    chrome.tabs.remove(tabId, function() {
        if (chrome.runtime.lastError) return;
        blockedCount++;
        chrome.storage.local.set({ blockedCount: blockedCount });
    });
}

// مراقبة فتح التبويبات الجديدة
chrome.tabs.onCreated.addListener(function(tab) {
    if (!filterEnabled || !tab.url) return;

    if (checkContent(tab.url)) {
        closeTab(tab.id);
    }
});

// مراقبة تحديث التبويبات
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!filterEnabled) return;

    if (changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: function() {
                const pageText = document.body.innerText.toLowerCase();
                const metaTags = document.getElementsByTagName('meta');
                const metaContent = Array.from(metaTags)
                    .map(meta => (meta.content || '').toLowerCase())
                    .join(' ');
                return { pageText, metaContent };
            }
        }).then(results => {
            if (!results || !results[0]) return;
            
            const { pageText, metaContent } = results[0].result;
            const fullContent = pageText + ' ' + metaContent + ' ' + (tab.url || '') + ' ' + (tab.title || '');

            // التأكد أن الموقع ليس مستثنى قبل الحظر
            if (!isAllowedSite(tab.url) && defaultBlockedKeywords.some(keyword => fullContent.includes(keyword))) {
                closeTab(tabId);
            }
        }).catch(() => {});
    }

    if (changeInfo.title || changeInfo.url) {
        if (checkContent(tab.url, tab.title)) {
            closeTab(tabId);
        }
    }
});

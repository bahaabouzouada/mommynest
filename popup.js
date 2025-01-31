document.addEventListener('DOMContentLoaded', function() {
    const toggleMainFilter = document.getElementById('toggleMainFilter');
    const toggleSocialFilter = document.getElementById('toggleSocialFilter');
    const blockedCount = document.getElementById('blockedCount');
    const helpButton = document.getElementById('helpButton');
    const helpModal = document.getElementById('helpModal');
    const closeModal = document.getElementById('closeModal');

    // Help Modal Functions
    helpButton.addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    // Close modal when clicking outside
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // Load saved states
    chrome.storage.local.get(['filterEnabled', 'socialFilterEnabled', 'blockedCount'], function(result) {
        toggleMainFilter.checked = result.filterEnabled || false;
        toggleSocialFilter.checked = result.socialFilterEnabled || false;
        blockedCount.textContent = result.blockedCount || 0;
        
        updateCardStates();
    });

    // Main filter toggle
    toggleMainFilter.addEventListener('change', function() {
        chrome.storage.local.set({
            filterEnabled: toggleMainFilter.checked
        });
        updateCardStates();
    });

    // Social media filter toggle
    toggleSocialFilter.addEventListener('change', function() {
        chrome.storage.local.set({
            socialFilterEnabled: toggleSocialFilter.checked
        });
        updateCardStates();
    });

    function updateCardStates() {
        const generalCard = document.getElementById('generalFilter');
        const socialCard = document.getElementById('socialFilter');

        generalCard.classList.toggle('active', toggleMainFilter.checked);
        socialCard.classList.toggle('active', toggleSocialFilter.checked);
    }
});
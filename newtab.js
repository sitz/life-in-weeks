document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const settingsPrompt = document.getElementById('settings-prompt');
    const mainContainer = document.getElementById('main-container');
    const titleElement = document.querySelector('title');
    const greetingElement = document.getElementById('greeting');
    const percentageElement = document.getElementById('percentage-display');

    // --- Constants ---
    const WEEKS_IN_YEAR = 52;
    const MS_IN_WEEK = 1000 * 60 * 60 * 24 * 7;
    const DEFAULT_LIFESPAN = 80; // <<< --- Fixed Lifespan Constant --- >>>
    const BLOCK_HEIGHT_WITH_GAP = 8; // 7px height + 1px gap

    // --- State Variables ---
    let currentName = '';
    let currentDob = '';
    // Removed currentCountry and currentLifespan (using constant now)

    // --- Debounce function ---
    function debounce(func, wait) { /* ... (keep debounce function as before) ... */
         let timeout;
         return function executedFunction(...args) {
             const later = () => { clearTimeout(timeout); func(...args); };
             clearTimeout(timeout);
             timeout = setTimeout(later, wait);
         };
     }

    // --- Render Grid ---
    const renderGrid = (weeksToRender, weeksLived) => {
        progressBar.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const maxWeeks = Math.max(0, Math.floor(weeksToRender));
        const currentWeek = weeksLived + 1; // Current week is the next week after weeks lived

        for (let i = 1; i <= maxWeeks; i++) {
            const weekBox = document.createElement('div');
            weekBox.classList.add('week-block');
            
            if (i < currentWeek) {
                weekBox.classList.add('past');
            } else if (i === currentWeek) {
                weekBox.classList.add('current');
            } else {
                weekBox.classList.add('future');
            }
            
            fragment.appendChild(weekBox);
        }
        if (maxWeeks === 0 && progressBar.innerHTML === '') {
            progressBar.innerHTML = '<p class="settings-prompt">Window too small to display grid.</p>';
        } else {
            progressBar.appendChild(fragment);
        }
    };

    // --- Update ALL display elements (using DEFAULT_LIFESPAN) ---
    const updateDisplay = () => {
        if (!currentDob) { // Check only for DOB now
             showSettingsPrompt();
             return;
        }

        const lifespanToUse = DEFAULT_LIFESPAN; // Use the constant

        // --- Update Greeting, Percentage, Grid Size, Summary Text ---
        greetingElement.textContent = currentName ? `Hello, ${currentName}!` : 'Hello!';

        const birthDate = new Date(currentDob);
        const today = new Date();
        const actualTotalWeeks = Math.floor(lifespanToUse * WEEKS_IN_YEAR);
        const millisecondsLived = today.getTime() - birthDate.getTime();
        const actualWeeksLived = Math.floor(millisecondsLived / MS_IN_WEEK);

        let percentageLived = 0;
        if (actualTotalWeeks > 0) {
            percentageLived = Math.min(100, (actualWeeksLived / actualTotalWeeks) * 100);
        }
        percentageElement.textContent = `${Math.round(percentageLived)}% Lived`;

        // ...(Height/Window Size calculations as before)...
         const viewportHeight = window.innerHeight;
         const greetingHeight = greetingElement.offsetHeight || 0;
         const percentageHeight = percentageElement.offsetHeight || 0;
         const titleHeight = titleElement.offsetHeight || 0;
         const progressTextHeight = progressText.offsetHeight || 15;
         const verticalMargins = 35;
         const availableHeight = viewportHeight - greetingHeight - percentageHeight - titleHeight - progressTextHeight - verticalMargins - 15;
         const maxRows = Math.max(0, Math.floor(availableHeight / BLOCK_HEIGHT_WITH_GAP));
         const totalWeeksToShow = maxRows * WEEKS_IN_YEAR;

        // --- Update Summary Text ---
        // Simplified summary using the fixed lifespan constant
        let summary = `Week ${actualWeeksLived.toLocaleString()} of ${actualTotalWeeks.toLocaleString()} (Based on ${lifespanToUse} year lifespan).`;
        if (totalWeeksToShow < actualTotalWeeks && totalWeeksToShow > 0) {
            summary += ` Displaying ${totalWeeksToShow.toLocaleString()} weeks.`;
        } else if (totalWeeksToShow === 0 && actualTotalWeeks > 0) {
            summary += ` Window too small.`;
        }
        progressText.textContent = summary;

        // --- Render Grid ---
        renderGrid(totalWeeksToShow, actualWeeksLived);
        settingsPrompt.innerHTML = ''; // Clear settings prompt if successful
    };

     // --- Settings Prompt & Link ---
     const openSettingsPopup = () => { /* ... (keep as before) ... */ };
     const addSettingsLinkListener = () => { /* ... (keep as before) ... */ };
     const showSettingsPrompt = () => {
          progressBar.innerHTML = '';
          greetingElement.textContent = 'Welcome!';
          percentageElement.textContent = '- % Lived';
          progressText.textContent = 'Please set your Name and Date of Birth.'; // Updated prompt
          settingsPrompt.innerHTML = `Click the <a href="#" id="open-settings">extension icon</a> in your toolbar to get started.`;
          addSettingsLinkListener();
      };


    // --- Initial Load ---
    chrome.storage.sync.get(['userName', 'userDob'], (data) => { // Only fetch name and DOB
         if (chrome.runtime.lastError) { /* ... (error handling) ... */ }

        currentName = data.userName || '';
        currentDob = data.userDob;
        // Removed country loading

        if (!currentDob) { // Check only for DOB
            showSettingsPrompt();
        } else {
            updateDisplay(); // Calculate and render using DEFAULT_LIFESPAN
        }
    });

    // --- Setup Resize Listener ---
    const handleResize = debounce(() => {
        updateDisplay();
    }, 250);
    window.addEventListener('resize', handleResize);

     // --- Setup Storage Change Listener ---
     chrome.storage.onChanged.addListener((changes, namespace) => {
         if (namespace === 'sync' && (changes.userName || changes.userDob)) { // Only listen for name/dob changes
             console.log('Settings changed, reloading display...');
             // Refetch data and update state
              chrome.storage.sync.get(['userName', 'userDob'], (newData) => {
                 currentName = newData.userName || '';
                 currentDob = newData.userDob;
                 // Update the display based on potentially new data
                 if (!currentDob) {
                    showSettingsPrompt();
                 } else {
                    updateDisplay();
                 }
             });
         }
     });
});
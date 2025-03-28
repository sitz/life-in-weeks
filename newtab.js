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
    const DEFAULT_LIFESPAN = 79; // <<< --- Fixed Lifespan Constant --- >>>
    const BLOCK_HEIGHT_WITH_GAP = 8; // 7px height + 1px gap

    // Life events data
    const LIFE_EVENTS = [
        { age: 0, emoji: '👶', event: 'Birth' },
        { age: 6, emoji: '🏫', event: 'Start of School' },
        { age: 18, emoji: '🎓', event: 'High School Graduation' },
        { age: 22, emoji: '🧑‍🎓', event: 'College Graduation' },
        { age: 25, emoji: '💼', event: 'First Full Time Job' },
        { age: 27, emoji: '👪', event: 'Birth of First Child' },
        { age: 29, emoji: '💍', event: 'First Marriage' },
        { age: 62, emoji: '🏖️', event: 'Retirement' },
        { age: 79, emoji: '🕊️', event: 'Death' }
    ];

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

            // Calculate the year and week number for this block
            const year = Math.floor((i - 1) / WEEKS_IN_YEAR);
            const weekInYear = (i - 1) % WEEKS_IN_YEAR;
            
            // Special handling for birth (first block) and death (last block)
            if (i === 1) {
                const birthEvent = LIFE_EVENTS.find(event => event.age === 0);
                if (birthEvent) {
                    weekBox.classList.add('life-event');
                    weekBox.textContent = birthEvent.emoji;
                    weekBox.setAttribute('data-event', `${birthEvent.event} (Age ${birthEvent.age})`);
                }
            } else if (i === maxWeeks) {
                const deathEvent = LIFE_EVENTS.find(event => event.age === 79);
                if (deathEvent) {
                    weekBox.classList.add('life-event');
                    weekBox.textContent = deathEvent.emoji;
                    weekBox.setAttribute('data-event', `${deathEvent.event} (Age ${deathEvent.age})`);
                }
            } else {
                // For other life events
                const event = LIFE_EVENTS.find(event => {
                    if (event.age === 0 || event.age === 79) return false; // Skip birth and death
                    const eventStartWeek = event.age * WEEKS_IN_YEAR;
                    return i === eventStartWeek + event.age; // Place in week matching the age number
                });
                
                if (event) {
                    weekBox.classList.add('life-event');
                    weekBox.textContent = event.emoji;
                    weekBox.setAttribute('data-event', `${event.event} (Age ${event.age})`);
                }
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

        // Calculate total weeks to show based on DEFAULT_LIFESPAN
        const totalWeeksToShow = actualTotalWeeks;

        // --- Update Summary Text ---
        let summary = `Week ${actualWeeksLived.toLocaleString()} of ${actualTotalWeeks.toLocaleString()} (Based on ${lifespanToUse} year lifespan).`;
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
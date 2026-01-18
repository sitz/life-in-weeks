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
    const renderGrid = (totalYears, weeksLived, lifespanYears) => {
        progressBar.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const currentWeek = weeksLived + 1; // Current week is the next week after weeks lived

        // Calculate total weeks based on years (each row = 1 year = 52 weeks)
        const maxWeeks = totalYears * WEEKS_IN_YEAR;

        for (let i = 1; i <= maxWeeks; i++) {
            const weekBox = document.createElement('div');
            weekBox.classList.add('week-block');

            // Calculate the year (0-indexed) and week within that year (1-indexed)
            const yearIndex = Math.floor((i - 1) / WEEKS_IN_YEAR); // 0-indexed year (age)
            const weekInYear = ((i - 1) % WEEKS_IN_YEAR) + 1; // 1-indexed week in year

            if (i < currentWeek) {
                weekBox.classList.add('past');
            } else if (i === currentWeek) {
                weekBox.classList.add('current');
                // Add year progress tooltip only for current block
                weekBox.setAttribute('data-tooltip', `Age ${yearIndex}, Week ${weekInYear} of 52 (${Math.round((weekInYear / WEEKS_IN_YEAR) * 100)}% of year)`);
            } else {
                weekBox.classList.add('future');
            }

            // Check if this week is beyond life expectancy
            if (yearIndex >= lifespanYears) {
                weekBox.classList.add('extended');
            }

            // Life events - place at Nth column of Nth year (diagonal pattern)
            if (i === 1) {
                // Birth - first block
                const birthEvent = LIFE_EVENTS.find(event => event.age === 0);
                if (birthEvent) {
                    weekBox.classList.add('life-event');
                    weekBox.textContent = birthEvent.emoji;
                    weekBox.setAttribute('data-event', `${birthEvent.event} (Age ${birthEvent.age})`);
                }
            } else if (i === lifespanYears * WEEKS_IN_YEAR) {
                // Death - last block of lifespan
                const deathEvent = LIFE_EVENTS.find(event => event.age === DEFAULT_LIFESPAN);
                if (deathEvent) {
                    weekBox.classList.add('life-event');
                    weekBox.textContent = deathEvent.emoji;
                    weekBox.setAttribute('data-event', `${deathEvent.event} (Age ${deathEvent.age})`);
                }
            } else {
                // Other life events at Nth week of Nth year (diagonal)
                const event = LIFE_EVENTS.find(event => {
                    if (event.age === 0 || event.age === DEFAULT_LIFESPAN) return false;
                    // Place at column N (weekInYear) of row N (yearIndex)
                    return event.age === yearIndex && event.age === weekInYear;
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

        // Calculate completed years (age)
        let ageYears = today.getFullYear() - birthDate.getFullYear();
        const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        // Check if birthday hasn't occurred yet this year
        if (today < birthdayThisYear) {
            ageYears--;
        }

        // Calculate weeks since last birthday (for current year progress)
        const lastBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today < lastBirthday) {
            lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
        }
        const msSinceLastBirthday = today.getTime() - lastBirthday.getTime();
        const weeksSinceLastBirthday = Math.floor(msSinceLastBirthday / MS_IN_WEEK);

        // Total weeks lived = completed years * 52 + weeks into current year
        const actualWeeksLived = (ageYears * WEEKS_IN_YEAR) + weeksSinceLastBirthday;
        const actualYearsLived = ageYears;

        // Determine total years to display: max of life expectancy or actual age + 1
        const totalYearsToShow = Math.max(lifespanToUse, actualYearsLived + 1);
        const actualTotalWeeks = totalYearsToShow * WEEKS_IN_YEAR;

        let percentageLived = 0;
        const expectedTotalWeeks = lifespanToUse * WEEKS_IN_YEAR;
        if (expectedTotalWeeks > 0) {
            percentageLived = (actualWeeksLived / expectedTotalWeeks) * 100;
        }

        // Show percentage, can be over 100% if past life expectancy
        if (percentageLived > 100) {
            percentageElement.textContent = `${Math.round(percentageLived)}% Lived 🎉`;
        } else {
            percentageElement.textContent = `${Math.round(percentageLived)}% Lived`;
        }

        // --- Update Summary Text ---
        let summary = `Week ${actualWeeksLived.toLocaleString()} of ${expectedTotalWeeks.toLocaleString()} (Based on ${lifespanToUse} year lifespan).`;
        if (actualYearsLived >= lifespanToUse) {
            summary += ` You've exceeded life expectancy by ${actualYearsLived - lifespanToUse + 1} years!`;
        }
        progressText.textContent = summary;

        // --- Render Grid ---
        renderGrid(totalYearsToShow, actualWeeksLived, lifespanToUse);
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
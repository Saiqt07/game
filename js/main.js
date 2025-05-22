// Memory Garden - Main JavaScript File

// Game state variables
let gameState = {
    currentScreen: 'main-menu',
    previousScreen: null, // Track previous screen for Continue Playing functionality
    playerName: 'Player',
    stars: 0,
    currentLevel: 1,
    maxLevel: 3, // Maximum level available in the game
    hintsRemaining: 3,
    pattern: [], // The pattern to remember
    playerPattern: [], // The player's attempt
    audioEnabled: true,
    highContrastMode: false,
    textSizeLevel: 1, // 1=normal, 2=large, 3=extra large
    voiceGuidanceEnabled: true,
    simplifiedMode: false
};

// Flower types for the game
const flowerTypes = [
    { id: 'rose', image: 'images/flowers/rose', alt: 'Rose' },
    { id: 'tulip', image: 'images/flowers/tulip', alt: 'Tulip' },
    { id: 'daisy', image: 'images/flowers/daisy', alt: 'Daisy' },
    { id: 'sunflower', image: 'images/flowers/sunflower', alt: 'Sunflower' },
    { id: 'lily', image: 'images/flowers/lily', alt: 'Lily' }
];

// Function to check image format and return the appropriate path
function getImagePath(basePath) {
    // This function will try to load the image with both PNG and JPG extensions
    // First try to load as PNG, if it fails, try JPG
    return basePath;
}

// Function to handle image loading with multiple format support
function handleImageError(img) {
    // If PNG fails, try JPG
    if (img.src.endsWith('.png')) {
        img.src = img.src.replace('.png', '.jpg');
    }
    // If JPG also fails, show a placeholder or default image
    img.onerror = function() {
        console.error('Failed to load image:', img.src);
        // Could set a default placeholder image here
    };
}

// Function to check if an image exists and return the first valid format
function getValidImagePath(basePath, fileName) {
    // Remove any file extension from the fileName
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
    
    // Try PNG format first, then JPG if PNG doesn't exist
    const formats = ['png', 'jpg'];
    
    // For now, just return the path with the original extension
    // In a real implementation, this would check if the file exists
    return basePath + '/' + nameWithoutExtension + '.' + formats[0];
}

// Audio elements
let backgroundMusic, successSound, errorSound;

// DOM elements
let screens, mainMenuScreen, gameScreen, storybookScreen, settingsScreen, helpScreen;
let playerNameElement, starsCountElement, gardenGrid, flowerScroll, feedbackMessage, hintButton, undoButton;
let levelCompleteModal, instructionsModal, exitConfirmationModal;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    console.log('Initializing game...');
    
    // Initialize audio elements
    backgroundMusic = document.getElementById('background-music');
    successSound = document.getElementById('success-sound');
    errorSound = document.getElementById('error-sound');
    
    // Initialize DOM elements
    screens = document.querySelectorAll('.screen');
    mainMenuScreen = document.getElementById('main-menu-screen');
    gameScreen = document.getElementById('game-screen');
    storybookScreen = document.getElementById('storybook-screen');
    settingsScreen = document.getElementById('settings-screen');
    helpScreen = document.getElementById('help-screen');
    
    // Game screen elements
    playerNameElement = document.getElementById('player-name');
    starsCountElement = document.getElementById('stars-count');
    gardenGrid = document.getElementById('garden-grid');
    flowerScroll = document.querySelector('.flower-scroll');
    feedbackMessage = document.getElementById('feedback-message');
    hintButton = document.getElementById('hint-button');
    undoButton = document.getElementById('undo-button');
    
    // Modals
    levelCompleteModal = document.getElementById('level-complete-modal');
    instructionsModal = document.getElementById('instructions-modal');
    exitConfirmationModal = document.getElementById('exit-confirmation-modal');
    
    // Set up event listeners for navigation
    setupNavigationListeners();
    
    // Set up accessibility controls
    setupAccessibilityControls();
    
    // Initialize the garden grid
    createGardenGrid();
    
    // Initialize flower selection
    createFlowerSelection();
    
    // Initialize the storybook
    initializeStorybook();
    
    // Update UI with initial game state
    updateUI();
    
    console.log('Game initialized!');
}

function setupNavigationListeners() {
    console.log('Setting up navigation listeners...');
    
    // Main menu buttons
    document.getElementById('play-button').addEventListener('click', () => {
        console.log('Play button clicked');
        showScreen('game');
        startNewGame();
    });
    
    document.getElementById('storybook-button').addEventListener('click', () => {
        console.log('Storybook button clicked');
        showScreen('storybook');
    });
    
    document.getElementById('settings-button').addEventListener('click', () => {
        console.log('Settings button clicked');
        showScreen('settings');
    });
    
    document.getElementById('help-button').addEventListener('click', () => {
        console.log('Help button clicked');
        showScreen('help');
    });
    
    document.getElementById('exit-button').addEventListener('click', () => {
        console.log('Exit button clicked');
        showModal('exit-confirmation-modal');
    });
    
    // Back to main menu buttons
    document.querySelectorAll('.back-button, #home-button').forEach(button => {
        button.addEventListener('click', () => {
            console.log('Back/Home button clicked');
            showScreen('main-menu');
        });
    });
    
    // Modal buttons
    document.getElementById('close-instructions').addEventListener('click', () => {
        console.log('Close instructions button clicked');
        hideModal('instructions-modal');
    });
    
    document.getElementById('confirm-exit').addEventListener('click', () => {
        console.log('Confirm exit button clicked');
        // In a web context, this would close the tab or navigate away
        // For now, we'll just go back to the main menu
        hideModal('exit-confirmation-modal');
        showScreen('main-menu');
    });
    
    document.getElementById('cancel-exit').addEventListener('click', () => {
        console.log('Cancel exit button clicked');
        hideModal('exit-confirmation-modal');
    });
    
    // Level complete modal buttons
    document.getElementById('next-level-button').addEventListener('click', () => {
        console.log('Next level button clicked');
        hideModal('level-complete-modal');
        gameState.currentLevel++;
        
        // Check if all levels are completed
        if (gameState.currentLevel > gameState.maxLevel) {
            showFeedback('Congratulations! You have completed all levels and unlocked all stories!', 'success');
            if (gameState.voiceGuidanceEnabled) {
                speakMessage('Congratulations! You have completed all levels and unlocked all stories!');
            }
            // Ensure all stories are unlocked when game is completed
            unlockAllStories();
            showScreen('main-menu');
        } else {
            startNewGame();
        }
    });
    
    document.getElementById('replay-level-button').addEventListener('click', () => {
        console.log('Replay level button clicked');
        hideModal('level-complete-modal');
        startNewGame();
    });
    
    document.getElementById('modal-home-button').addEventListener('click', () => {
        console.log('Modal home button clicked');
        hideModal('level-complete-modal');
        showScreen('main-menu');
    });
    
    // Game control buttons
    hintButton.addEventListener('click', showHint);
    undoButton.addEventListener('click', undoLastMove);
    
    // Tutorial video button
    document.getElementById('replay-tutorial').addEventListener('click', () => {
        console.log('Watch Tutorial button clicked');
        playTutorialVideo();
    });
    
    // Storybook functionality
    document.getElementById('play-narration').addEventListener('click', playNarration);
    document.getElementById('pause-narration').addEventListener('click', pauseNarration);
    
    // Story selection
    document.querySelectorAll('.story-item').forEach(storyItem => {
        storyItem.addEventListener('click', function() {
            // Prevent viewing locked stories
            if (this.classList.contains('locked')) {
                showFeedback('This story is locked. Complete more levels to unlock!', 'error');
                return;
            }
            // All stories are clickable since they're all unlocked after completing any level
            // Get the story ID from the image alt text or a data attribute
            const storyTitle = this.querySelector('h4').textContent;
            selectStory(storyTitle);
        });
    });
    
    // Read story button in level complete modal
    document.getElementById('read-story-button').addEventListener('click', () => {
        console.log('Read story button clicked');
        hideModal('level-complete-modal');
        showScreen('storybook');
        // No need to select a specific story since all are unlocked
        // User can choose which story to read from the storybook screen
    });
    
    console.log('Navigation listeners set up!');
}

function setupAccessibilityControls() {
    console.log('Setting up accessibility controls...');
    
    // Text size toggle
    document.getElementById('text-size-increase').addEventListener('click', () => {
        console.log('Text size increase button clicked');
        gameState.textSizeLevel = (gameState.textSizeLevel % 3) + 1;
        updateTextSize();
    });
    
    // High contrast toggle
    document.getElementById('high-contrast-toggle').addEventListener('click', () => {
        console.log('Dark mode toggle button clicked');
        document.body.classList.toggle('dark-mode');
    });
    
    // Audio toggle
    document.getElementById('audio-toggle').addEventListener('click', () => {
        console.log('Audio toggle button clicked');
        gameState.audioEnabled = !gameState.audioEnabled;
        updateAudio();
    });
    
    // Settings screen controls
    const textSizeSlider = document.getElementById('text-size-slider');
    if (textSizeSlider) {
        textSizeSlider.addEventListener('input', (e) => {
            console.log('Text size slider adjusted');
            gameState.textSizeLevel = parseInt(e.target.value);
            updateTextSize();
        });
    }
    
    const highContrastSetting = document.getElementById('high-contrast-setting');
    if (highContrastSetting) {
        highContrastSetting.addEventListener('change', (e) => {
            console.log('High contrast setting changed');
            gameState.highContrastMode = e.target.checked;
            updateContrastMode();
        });
    }
    
    const voiceGuidanceSetting = document.getElementById('voice-guidance-setting');
    if (voiceGuidanceSetting) {
        voiceGuidanceSetting.addEventListener('change', (e) => {
            console.log('Voice guidance setting changed');
            gameState.voiceGuidanceEnabled = e.target.checked;
        });
    }
    
    document.getElementById('game-settings-button').addEventListener('click', () => {
        showScreen('settings');
    });
    const simplifiedModeSetting = document.getElementById('simplified-mode-setting');
    if (simplifiedModeSetting) {
        simplifiedModeSetting.addEventListener('change', (e) => {
            console.log('Simplified mode setting changed');
            gameState.simplifiedMode = e.target.checked;
            if (gameState.simplifiedMode) {
                document.body.classList.add('simplified-mode');
            } else {
                document.body.classList.remove('simplified-mode');
            }
        });
    }
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            console.log('Volume slider adjusted');
            const volume = parseInt(e.target.value) / 10;
            updateVolume(volume);
        });
    }
    
    const saveSettings = document.getElementById('save-settings');
    if (saveSettings) {
        saveSettings.addEventListener('click', () => {
            console.log('Save settings button clicked');
            showScreen('main-menu');
            showFeedback('Settings saved!', 'success');
        });
    }
    
    const continuePlayingButton = document.getElementById('continue-playing');
    if (continuePlayingButton) {
        continuePlayingButton.addEventListener('click', () => {
            console.log('Continue playing button clicked');
            // If player was previously in the game screen, return there
            if (gameState.currentScreen === 'settings' && gameState.previousScreen === 'game') {
                showScreen('game');
                showFeedback('Continuing your game!', 'success');
            } else {
                // Otherwise go to main menu
                showScreen('main-menu');
            }
        });
    }
    
    console.log('Accessibility controls set up!');
}

function updateTextSize() {
    console.log('Updating text size to level:', gameState.textSizeLevel);
    
    document.body.classList.remove('text-size-large', 'text-size-xlarge');
    
    if (gameState.textSizeLevel === 2) {
        document.body.classList.add('text-size-large');
    } else if (gameState.textSizeLevel === 3) {
        document.body.classList.add('text-size-xlarge');
    }
    
    // Update the slider in settings if it exists
    const slider = document.getElementById('text-size-slider');
    if (slider) {
        slider.value = gameState.textSizeLevel;
    }
}

function updateContrastMode() {
    console.log('Updating contrast mode to:', gameState.highContrastMode ? 'high contrast' : 'normal');
    
    if (gameState.highContrastMode) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
    
    // Update the toggle in settings if it exists
    const toggle = document.getElementById('high-contrast-setting');
    if (toggle) {
        toggle.checked = gameState.highContrastMode;
    }
}

function updateAudio() {
    console.log('Updating audio to:', gameState.audioEnabled ? 'enabled' : 'disabled');
    
    if (gameState.audioEnabled) {
        // Only play background music if we're not in the game screen
        if (backgroundMusic && gameState.currentScreen !== 'game') {
            backgroundMusic.play().catch(e => {
                console.log('Auto-play prevented. User interaction required to play audio.');
            });
        }
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    } else {
        // Pause all audio when disabled
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        
        // Stop any ongoing speech synthesis
        if (isNarrationPlaying) {
            speechSynthesis.cancel();
            isNarrationPlaying = false;
            
            // Update narration button states
            document.getElementById('play-narration').style.display = 'inline-block';
            document.getElementById('pause-narration').style.display = 'none';
        }
        
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }
}

function updateVolume(volume) {
    console.log('Updating volume to:', volume);
    
    // Update audio element volumes
    if (backgroundMusic) backgroundMusic.volume = volume;
    if (successSound) successSound.volume = volume;
    if (errorSound) errorSound.volume = volume;
    
    // If we have an active speech utterance, update its volume too
    if (speechUtterance) {
        speechUtterance.volume = volume;
    }
}

function showScreen(screenName) {
    console.log('Showing screen:', screenName);
    
    // Store the previous screen before changing to the new one
    gameState.previousScreen = gameState.currentScreen;
    
    // Hide all screens
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    switch(screenName) {
        case 'main-menu':
            mainMenuScreen.classList.add('active');
            gameState.currentScreen = 'main-menu';
            // Play background music in menu screens if audio is enabled
            if (gameState.audioEnabled && backgroundMusic) {
                backgroundMusic.play().catch(e => {
                    console.log('Auto-play prevented. User interaction required to play audio.');
                });
            }
            break;
        case 'game':
            gameScreen.classList.add('active');
            gameState.currentScreen = 'game';
            // Pause background music during gameplay
            if (backgroundMusic) {
                backgroundMusic.pause();
            }
            break;
        case 'storybook':
            storybookScreen.classList.add('active');
            gameState.currentScreen = 'storybook';
            // Play background music in menu screens if audio is enabled
            if (gameState.audioEnabled && backgroundMusic) {
                backgroundMusic.play().catch(e => {
                    console.log('Auto-play prevented. User interaction required to play audio.');
                });
            }
            break;
        case 'settings':
            settingsScreen.classList.add('active');
            gameState.currentScreen = 'settings';
            // Play background music in menu screens if audio is enabled
            if (gameState.audioEnabled && backgroundMusic) {
                backgroundMusic.play().catch(e => {
                    console.log('Auto-play prevented. User interaction required to play audio.');
                });
            }
            break;
        case 'help':
            helpScreen.classList.add('active');
            gameState.currentScreen = 'help';
            // Play background music in menu screens if audio is enabled
            if (gameState.audioEnabled && backgroundMusic) {
                backgroundMusic.play().catch(e => {
                    console.log('Auto-play prevented. User interaction required to play audio.');
                });
            }
            break;
        default:
            console.error('Unknown screen:', screenName);
            return;
    }
    
    console.log('Screen changed to:', screenName);
}

function showModal(modalId) {
    console.log('Showing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('Modal not found:', modalId);
    }
}

function hideModal(modalId) {
    console.log('Hiding modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    } else {
        console.error('Modal not found:', modalId);
    }
}

function updateUI() {
    console.log('Updating UI');
    
    // Update player info
    if (playerNameElement) playerNameElement.textContent = gameState.playerName;
    if (starsCountElement) starsCountElement.textContent = gameState.stars;
    
    // Update hint button state
    if (hintButton) {
        hintButton.disabled = gameState.hintsRemaining <= 0;
        const hintSpan = hintButton.querySelector('span');
        if (hintSpan) {
            hintSpan.textContent = `Hint (${gameState.hintsRemaining})`;
        }
    }
    
    // Update undo button state
    if (undoButton) {
        undoButton.disabled = gameState.playerPattern.length === 0;
    }
    
    // Apply simplified mode if enabled
    if (gameState.simplifiedMode) {
        document.body.classList.add('simplified-mode');
    } else {
        document.body.classList.remove('simplified-mode');
    }
}

function createGardenGrid() {
    console.log('Creating garden grid');
    
    // Clear existing grid
    if (!gardenGrid) {
        console.error('Garden grid element not found');
        return;
    }
    
    gardenGrid.innerHTML = '';
    
    // Create a 3x3 grid for the garden
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cell = document.createElement('div');
            cell.className = 'garden-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.setAttribute('aria-label', `Garden cell row ${row + 1}, column ${col + 1}`);
            
            // Make the cell a drop target
            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('drop', handleDrop);
            cell.addEventListener('dragenter', handleDragEnter);
            cell.addEventListener('dragleave', handleDragLeave);
            
            // Also allow click to place after selecting a flower
            cell.addEventListener('click', handleCellClick);
            
            gardenGrid.appendChild(cell);
        }
    }
}

function createFlowerSelection() {
    // Clear existing flower options
    flowerScroll.innerHTML = '';
    
    // Create flower options based on the flower types
    flowerTypes.forEach(flower => {
        const flowerOption = document.createElement('div');
        flowerOption.className = 'flower-option draggable';
        flowerOption.dataset.flowerId = flower.id;
        flowerOption.setAttribute('draggable', 'true');
        flowerOption.setAttribute('aria-label', `${flower.id} flower`);
        
        // Create an image element for the flower
        const img = document.createElement('img');
        img.src = flower.image + '.png'; // Try PNG first
        img.alt = flower.alt;
        img.className = 'flower-image';
        img.onerror = function() { handleImageError(img); }; // Handle image loading errors
        flowerOption.appendChild(img);
        
        // Add drag start event
        flowerOption.addEventListener('dragstart', handleDragStart);
        
        // Also allow click to select
        flowerOption.addEventListener('click', handleFlowerSelect);
        
        flowerScroll.appendChild(flowerOption);
    });
}


// Variable to store the currently selected flower
let selectedFlower = null;

function handleFlowerSelect(event) {
    console.log('Flower selected');
    
    // Deselect any previously selected flower
    document.querySelectorAll('.flower-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Select the clicked flower
    event.currentTarget.classList.add('selected');
    selectedFlower = event.currentTarget.dataset.flowerId;
    
    // Find the flower type to get its proper name
    const flowerType = flowerTypes.find(f => f.id === selectedFlower);
    const flowerName = flowerType ? flowerType.alt : selectedFlower;
    
    // Provide feedback
    showFeedback(`${flowerName} selected. Click on a garden cell to place it.`, 'info');
    
    // Speak the selection if voice guidance is enabled
    if (gameState.voiceGuidanceEnabled) {
        speakMessage(`${flowerName} selected. Click on a garden cell to place it.`);
    }
}

function handleCellClick(event) {
    console.log('Cell clicked');
    
    // Only proceed if a flower is selected
    if (!selectedFlower) {
        showFeedback('Please select a flower first.', 'info');
        if (gameState.voiceGuidanceEnabled) {
            speakMessage('Please select a flower first.');
        }
        return;
    }
    
    const cell = event.currentTarget;
    
    // Check if cell already has a flower
    if (cell.querySelector('.flower-option')) {
        showFeedback('This cell already has a flower. Try another cell.', 'error');
        playSound('error');
        if (gameState.voiceGuidanceEnabled) {
            speakMessage('This cell already has a flower. Try another cell.');
        }
        return;
    }
    
    // Place the selected flower in the cell
    placeFlower(selectedFlower, cell);
}

function handleDragStart(event) {
    console.log('Drag started');
    
    // Set the dragged flower ID as data
    event.dataTransfer.setData('text/plain', event.target.dataset.flowerId);
    event.target.classList.add('dragging');
    
    // For better drag image
    const dragImage = event.target.cloneNode(true);
    dragImage.style.opacity = '0.7';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 40, 40);
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
}

function handleDragOver(event) {
    // Prevent default to allow drop
    event.preventDefault();
}

function handleDragEnter(event) {
    // Add visual cue for drop target
    event.target.classList.add('drop-target');
}

function handleDragLeave(event) {
    // Remove visual cue
    event.target.classList.remove('drop-target');
}

function handleDrop(event) {
    console.log('Drop event');
    
    // Prevent default action
    event.preventDefault();
    
    // Remove visual cue
    event.target.classList.remove('drop-target');
    
    // Get the flower ID from the drag data
    const flowerId = event.dataTransfer.getData('text/plain');
    
    // Check if cell already has a flower
    if (event.target.querySelector('.flower-option')) {
        showFeedback('This cell already has a flower. Try another cell.', 'error');
        playSound('error');
        if (gameState.voiceGuidanceEnabled) {
            speakMessage('This cell already has a flower. Try another cell.');
        }
        return;
    }
    
    // Place the flower in the cell
    placeFlower(flowerId, event.target);
}

function placeFlower(flowerId, cell) {
    // Find the flower type
    const flowerType = flowerTypes.find(f => f.id === flowerId);
    
    // Create a clone of the flower option
    const flowerElement = document.createElement('div');
    flowerElement.className = 'flower-option placed';
    flowerElement.dataset.flowerId = flowerId;
    
    // Create an image element for the flower
    const img = document.createElement('img');
    img.src = flowerType.image + '.png'; // Try PNG first
    img.alt = flowerType.alt;
    img.className = 'flower-image';
    img.onerror = function() { handleImageError(img); }; // Handle image loading errors
    flowerElement.appendChild(img);
    
    // Add to the cell
    cell.appendChild(flowerElement);
    
    // Update player pattern
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    gameState.playerPattern.push({ row, col, flowerId });
    
    // Provide feedback
    showFeedback(`${flowerId} placed!`, 'success');
    playSound('success');
    
    // Speak the flower placement if voice guidance is enabled
    if (gameState.voiceGuidanceEnabled) {
        const flowerName = flowerType ? flowerType.alt : flowerId;
        speakMessage(`${flowerName} placed in row ${row + 1}, column ${col + 1}`);
    }
    
    // Check if the pattern is complete
    if (gameState.playerPattern.length === gameState.pattern.length) {
        checkPattern();
    }
    
    // Update UI (for undo button)
    updateUI();
}

function showHint() {
    console.log('Showing hint');
    
    // Only show hint if hints are available
    if (gameState.hintsRemaining <= 0) {
        showFeedback('No hints remaining!', 'error');
        if (gameState.voiceGuidanceEnabled) {
            speakMessage('No hints remaining!');
        }
        return;
    }
    
    // Decrease hint count
    gameState.hintsRemaining--;
    
    // Show the pattern briefly
    showPattern();
    
    // Update UI
    updateUI();
}

function showPattern() {
    console.log('Showing pattern to memorize');
    
    // Clear current player pattern
    clearGardenGrid();
    
    // Show feedback to alert the player
    showFeedback('Memorize this pattern!', 'info');
    if (gameState.voiceGuidanceEnabled) {
        speakMessage('Memorize this pattern!');
    }
    
    // Show the correct pattern
    gameState.pattern.forEach(item => {
        const cell = document.querySelector(`.garden-cell[data-row="${item.row}"][data-col="${item.col}"]`);
        if (!cell) {
            console.error('Cell not found for pattern item:', item);
            return;
        }
        
        const flowerType = flowerTypes.find(f => f.id === item.flowerId);
        if (!flowerType) {
            console.error('Flower type not found:', item.flowerId);
            return;
        }
        
        const flowerElement = document.createElement('div');
        flowerElement.className = 'flower-option hint';
        flowerElement.dataset.flowerId = item.flowerId;
        
        // Create an image element for the flower
        const img = document.createElement('img');
        img.src = flowerType.image + '.png'; // Try PNG first
        img.alt = flowerType.alt;
        img.className = 'flower-image';
        img.onerror = function() { handleImageError(img); }; // Handle image loading errors
        flowerElement.appendChild(img);
        
        cell.appendChild(flowerElement);
    });
    
    // Add a visual countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            showFeedback(`Memorize! ${countdown}...`, 'info');
            if (gameState.voiceGuidanceEnabled) {
                speakMessage(`${countdown}...`);
            }
        } else {
            clearInterval(countdownInterval);
            clearGardenGrid();
            showFeedback('Now recreate the pattern!', 'info');
            if (gameState.voiceGuidanceEnabled) {
                speakMessage('Now recreate the pattern!');
            }
        }
    }, 1000);
    
    // Play a sound to indicate pattern is being shown
    playSound('success');
}

function undoLastMove() {
    console.log('Undoing last move');
    
    // Check if there are moves to undo
    if (gameState.playerPattern.length === 0) {
        return;
    }
    
    // Remove the last placed flower
    const lastMove = gameState.playerPattern.pop();
    const cell = document.querySelector(`.garden-cell[data-row="${lastMove.row}"][data-col="${lastMove.col}"]`);
    
    if (cell && cell.querySelector('.flower-option')) {
        cell.removeChild(cell.querySelector('.flower-option'));
    }
    
    // Provide feedback
    showFeedback('Last move undone.', 'info');
    
    // Update UI
    updateUI();
}

function clearGardenGrid() {
    console.log('Clearing garden grid');
    
    // Remove all placed flowers
    document.querySelectorAll('.garden-cell .flower-option').forEach(flower => {
        flower.parentNode.removeChild(flower);
    });
    
    // Clear player pattern
    gameState.playerPattern = [];
    
    // Update UI
    updateUI();
}

function checkPattern() {
    console.log('Checking pattern (position and flower type)');
    
    // Check if the pattern is complete first
    if (gameState.playerPattern.length !== gameState.pattern.length) {
        showFeedback('Pattern incomplete. Keep placing flowers!', 'info');
        if (gameState.voiceGuidanceEnabled) {
            speakMessage('Pattern incomplete. Keep placing flowers!');
        }
        return;
    }
    
    // Create a map of the correct pattern by position
    const correctPatternMap = {};
    gameState.pattern.forEach(move => {
        const posKey = `${move.row},${move.col}`;
        correctPatternMap[posKey] = move.flowerId;
    });
    
    // Check if each player placement matches the correct flower at that position
    let correct = true;
    for (const playerMove of gameState.playerPattern) {
        const posKey = `${playerMove.row},${playerMove.col}`;
        
        // Check if there should be a flower at this position
        if (!correctPatternMap[posKey]) {
            correct = false;
            break;
        }
        
        // Check if it's the correct flower type
        if (correctPatternMap[posKey] !== playerMove.flowerId) {
            correct = false;
            break;
        }
    }
    
    // Also verify all positions in the pattern have been filled
    const playerPositions = gameState.playerPattern.map(move => `${move.row},${move.col}`);
    for (const posKey in correctPatternMap) {
        if (!playerPositions.includes(posKey)) {
            correct = false;
            break;
        }
    }
    if (correct) {
        showFeedback('Perfect! Level complete!', 'success');
        playSound('success');

        if (gameState.voiceGuidanceEnabled) {
            speakMessage('Perfect! Level complete!');
        }
        // Award stars based on hints used
        let starsEarned = 3;
        if (gameState.hintsRemaining < 3) {
            starsEarned = gameState.hintsRemaining;
        }
        // Update total stars
        gameState.stars += starsEarned;
        // Show level complete modal
        document.getElementById('stars-earned').textContent = starsEarned;
        // Update stars display in the modal
        const starsContainer = document.querySelector('.stars-earned');
        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('i');
            star.className = i < starsEarned ? 'fas fa-star' : 'far fa-star';
            starsContainer.appendChild(star);
        }
        // Handle story unlocking based on level completion
        const unlockMessage = handleLevelCompletion(gameState.currentLevel);
        
        // Show story unlock section
        const storyUnlock = document.querySelector('.story-unlock');
        storyUnlock.style.display = 'block';
        
        // Update the message based on level completion
        const storyUnlockMessage = storyUnlock.querySelector('p');
        if (storyUnlockMessage) {
            storyUnlockMessage.textContent = unlockMessage;
        }
        
        // If this is the final level, update the next level button text and show completion message
        if (gameState.currentLevel >= gameState.maxLevel) {
            const nextLevelButton = document.getElementById('next-level-button');
            if (nextLevelButton) {
                nextLevelButton.innerHTML = '<i class="fas fa-check"></i> Complete Game';
            }
            
            // Show the game completion message
            const completionMessage = document.getElementById('game-completion-message');
            if (completionMessage) {
                completionMessage.style.display = 'block';
                completionMessage.textContent = 'Congratulations! You have completed all levels and unlocked all stories!';
            }
        }
        // Show the modal after a short delay
        setTimeout(() => {
            showModal('level-complete-modal');
        }, 1000);
        // Update UI
        updateUI();
    } else {
        showFeedback('Not quite right. Try again!', 'error');
        playSound('error');
        if (gameState.voiceGuidanceEnabled) {
            speakMessage('Not quite right. Try again!');
        }
        // Highlight incorrect placements
        highlightIncorrectPlacements();
        // Clear the garden after a short delay to let the player see what was wrong
        setTimeout(() => {
            clearGardenGrid();
            showFeedback('Try again! Use a hint if needed.', 'info');
            if (gameState.voiceGuidanceEnabled) {
                speakMessage('Try again! Use a hint if needed.');
            }
        }, 2000);
    }
}

function generatePattern() {
    console.log('Generating pattern for level:', gameState.currentLevel);
    
    // Determine the number of flowers in the pattern based on level
    const patternSize = Math.min(3 + Math.floor(gameState.currentLevel / 2), 9);
    
    // Clear the current pattern
    gameState.pattern = [];
    
    // Generate random positions and flower types
    const positions = [];
    for (let i = 0; i < patternSize; i++) {
        let row, col;
        let positionExists;
        
        // Make sure we don't place two flowers in the same position
        do {
            row = Math.floor(Math.random() * 3);
            col = Math.floor(Math.random() * 3);
            positionExists = positions.some(pos => pos.row === row && pos.col === col);
        } while (positionExists);
        
        // Add the position to our list
        positions.push({ row, col });
        
        // Select a random flower type
        const flowerIndex = Math.floor(Math.random() * flowerTypes.length);
        const flowerId = flowerTypes[flowerIndex].id;
        
        // Add to the pattern
        gameState.pattern.push({ row, col, flowerId });
    }
    
    console.log('Generated pattern:', gameState.pattern);
}

/**
 * Improved speech function that handles queuing and prevents delays
 * @param {string} message - The text to be spoken
 * @param {boolean} interrupt - Whether to interrupt current speech (default: false)
 */
function speakMessage(message, interrupt = false) {
    // Use the Web Speech API if available and enabled
    if (!('speechSynthesis' in window) || !gameState.voiceGuidanceEnabled) {
        return;
    }
    
    // If interrupt is true, cancel all current and pending speech
    if (interrupt) {
        speechSynthesis.cancel();
        speechQueue = [];
        isSpeaking = false;
    }
    
    // Create a new utterance with the message
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = gameState.audioEnabled ? 1 : 0;
    speech.rate = 1.0; // Normal speed
    speech.pitch = 1.0; // Normal pitch
    
    // Add onend event to process queue
    speech.onend = function() {
        isSpeaking = false;
        processNextSpeech();
    };
    
    // Add onerror event to handle errors and continue queue
    speech.onerror = function() {
        console.error('Speech synthesis error');
        isSpeaking = false;
        processNextSpeech();
    };
    
    // Add to queue
    speechQueue.push(speech);
    
    // Process queue if not currently speaking
    if (!isSpeaking) {
        processNextSpeech();
    }
}

/**
 * Process the next speech in the queue
 */
function processNextSpeech() {
    if (speechQueue.length === 0 || isSpeaking) {
        return;
    }
    
    // Get the next speech from the queue
    const nextSpeech = speechQueue.shift();
    
    // Set speaking flag
    isSpeaking = true;
    
    // Speak the message
    speechSynthesis.speak(nextSpeech);
}

function highlightIncorrectPlacements() {
    console.log('Highlighting incorrect placements');
    
    // Create a map of the correct pattern by position
    const correctPatternMap = {};
    gameState.pattern.forEach(move => {
        const posKey = `${move.row},${move.col}`;
        correctPatternMap[posKey] = move.flowerId;
    });
    
    // Compare each player placement with the correct pattern
    for (let i = 0; i < gameState.playerPattern.length; i++) {
        const playerMove = gameState.playerPattern[i];
        
        // Find the corresponding cell
        const cell = document.querySelector(`.garden-cell[data-row="${playerMove.row}"][data-col="${playerMove.col}"]`);
        if (!cell) continue;
        
        const flowerElement = cell.querySelector('.flower-option');
        if (!flowerElement) continue;
        
        // Check if this position should have a flower and if it's the correct type
        const posKey = `${playerMove.row},${playerMove.col}`;
        const isCorrectPosition = correctPatternMap.hasOwnProperty(posKey);
        const isCorrectFlower = isCorrectPosition && correctPatternMap[posKey] === playerMove.flowerId;
        
        // Add visual indication
        if (!isCorrectPosition || !isCorrectFlower) {
            flowerElement.classList.add('incorrect');
            
            // Provide more specific feedback
            if (!isCorrectPosition) {
                console.log(`Incorrect position at row ${playerMove.row}, col ${playerMove.col}`);
            } else if (!isCorrectFlower) {
                console.log(`Incorrect flower type at row ${playerMove.row}, col ${playerMove.col}`);
            }
            // Add a shake animation
            flowerElement.classList.add('shake');
        }
    }
}

function levelComplete() {
    console.log('Level complete!');
    
    // Award stars based on performance
    const starsEarned = calculateStars();
    gameState.stars += starsEarned;
    
    // Update the level complete modal
    const starsEarnedElement = document.getElementById('stars-earned');
    if (starsEarnedElement) {
        starsEarnedElement.textContent = starsEarned;
    }
    
    // Show stars in the modal
    const starsContainer = document.querySelector('.stars-earned');
    if (starsContainer) {
        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('i');
            star.className = i < starsEarned ? 'fas fa-star' : 'far fa-star';
            starsContainer.appendChild(star);
        }
    }
    
    // Show the modal
    showModal('level-complete-modal');
    
    // Play success sound
    playSound('success');
    
    // Update UI
    updateUI();
}

function calculateStars() {
    // Calculate stars based on hints used
    return Math.max(1, 3 - (3 - gameState.hintsRemaining));
}

function startNewGame() {
    console.log('Starting new game');
    
    // Reset game state for the level
    gameState.hintsRemaining = 3;
    gameState.playerPattern = [];
    
    // Generate a pattern for the current level
    generatePattern();
    
    // Clear the garden grid
    clearGardenGrid();
    
    // Show instructions with level information
    const instructionText = document.querySelector('.instruction-text');
    if (instructionText) {
        instructionText.textContent = `Level ${gameState.currentLevel} of ${gameState.maxLevel}: Remember the pattern of flowers shown, then recreate it in your garden.`;
    }
    
    showModal('instructions-modal');
    
    // Show the pattern briefly after instructions are closed
    document.getElementById('close-instructions').onclick = function() {
        hideModal('instructions-modal');
        setTimeout(() => {
            showPattern();
        }, 500);
    };
    
    // Make sure the flower selection is enabled
    document.querySelectorAll('.flower-option').forEach(option => {
        option.classList.remove('disabled');
        option.setAttribute('draggable', 'true');
    });
    
    // Speak welcome message for the game
    if (gameState.voiceGuidanceEnabled) {
        speakMessage(`Welcome to Memory Garden, level ${gameState.currentLevel} of ${gameState.maxLevel}. Remember the pattern and recreate it.`);
    }
    
    // Update UI
    updateUI();
    
    console.log('New game started at level:', gameState.currentLevel);
}

function generatePattern() {
    console.log('Generating pattern for level:', gameState.currentLevel);
    
    // Generate a pattern based on the current level
    // The higher the level, the more complex the pattern
    const patternLength = Math.min(9, 2 + Math.floor(gameState.currentLevel / 2));
    
    gameState.pattern = [];
    
    // Generate unique positions
    const positions = [];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            positions.push({ row, col });
        }
    }
    
    // Shuffle positions
    shuffleArray(positions);
    
    // Create the pattern
    for (let i = 0; i < patternLength; i++) {
        const position = positions[i];
        const randomFlowerIndex = Math.floor(Math.random() * flowerTypes.length);
        const flowerId = flowerTypes[randomFlowerIndex].id;
        
        gameState.pattern.push({
            row: position.row,
            col: position.col,
            flowerId: flowerId
        });
    }
    
    console.log('Generated pattern:', gameState.pattern);
    return gameState.pattern;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showFeedback(message, type) {
    console.log('Showing feedback:', message, 'type:', type);
    
    // Set the feedback message
    if (feedbackMessage) {
        feedbackMessage.textContent = message;
        
        // Clear existing classes
        feedbackMessage.className = 'feedback-area';
        
        // Add the appropriate class based on type
        if (type) {
            feedbackMessage.classList.add(`feedback-${type}`);
        }
        
        // Make sure it's visible
        feedbackMessage.style.display = 'block';
        
        // Clear the message after a delay
        setTimeout(() => {
            feedbackMessage.textContent = '';
            feedbackMessage.className = 'feedback-area';
        }, 3000);
        
        // Speak the message if voice guidance is enabled
        if (gameState.voiceGuidanceEnabled) {
            speakMessage(message);
        }
    }
}

function startNewGame() {
    console.log('Starting new game at level:', gameState.currentLevel);
    
    // Reset game state for the new level
    gameState.hintsRemaining = 3;
    gameState.pattern = [];
    gameState.playerPattern = [];
    
    // Clear the garden grid
    clearGardenGrid();
    
    // Generate a new pattern based on the current level
    generatePattern();
    
    // Show instructions
    showModal('instructions-modal');
    
    // Show the pattern after a short delay
    setTimeout(() => {
        hideModal('instructions-modal');
        showPattern();
    }, 2000);
    
    // Update UI
    updateUI();
}

/**
 * Improved speech function that handles queuing and prevents delays
 * @param {string} message - The text to be spoken
 * @param {boolean} interrupt - Whether to interrupt current speech (default: false)
 */
function speakMessage(message, interrupt = false) {
    // Use the Web Speech API if available and enabled
    if (!('speechSynthesis' in window) || !gameState.voiceGuidanceEnabled) {
        return;
    }
    
    // If interrupt is true, cancel all current and pending speech
    if (interrupt) {
        speechSynthesis.cancel();
        speechQueue = [];
        isSpeaking = false;
    }
    
    // Create a new utterance with the message
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = gameState.audioEnabled ? 1 : 0;
    speech.rate = 1.0; // Normal speed
    speech.pitch = 1.0; // Normal pitch
    
    // Add onend event to process queue
    speech.onend = function() {
        isSpeaking = false;
        processNextSpeech();
    };
    
    // Add onerror event to handle errors and continue queue
    speech.onerror = function() {
        console.error('Speech synthesis error');
        isSpeaking = false;
        processNextSpeech();
    };
    
    // Add to queue
    speechQueue.push(speech);
    
    // Process queue if not currently speaking
    if (!isSpeaking) {
        processNextSpeech();
    }
}

/**
 * Process the next speech in the queue
 */
function processNextSpeech() {
    if (speechQueue.length === 0 || isSpeaking) {
        return;
    }
    
    // Get the next speech from the queue
    const nextSpeech = speechQueue.shift();
    
    // Set speaking flag
    isSpeaking = true;
    
    // Speak the message
    speechSynthesis.speak(nextSpeech);
}

function playSound(soundType) {
    console.log('Playing sound:', soundType);
    
    // Only play sounds if audio is enabled
    if (!gameState.audioEnabled) {
        return;
    }
    
    let sound;
    switch(soundType) {
        case 'success':
            sound = successSound;
            break;
        case 'error':
            sound = errorSound;
            break;
        default:
            console.error('Unknown sound type:', soundType);
            return;
    }
    
    if (sound) {
        // Reset the sound to the beginning
        sound.currentTime = 0;
        
        // Play the sound
        sound.play().catch(e => {
            console.log('Error playing sound:', e);
        });
    }
}

// Function to play the tutorial video is defined earlier in the code

// Initialize the game when the page loads
window.addEventListener('load', () => {
    console.log('Page loaded');
    
    // Create necessary folders for images if they don't exist
    // Note: This would be done on the server side in a real application
    
    // Start background music if audio is enabled
    if (gameState.audioEnabled && backgroundMusic) {
        backgroundMusic.play().catch(e => {
            console.log('Auto-play prevented. User interaction required to play audio.');
        });
    }
    
    // Make sure UI is updated with initial game state
    updateUI();
    
    // Show the main menu screen
    showScreen('main-menu');
});


// Storybook variables
let narrationAudio;
let currentStory = 'story1';
let isNarrationPlaying = false;
let speechSynthesis = window.speechSynthesis;
let speechUtterance = null;
let speechQueue = [];
let isSpeaking = false;

// Storybook Functions
function initializeStorybook() {
    console.log('Initializing storybook...');
    
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported in this browser');
        showFeedback('Voice narration is not supported in your browser', 'error');
    }
    
    // Reset all stories to locked state except the first one
    resetStoryLocks();
    
    // Set initial story
    selectStory('The Garden Begins');
    
    // Hide pause button initially
    document.getElementById('pause-narration').style.display = 'none';
}

/**
 * Resets all stories to their initial locked state
 * Only the first story is unlocked by default
 */
function resetStoryLocks() {
    console.log('Resetting story locks');
    
    // Get all story items
    const storyItems = document.querySelectorAll('.story-item');
    
    // Lock all stories except the first one
    storyItems.forEach((item, index) => {
        if (index === 0) {
            // First story is always unlocked
            item.classList.remove('locked');
            item.classList.add('unlocked');
            
            // Hide the lock overlay if it exists
            const lockOverlay = item.querySelector('.lock-overlay');
            if (lockOverlay) {
                lockOverlay.style.display = 'none';
            }
            
            // Update the story info text
            const storyInfo = item.querySelector('.story-info p');
            if (storyInfo) {
                storyInfo.textContent = 'Read the story below!';
            }
        } else {
            // Lock all other stories
            item.classList.remove('unlocked');
            item.classList.add('locked');
            
            // Show the lock overlay
            const lockOverlay = item.querySelector('.lock-overlay');
            if (lockOverlay) {
                lockOverlay.style.display = 'block';
            }
            
            // Update the story info text based on which level unlocks it
            const storyInfo = item.querySelector('.story-info p');
            if (storyInfo) {
                if (index === 1) {
                    storyInfo.textContent = 'Complete Level 2 to unlock';
                } else if (index === 2) {
                    storyInfo.textContent = 'Complete Level 3 to unlock';
                } else {
                    storyInfo.textContent = 'Complete Level 3 to unlock';
                }
            }
        }
    });
}

// Function to unlock all stories in the storybook
function unlockAllStories() {
    console.log('Unlocking all stories');
    
    // Get all story items
    const storyItems = document.querySelectorAll('.story-item');
    
    // Remove the 'locked' class from all story items
    storyItems.forEach(item => {
        item.classList.remove('locked');
        item.classList.add('unlocked');
        
        // Remove the lock overlay
        const lockOverlay = item.querySelector('.lock-overlay');
        if (lockOverlay) {
            lockOverlay.style.display = 'none';
        }
        
        // Update the story info text
        const storyInfo = item.querySelector('.story-info p');
        if (storyInfo) {
            storyInfo.textContent = 'Read the story below!';
        }
    });
}

function selectStory(storyTitle) {
    console.log('Selecting story:', storyTitle);
    
    // Update the story title
    document.getElementById('story-title').textContent = storyTitle;
    
    // Update the story content based on the selected story
    let storyContent = '';
    
    switch(storyTitle) {
        case 'The Garden Begins':
            storyContent = `
                <p>Once upon a time, there was a beautiful garden that needed care and attention...</p>
                <p>The flowers were waiting for someone special to help them grow and bloom...</p>
                <p>That special person was you!</p>
                <p>With your memory skills and love for nature, you started planting flowers one by one.</p>
                <p>Each flower you planted correctly made the garden more beautiful and vibrant.</p>
                <p>The garden was grateful for your help and promised to reward you with magical stories as you continued to help it grow.</p>
            `;
            currentStory = 'story1';
            break;
        case 'The Magical Flower':
            storyContent = `
                <p>As you continued to tend to your garden, something magical happened!</p>
                <p>One morning, you noticed a flower unlike any you had seen before.</p>
                <p>It had petals that shimmered with all the colors of the rainbow.</p>
                <p>When you approached it, the flower began to glow and spoke to you!</p>
                <p>"Thank you for caring for this garden," it said. "Your memory and dedication have brought magic back to this place."</p>
                <p>The magical flower promised to be your friend and help you on your gardening journey.</p>
            `;
            currentStory = 'story2';
            break;
        case 'Garden Friends':
            storyContent = `
                <p>Your garden was now flourishing with beautiful flowers of all kinds.</p>
                <p>One day, you noticed that small creatures had begun to visit your garden.</p>
                <p>Butterflies danced among the flowers, bees buzzed happily collecting pollen, and birds sang in the trees.</p>
                <p>They all came to thank you for creating such a wonderful home for them.</p>
                <p>"Your memory garden has become a sanctuary for all of us," they said.</p>
                <p>From that day on, you were never alone in your garden, surrounded by friends who appreciated your hard work.</p>
            `;
            currentStory = 'story3';
            break;
        default:
            storyContent = '<p>Story not found.</p>';
    }
    
    document.getElementById('story-content').innerHTML = storyContent;
    
    // Reset narration state
    pauseNarration();
    isNarrationPlaying = false;
    
    // Highlight the selected story in the list
    document.querySelectorAll('.story-item').forEach(item => {
        const itemTitle = item.querySelector('h4').textContent;
        if (itemTitle === storyTitle && !item.classList.contains('locked')) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function playNarration() {
    console.log('Playing narration for story:', currentStory);
    
    if (gameState.audioEnabled) {
        // Get the story content text
        const storyContent = document.getElementById('story-content');
        const paragraphs = storyContent.querySelectorAll('p');
        let textToRead = '';
        
        // Combine all paragraphs into a single text string
        paragraphs.forEach(paragraph => {
            textToRead += paragraph.textContent + ' ';
        });
        
        // Create a new utterance with the story text
        speechUtterance = new SpeechSynthesisUtterance(textToRead);
        
        // Set properties for the speech
        speechUtterance.rate = 0.9; // Slightly slower than default
        speechUtterance.pitch = 1.0;
        speechUtterance.volume = gameState.audioEnabled ? 1.0 : 0;
        
        // Event for when speech ends
        speechUtterance.onend = function() {
            isNarrationPlaying = false;
            document.getElementById('play-narration').style.display = 'inline-block';
            document.getElementById('pause-narration').style.display = 'none';
        };
        
        // Start speaking
        speechSynthesis.speak(speechUtterance);
        isNarrationPlaying = true;
        
        // Update button states
        document.getElementById('play-narration').style.display = 'none';
        document.getElementById('pause-narration').style.display = 'inline-block';
        
        // Show feedback
        showFeedback('Story narration started', 'info');
    } else {
        showFeedback('Audio is currently disabled. Enable it in settings.', 'info');
    }
}

function pauseNarration() {
    console.log('Pausing narration');
    
    if (isNarrationPlaying) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        isNarrationPlaying = false;
        
        // Update button states
        document.getElementById('play-narration').style.display = 'inline-block';
        document.getElementById('pause-narration').style.display = 'none';
        
        // Show feedback
        showFeedback('Story narration paused', 'info');
    }
}

function showFeedback(message, type = 'info') {
    console.log(`Showing feedback: ${message} (${type})`);
    
    if (feedbackMessage) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = 'feedback-area';
        feedbackMessage.classList.add(type);
        feedbackMessage.style.display = 'block';
        
        // Hide the feedback after a delay
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 3000);
    }
}

function startNewGame() {
    console.log('Starting new game at level:', gameState.currentLevel);
    
    // Reset game state for the new level
    gameState.hintsRemaining = 3;
    gameState.pattern = [];
    gameState.playerPattern = [];
    
    // Clear the garden grid
    clearGardenGrid();
    
    // Generate a new pattern based on the current level
    generatePattern();
    
    // Show instructions
    showModal('instructions-modal');
    
    // Show the pattern after a short delay
    setTimeout(() => {
        hideModal('instructions-modal');
        showPattern();
    }, 2000);
    
    // Update UI
    updateUI();
}

/**
 * Improved speech function that handles queuing and prevents delays
 * @param {string} message - The text to be spoken
 * @param {boolean} interrupt - Whether to interrupt current speech (default: false)
 */
function speakMessage(message, interrupt = false) {
    // Use the Web Speech API if available and enabled
    if (!('speechSynthesis' in window) || !gameState.voiceGuidanceEnabled) {
        return;
    }
    
    // If interrupt is true, cancel all current and pending speech
    if (interrupt) {
        speechSynthesis.cancel();
        speechQueue = [];
        isSpeaking = false;
    }
    
    // Create a new utterance with the message
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = gameState.audioEnabled ? 1 : 0;
    speech.rate = 1.0; // Normal speed
    speech.pitch = 1.0; // Normal pitch
    
    // Add onend event to process queue
    speech.onend = function() {
        isSpeaking = false;
        processNextSpeech();
    };
    
    // Add onerror event to handle errors and continue queue
    speech.onerror = function() {
        console.error('Speech synthesis error');
        isSpeaking = false;
        processNextSpeech();
    };
    
    // Add to queue
    speechQueue.push(speech);
    
    // Process queue if not currently speaking
    if (!isSpeaking) {
        processNextSpeech();
    }
}

/**
 * Process the next speech in the queue
 */
function processNextSpeech() {
    if (speechQueue.length === 0 || isSpeaking) {
        return;
    }
    
    // Get the next speech from the queue
    const nextSpeech = speechQueue.shift();
    
    // Set speaking flag
    isSpeaking = true;
    
    // Speak the message
    speechSynthesis.speak(nextSpeech);
}

function playSound(soundType) {
    console.log('Playing sound:', soundType);
    
    // Only play sounds if audio is enabled
    if (!gameState.audioEnabled) {
        return;
    }
    
    let sound;
    switch(soundType) {
        case 'success':
            sound = successSound;
            break;
        case 'error':
            sound = errorSound;
            break;
        default:
            console.error('Unknown sound type:', soundType);
            return;
    }
    
    if (sound) {
        // Reset the sound to the beginning
        sound.currentTime = 0;
        
        // Play the sound
        sound.play().catch(e => {
            console.log('Error playing sound:', e);
        });
    }
}

// Function to play the tutorial video
function playTutorialVideo() {
    console.log('Playing tutorial video');
    
    // Create a modal for the video
    const videoModal = document.createElement('div');
    videoModal.className = 'modal active';
    videoModal.id = 'video-modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Create video element
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.setAttribute('playsinline', ''); // Better mobile support
    
    // Create source element
    const sourceElement = document.createElement('source');
    sourceElement.src = 'video/tutorial-video.mp4'; // Fixed typo in filename
    sourceElement.type = 'video/mp4';
    
    // Add fallback text
    videoElement.textContent = 'Your browser does not support the video tag.';
    
    // Add error handling
    videoElement.addEventListener('error', function() {
        console.error('Error loading video');
        modalContent.innerHTML += '<p class="error-message">Error loading video. Please try again later.</p>';
    });
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-button';
    closeButton.innerHTML = '<i class="fas fa-times"></i> Close';
    closeButton.addEventListener('click', () => {
        // Stop the video when closing
        videoElement.pause();
        document.body.removeChild(videoModal);
    });
    
    // Add elements to the DOM
    videoElement.appendChild(sourceElement);
    modalContent.appendChild(videoElement);
    modalContent.appendChild(closeButton);
    videoModal.appendChild(modalContent);
    document.body.appendChild(videoModal);
}

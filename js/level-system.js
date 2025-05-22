// Level System for Memory Garden

/**
 * Handles level completion and story unlocking based on the current level
 * @param {number} level - The level that was just completed
 * @returns {string} - A message about story unlocking status
 */
function handleLevelCompletion(level) {
    console.log(`Handling completion for level ${level}`);
    
    let unlockMessage = "";
    
    // Level 1 doesn't unlock any stories
    if (level === 1) {
        unlockMessage = "Complete level 2 to unlock a new story!";
    }
    // Level 2 unlocks the second story
    else if (level === 2) {
        unlockStory(2);
        unlockMessage = "You've unlocked 'The Magical Flower' story!";
    }
    // Level 3 unlocks all stories
    else if (level === 3) {
        unlockAllStories();
        unlockMessage = "You've unlocked all stories! Congratulations on completing the game!";
    }
    
    return unlockMessage;
}

/**
 * Unlocks a specific story by its number
 * @param {number} storyNumber - The story number to unlock (1-based index)
 */
function unlockStory(storyNumber) {
    console.log(`Unlocking story ${storyNumber}`);
    
    // Get all story items
    const storyItems = document.querySelectorAll('.story-item');
    
    // Make sure we have enough stories
    if (storyItems.length < storyNumber) {
        console.error(`Story ${storyNumber} does not exist`);
        return;
    }
    
    // Unlock the specific story (adjust for 0-based index)
    const storyToUnlock = storyItems[storyNumber - 1];
    if (storyToUnlock) {
        storyToUnlock.classList.remove('locked');
        storyToUnlock.classList.add('unlocked');
        
        // Remove the lock overlay
        const lockOverlay = storyToUnlock.querySelector('.lock-overlay');
        if (lockOverlay) {
            lockOverlay.style.display = 'none';
        }
        
        // Update the story info text
        const storyInfo = storyToUnlock.querySelector('.story-info p');
        if (storyInfo) {
            storyInfo.textContent = 'Read the story below!';
        }
    }
}

/**
 * Unlocks all stories in the storybook
 */
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

/**
 * Checks if the player has completed all available levels
 * @param {number} currentLevel - The current level
 * @param {number} maxLevel - The maximum level available
 * @returns {boolean} - Whether all levels are completed
 */
function isAllLevelsCompleted(currentLevel, maxLevel) {
    return currentLevel > maxLevel;
}
import { test, expect } from '@playwright/test';

test.describe('Name Recall Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://main.d1cwkx1vylsefj.amplifyapp.com/');
  });

  test('Scenario 1: Starting a practice session', async ({ page }) => {
    // Given the professor is on the Start screen with a course available to select
    await expect(page.getByRole('heading', { name: 'Name Recall' })).toBeVisible();
    await expect(page.getByText('Select Course')).toBeVisible();
    
    const courseButton = page.getByRole('button', { name: 'Digital Product Design' });
    await expect(courseButton).toBeVisible();
    
    // When they select a course and press the "Start" button (Begin Review)
    await courseButton.click();
    
    const startButton = page.getByRole('button', { name: 'Begin Review' });
    await expect(startButton).toBeEnabled();
    await startButton.click();
    
    // Then the first student card should appear showing the front face (photo only)
    const flashcard = page.locator('#flashcard');
    await expect(flashcard).toBeVisible();
    
    const cardFront = page.locator('.card-front');
    await expect(cardFront).toBeVisible();
    
    const cardPhoto = page.locator('#card-photo-front');
    await expect(cardPhoto).toBeVisible();
    
    // and the progress indicator should display "1 / total deck size"
    const currentNum = page.locator('#current-num');
    await expect(currentNum).toHaveText('1');
    
    const totalNum = page.locator('#total-num');
    await expect(totalNum).toBeVisible();
    const totalDeckSize = await totalNum.textContent();
    expect(totalDeckSize).toBeTruthy();
    expect(parseInt(totalDeckSize)).toBeGreaterThan(0);
    
    const progressText = page.locator('.progress-text');
    await expect(progressText).toContainText(`1 of ${totalDeckSize}`);
  });

  test('Scenario 2: Evaluating a card and moving to the next one', async ({ page }) => {
    // Given the professor is viewing the back of a student card (after flipping it)
    await expect(page.getByRole('heading', { name: 'Name Recall' })).toBeVisible();
    
    const courseButton = page.getByRole('button', { name: 'Digital Product Design' });
    await courseButton.click();
    
    const startButton = page.getByRole('button', { name: 'Begin Review' });
    await startButton.click();
    
    // Wait for card to load
    await expect(page.locator('#flashcard')).toBeVisible();
    
    // Flip the card to show the back
    const flashcard = page.locator('#flashcard');
    await flashcard.click();
    
    // Wait for back face to be visible
    const cardBack = page.locator('.card-back');
    await expect(cardBack).toBeVisible();
    
    // Get initial progress values
    const initialCurrentNum = page.locator('#current-num');
    const initialCurrentText = await initialCurrentNum.textContent();
    const initialCurrent = parseInt(initialCurrentText);
    
    const totalNum = page.locator('#total-num');
    const totalDeckSize = await totalNum.textContent();
    const total = parseInt(totalDeckSize);
    
    // Wait for evaluation buttons to appear
    const evalButtons = page.locator('#eval-buttons');
    await expect(evalButtons).toBeVisible();
    
    // When they click the "Got it" button
    const gotItButton = page.getByRole('button', { name: 'Got it' });
    await expect(gotItButton).toBeVisible();
    await gotItButton.click();
    
    // Then the next student card should load
    // Wait for the card to transition (front face should be visible again)
    await expect(page.locator('.card-front')).toBeVisible({ timeout: 5000 });
    
    // the progress bar should update
    const updatedCurrentNum = page.locator('#current-num');
    await expect(updatedCurrentNum).toHaveText(String(initialCurrent + 1));
    
    // and the completed count should increase
    // Verify progress text shows the updated count
    const progressText = page.locator('.progress-text');
    await expect(progressText).toContainText(`${initialCurrent + 1} of ${totalDeckSize}`);
  });
});


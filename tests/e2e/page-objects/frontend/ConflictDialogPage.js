const BasePage = require('./BasePage');

class ConflictDialogPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Dialog selectors
    this.dialog = '.pe-confirmation-dialog';
    this.dialogVisible = '.pe-confirmation-dialog.visible';
    this.dialogTitle = '.pe-dialog-title';
    this.dialogMessage = '.pe-dialog-message';
    this.dialogButtons = '.pe-dialog-buttons button';
    this.dialogBackdrop = '.pe-dialog-backdrop';
    
    // Specific button selectors
    this.replaceButton = '.pe-dialog-confirm';
    this.cancelButton = '.pe-dialog-cancel';
    this.backButton = '.pe-dialog-additional'; // Additional button for "Go back to room select"
  }

  async waitForDialog() {
    await this.page.waitForSelector(this.dialogVisible, { timeout: 5000 });
  }

  async getTitle() {
    await this.waitForDialog();
    return await this.page.textContent(this.dialogTitle);
  }

  async getMessage() {
    await this.waitForDialog();
    return await this.page.textContent(this.dialogMessage);
  }

  async getButtonTexts() {
    await this.waitForDialog();
    return await this.page.$$eval(this.dialogButtons, 
      buttons => buttons.map(btn => btn.textContent.trim())
    );
  }

  async clickReplace() {
    await this.waitForDialog();
    await this.page.click(this.replaceButton);
  }

  async clickCancel() {
    await this.waitForDialog();
    await this.page.click(this.cancelButton);
  }

  async clickGoBackToRoomSelect() {
    await this.waitForDialog();
    // The back button is the first additional button
    const backButton = await this.page.$(this.backButton);
    if (backButton) {
      await backButton.click();
    }
  }

  async clickButtonByText(buttonText) {
    await this.waitForDialog();
    const button = await this.page.locator(`${this.dialogButtons}:has-text("${buttonText}")`);
    await button.click();
  }

  async isVisible() {
    return await this.page.isVisible(this.dialogVisible);
  }

  async waitForClose() {
    await this.page.waitForSelector(this.dialog, { state: 'hidden', timeout: 5000 });
  }

  async dismissWithEscape() {
    await this.page.keyboard.press('Escape');
    await this.waitForClose();
  }

  async dismissWithBackdropClick() {
    await this.page.click(this.dialogBackdrop);
    await this.waitForClose();
  }

  async getAriaAttributes() {
    await this.waitForDialog();
    const dialog = await this.page.$(this.dialog);
    return {
      role: await dialog.getAttribute('role'),
      ariaLabel: await dialog.getAttribute('aria-label'),
      ariaDescribedBy: await dialog.getAttribute('aria-describedby')
    };
  }

  async getFocusedElement() {
    return await this.page.evaluate(() => {
      const activeElement = document.activeElement;
      return {
        tagName: activeElement.tagName,
        className: activeElement.className,
        text: activeElement.textContent
      };
    });
  }

  async tabThroughButtons() {
    const focusedElements = [];
    
    // Tab through all buttons
    for (let i = 0; i < 3; i++) {
      await this.page.keyboard.press('Tab');
      const focused = await this.getFocusedElement();
      focusedElements.push(focused);
    }
    
    return focusedElements;
  }
}

module.exports = ConflictDialogPage;
import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Démarrage du test AiEditor avec Playwright...');

  // Lancer le navigateur
  const browser = await chromium.launch({
    headless: false, // Pour voir ce qui se passe
    slowMo: 1000 // Ralentir pour observer
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Écouter les logs de la console
  page.on('console', msg => {
    console.log(`📝 CONSOLE: ${msg.text()}`);
  });

  // Écouter les erreurs
  page.on('pageerror', error => {
    console.error(`❌ PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('🌐 Navigation vers AiEditor...');
    await page.goto('http://localhost:5173');

    // Attendre que la page se charge
    await page.waitForLoadState('networkidle');
    console.log('✅ Page chargée');

    // Vérifier que l'AiEditor est présent
    const editorExists = await page.locator('#aiEditor').isVisible();
    console.log(`📝 AiEditor visible: ${editorExists}`);

    // Vérifier que le sélecteur AI est présent
    const aiSelectorExists = await page.locator('#aiModelSelect').isVisible();
    console.log(`📝 AI Model Selector visible: ${aiSelectorExists}`);

    // Attendre un peu pour l'initialisation
    await page.waitForTimeout(3000);

    // Écrire du texte dans l'éditeur
    console.log('✍️ Écriture de texte dans l\'éditeur...');
    const editorLocator = page.locator('#aiEditor .aie-content').first();
    await editorLocator.click();
    await page.keyboard.type('This is a test message for AI features. It should be long enough to test the AI functionality properly.');

    // Attendre un peu pour que le texte soit rendu
    await page.waitForTimeout(1000);

    // Sélectionner le texte avec la souris (drag selection)
    console.log('🎯 Sélection du texte avec la souris...');
    await editorLocator.click({ position: { x: 50, y: 20 } });
    await page.mouse.down();
    await page.mouse.move(400, 20);
    await page.mouse.up();

    // Attendre un peu pour voir si les bulles apparaissent
    await page.waitForTimeout(2000);

    // Vérifier si les bulles AI sont visibles
    const aiBubbles = page.locator('.tippy-box').all();
    const bubbleCount = (await aiBubbles).length;
    console.log(`🎈 Nombre de bulles visibles: ${bubbleCount}`);

    if (bubbleCount > 0) {
      console.log('✅ Des bulles sont visibles !');

      // Chercher les boutons AI dans les bulles
      const translateButton = page.locator('[data-lang="English"], #translate').first();
      const translateVisible = await translateButton.isVisible();
      console.log(`🌐 Bouton traduction visible: ${translateVisible}`);

      if (translateVisible) {
        console.log('🎯 Clic sur le bouton de traduction...');
        await translateButton.click();

        // Attendre la réponse
        await page.waitForTimeout(5000);

        // Vérifier si un panneau de traduction est apparu
        const translatePanel = page.locator('.aie-translate-result-panel');
        const panelVisible = await translatePanel.isVisible();
        console.log(`📋 Panneau de traduction visible: ${panelVisible}`);

        if (panelVisible) {
          console.log('✅ Fonctionnalité AI détectée !');
        } else {
          console.log('❌ Panneau de traduction non trouvé');
        }
      } else {
        console.log('❌ Bouton de traduction non trouvé');

        // Lister tous les éléments de bulle pour déboguer
        const bubbleElements = await page.locator('.tippy-box').all();
        for (let i = 0; i < bubbleElements.length; i++) {
          const text = await bubbleElements[i].textContent();
          console.log(`🎈 Bulle ${i + 1}: "${text?.substring(0, 100)}..."`);
        }
      }
    } else {
      console.log('❌ Aucune bulle AI visible');

      // Vérifier s'il y a des erreurs JavaScript
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));

      if (errors.length > 0) {
        console.log('🚨 Erreurs JavaScript détectées:');
        errors.forEach(error => console.log(`   - ${error}`));
      }

      // Vérifier les logs de console pour des erreurs
      console.log('🔍 Vérification des logs de console...');
    }

    // Tester le changement de modèle AI
    console.log('🔄 Test du changement de modèle AI...');
    const modelSelect = page.locator('#aiModelSelect');
    await modelSelect.selectOption('anthropic/claude-3-sonnet');

    // Attendre un peu
    await page.waitForTimeout(1000);

    console.log('✅ Test du sélecteur de modèle terminé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    console.log('🛑 Fermeture du navigateur...');
    await browser.close();
  }

  console.log('🏁 Test terminé');
})();

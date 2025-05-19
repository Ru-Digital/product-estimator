/**
 * Debug script for similar products carousel navigation
 * 
 * This script helps debug why the navigation buttons aren't working
 * Add this to the page to see what's happening
 */

(function() {
  console.log('=== Debugging Similar Products Carousel Navigation ===');
  
  // Wait for DOM to be ready
  setTimeout(() => {
    // Find all similar products carousels
    const carousels = document.querySelectorAll('.similar-products-carousel');
    console.log(`Found ${carousels.length} similar products carousels`);
    
    carousels.forEach((carousel, index) => {
      console.log(`\nCarousel ${index + 1}:`);
      
      // Check for navigation buttons
      const prevBtn = carousel.querySelector('.suggestions-nav.prev');
      const nextBtn = carousel.querySelector('.suggestions-nav.next');
      
      console.log('Previous button:', prevBtn ? 'Found' : 'Missing');
      console.log('Next button:', nextBtn ? 'Found' : 'Missing');
      
      // Check computed styles if buttons exist
      if (prevBtn) {
        const prevStyles = window.getComputedStyle(prevBtn);
        console.log('Previous button styles:');
        console.log('- Display:', prevStyles.display);
        console.log('- Visibility:', prevStyles.visibility);
        console.log('- Opacity:', prevStyles.opacity);
        console.log('- Position:', prevStyles.position);
        console.log('- Z-index:', prevStyles.zIndex);
        console.log('- Pointer-events:', prevStyles.pointerEvents);
      }
      
      if (nextBtn) {
        const nextStyles = window.getComputedStyle(nextBtn);
        console.log('Next button styles:');
        console.log('- Display:', nextStyles.display);
        console.log('- Visibility:', nextStyles.visibility);
        console.log('- Opacity:', nextStyles.opacity);
        console.log('- Position:', nextStyles.position);
        console.log('- Z-index:', nextStyles.zIndex);
        console.log('- Pointer-events:', nextStyles.pointerEvents);
      }
      
      // Check carousel instance
      const instance = carousel.carouselInstance;
      console.log('Carousel instance:', instance ? 'Found' : 'Missing');
      
      if (instance) {
        console.log('Instance properties:');
        console.log('- Items count:', instance.items ? instance.items.length : 'N/A');
        console.log('- Current position:', instance.currentPosition);
        console.log('- Max position:', instance.maxPosition);
        console.log('- Previous button handler:', instance.handlePrevClick ? 'Set' : 'Missing');
        console.log('- Next button handler:', instance.handleNextClick ? 'Set' : 'Missing');
      }
      
      // Check parent containers for overflow issues
      let parent = carousel.parentElement;
      let overflowIssues = [];
      while (parent && parent !== document.body) {
        const parentStyles = window.getComputedStyle(parent);
        if (parentStyles.overflow === 'hidden' || parentStyles.overflowX === 'hidden') {
          overflowIssues.push({
            element: parent,
            className: parent.className,
            overflow: parentStyles.overflow,
            overflowX: parentStyles.overflowX
          });
        }
        parent = parent.parentElement;
      }
      
      if (overflowIssues.length > 0) {
        console.log('Overflow issues found in parent containers:');
        overflowIssues.forEach(issue => {
          console.log(`- ${issue.className}: overflow=${issue.overflow}, overflow-x=${issue.overflowX}`);
        });
      }
    });
    
    // Check event listeners
    document.querySelectorAll('.similar-products-carousel .suggestions-nav').forEach((btn, index) => {
      console.log(`\nButton ${index + 1} (${btn.classList.contains('prev') ? 'Previous' : 'Next'}):`);
      
      // Try to trigger a click
      try {
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        console.log('Dispatching test click event...');
        const result = btn.dispatchEvent(event);
        console.log('Click event result:', result);
      } catch (e) {
        console.error('Error dispatching click:', e);
      }
    });
    
  }, 2000); // Wait for carousels to initialize
})();
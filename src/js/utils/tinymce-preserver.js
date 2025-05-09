/**
 * Direct copy of the working setupWpEditors function as a utility
 */

import { createLogger } from './logger';
const logger = createLogger('UtilsTinyMCEPreserver');
export function setupTinyMCEHTMLPreservation(editorIds, containerSelector = 'body') {
  const $ = jQuery;

  // Check if we're in the right container
  if ($(containerSelector).length === 0) {
    return;
  }

  logger.log('Setting up rich text editors with <br> tag preservation');

  // Store original HTML content to restore after mode switches
  window._originalEditorContent = window._originalEditorContent || {};

  // Function to prepare content for the Visual editor
  // This specifically handles the <br> tag issue
  const prepareForVisualEditor = (content) => {
    // Ensure <br> tags are properly preserved by adding a marker
    // TinyMCE often strips solo <br> tags, so we add a zero-width space after them
    return content.replace(/<br\s*\/?>/gi, '<br>\u200B');
  };

  // Function to clean up content when retrieving from the Visual editor
  const cleanupFromVisualEditor = (content) => {
    // Remove any zero-width spaces we added
    return content.replace(/\u200B/g, '');
  };

  // Function to properly initialize TinyMCE with br tag preservation
  const initEditor = (editorId) => {
    if (!tinyMCE || !tinyMCE.get(editorId)) {
      return false;
    }

    const editor = tinyMCE.get(editorId);

    // Configure editor for HTML preservation
    editor.settings.wpautop = false;
    editor.settings.forced_root_block = '';
    editor.settings.valid_elements = '*[*]';
    editor.settings.entity_encoding = 'raw';
    editor.settings.verify_html = false;
    editor.settings.br_in_pre = false;

    // Additional BR specific settings
    editor.settings.keep_styles = true;
    editor.settings.remove_linebreaks = false;
    editor.settings.convert_newlines_to_brs = true;
    editor.settings.remove_redundant_brs = false;

    // Get raw content from textarea
    const $textarea = $(`#${editorId}`);
    if ($textarea.length) {
      const rawContent = $textarea.val();
      window._originalEditorContent[editorId] = rawContent;

      // Set the content in editor with our <br> preservation function
      setTimeout(() => {
        const preparedContent = prepareForVisualEditor(rawContent);
        editor.setContent(preparedContent, {format: 'raw'});
      }, 100);
    }

    // Add event listeners for content filtering

    // Process content before it's set in the editor
    editor.on('BeforeSetContent', function(e) {
      if (e.content) {
        // Process the content to preserve <br> tags
        e.content = prepareForVisualEditor(e.content);
      }

      // Store original content if this is initial load or switching from text mode
      if (e.initial || e.source_view) {
        window._originalEditorContent[editorId] = e.content;
      }
    });

    // Process content when it's retrieved from the editor
    editor.on('GetContent', function(e) {
      if (e.content) {
        // Clean up our marker characters
        e.content = cleanupFromVisualEditor(e.content);
      }
    });

    // Capture raw content when editor is initialized
    editor.on('init', function() {
      const content = editor.getContent({format: 'raw'});
      window._originalEditorContent[editorId] = cleanupFromVisualEditor(content);
      logger.log(`Editor ${editorId} initialized with content length: ${content.length}`);
    });

    // Prevent content loss when switching modes
    const $tabButtons = $(`.wp-editor-tabs button[data-wp-editor-id="${editorId}"]`);
    $tabButtons.on('click', function() {
      const isTextMode = $(this).hasClass('switch-html');
      const isVisualMode = $(this).hasClass('switch-tmce');

      if (isTextMode) {
        // Switching to text mode - get content from visual editor first
        if (tinyMCE.get(editorId)) {
          const content = tinyMCE.get(editorId).getContent({format: 'raw'});
          const cleanContent = cleanupFromVisualEditor(content);
          window._originalEditorContent[editorId] = cleanContent;
          // Update the textarea directly with clean content
          $(`#${editorId}`).val(cleanContent);
        }
      }

      if (isVisualMode) {
        // Switching to visual mode - restore original content after a delay
        setTimeout(() => {
          if (tinyMCE.get(editorId) && window._originalEditorContent[editorId]) {
            const preparedContent = prepareForVisualEditor(window._originalEditorContent[editorId]);
            tinyMCE.get(editorId).setContent(preparedContent, {format: 'raw'});
          }
        }, 100);
      }
    });

    logger.log(`Editor ${editorId} configured with <br> tag protection`);
    return true;
  };

  // Initialize editors
  const initEditors = () => {
    if (typeof tinyMCE !== 'undefined' && tinyMCE.editors) {
      let allInitialized = true;

      editorIds.forEach(id => {
        if (!initEditor(id)) {
          allInitialized = false;
        }
      });

      return allInitialized;
    }
    return false;
  };

  // Try to initialize immediately
  if (!initEditors()) {
    // If not successful, poll until ready
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (initEditors() || attempts > 20) {
        clearInterval(interval);
      }
    }, 300);
  }

  // Ensure text mode changes are stored
  editorIds.forEach(id => {
    $(`#${id}`).on('input change', function() {
      window._originalEditorContent[id] = $(this).val();
    });
  });

  // Handle form submission to ensure HTML content is preserved
  $(`${containerSelector} form`).off('submit.htmlPreservation').on('submit.htmlPreservation', function() {
    // Update all editor content before form submission
    editorIds.forEach(function(id) {
      let finalContent = '';

      // First try to get content from active editor (Visual or Text)
      if (tinyMCE.get(id) && tinyMCE.get(id).isHidden()) {
        // Text mode is active - get directly from textarea
        const $textarea = $(`#${id}`);
        if ($textarea.length) {
          finalContent = $textarea.val();
        }
      } else if (tinyMCE.get(id)) {
        // Visual mode is active - get from editor and clean up
        const content = tinyMCE.get(id).getContent({format: 'raw'});
        finalContent = cleanupFromVisualEditor(content);
      }

      // If no content found but we have stored content, use that
      if (!finalContent && window._originalEditorContent[id]) {
        finalContent = window._originalEditorContent[id];
      }

      // Update the textarea with final content
      if (finalContent) {
        $(`#${id}`).val(finalContent);
        logger.log(`Form submission: Updated ${id} with content length: ${finalContent.length}`);
      }
    });

    // Let the form submit normally
    return true;
  });
}

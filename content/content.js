const toolbox = document.createElement('div');

Object.assign(toolbox.style, {
  display: 'none',
  position: 'fixed',
  zIndex: '9999',
  pointerEvents: 'auto',
  background: 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(16px)',
  borderRadius: '13px',
  border: '1px solid rgba(0,0,0,0.1)',
  boxShadow: '0 12px 32px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)',
  padding: '4px',  // Reduced padding
  gap: '4px',  // Reduced gap
  alignItems: 'center',
  transform: 'scale(0.96) translateY(5px)',
  transition: 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
  transformOrigin: 'top left',
  flexWrap: 'wrap',
  maxWidth: '360px',
  MozBackdropFilter: 'blur(16px)',
  MozBoxShadow: '0 12px 32px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)'
});

const style = document.createElement('style');
style.textContent = `
.toolbox {
  display: none;
  position: fixed;
  z-index: 9999;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-radius: 13px;  
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04);
  padding: 4px;  
  gap: 4px;  
  align-items: center;
  transform: scale(0.96) translateY(5px);
  transition: transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  transform-origin: top left;
  flex-wrap: wrap;
  max-width: 360px;
  moz-backdrop-filter: blur(16px);
  moz-box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04);
  padding-left: 8px;  
  padding-right: 8px; 
}

.tool-btn {
  border: none;
  background: transparent;
  padding: 4px 8px;  
  border-radius: 9px;  
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, sans-serif;
  font-size: 11px;  
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  margin: 0;  
  display: inline-flex;
  align-items: center;
  gap: 6px;  
  line-height: 1.2;
  border: 0.5px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  flex-shrink: 0;
}

.tool-btn:hover {
  background: rgba(10, 132, 255, 0.1) !important;
  color: #007aff;
  transform: translateY(-0.5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tool-btn:active {
  background: rgba(10, 132, 255, 0.15) !important;
  transition-duration: 0.1s;
  transform: translateY(0.5px);
}

.toolbox-visible {
  transform: scale(1) translateY(0) !important;
  display: inline-flex !important;
}

@-moz-document url-prefix() {
  .toolbox {
    background: rgba(255, 255, 255, 0.98);
  }
  .tool-btn {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, sans-serif;
  }
}

`;

document.head.appendChild(style);
document.body.appendChild(toolbox);

let mousePos = { x: 0, y: 0 };
let isIconMouseDown = false;
let animationTimeout = null;

function showToolbox() {

  clearTimeout(animationTimeout);

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let leftPosition = mousePos.x + 15;
  let topPosition = mousePos.y + 15;

  if (leftPosition + 300 > viewportWidth) {
    leftPosition = viewportWidth - 320;
  }
  if (topPosition + 200 > viewportHeight) {
    topPosition = viewportHeight - 220;
  }

  toolbox.style.display = 'flex';
  toolbox.style.left = `${leftPosition}px`;
  toolbox.style.top = `${topPosition}px`;

  requestAnimationFrame(() => {
    toolbox.classList.add('toolbox-visible');
  });
}

function hideToolbox() {

  clearTimeout(animationTimeout);
  toolbox.classList.remove('toolbox-visible');

  animationTimeout = setTimeout(() => {
    toolbox.style.display = 'none';

  }, 200);
}

function handleMouseDown(event) {

  if (toolbox.contains(event.target)) {
    isIconMouseDown = true;
    return;
  }
  hideToolbox();
}

function handleMouseUp(event) {

  if (isIconMouseDown) {
    isIconMouseDown = false;
    return;
  }

  const selection = window.getSelection().toString().trim();

  if (selection) {
    showToolbox();
    return;
  }
  hideToolbox();
}

function handleMouseMove(event) {
  mousePos.x = event.clientX;
  mousePos.y = event.clientY;
}

async function loadToolboxButtons() {

  try {
    const result = await browser.storage.local.get('prompts');

    const prompts = result.prompts || [];

    toolbox.innerHTML = '';

    prompts.forEach((prompt, index) => {
      if (!prompt.name.trim() && !prompt.prompt.trim()) {
        console.warn(`Skipping empty prompt at index ${index}`);
        return;
      }

      const button = document.createElement('button');
      button.className = 'tool-btn';
      button.textContent = prompt.name.trim() || `Prompt ${index + 1}`;
      button.dataset.prompt = prompt.prompt;
      button.title = prompt.prompt;

      button.addEventListener('click', () => {
        handlePromptClick(prompt.prompt);
      });

      toolbox.appendChild(button);
    });


  } catch (error) {
    console.error('Error loading prompts:', error);
    toolbox.innerHTML = '<button class="tool-btn">Error loading prompts</button>';
  }
}

function handlePromptClick(promptTemplate) {

  const selectedText = window.getSelection().toString().trim();

  if (!selectedText) {
    console.warn('Aborting - no text selected');
    alert('Please select some text first!');
    return;
  }

  try {
    const fullPrompt = promptTemplate.replace('$text', selectedText);

    const encodedQuery = encodeURIComponent(fullPrompt)
      .replace(/%20/g, '+')
      .replace(/%2F/g, '/')
      .replace(/%3A/g, ':');

    const isMobile = window.screen.width <= 768;
    const width = isMobile ? window.screen.width : Math.min(800, window.screen.width * 0.9);
    const height = isMobile ? window.screen.height : Math.min(900, window.screen.height * 0.9);
    const left = isMobile ? 0 : (window.screen.width - width) / 2;
    const top = isMobile ? 0 : (window.screen.height - height) / 2;

    const chatURL = `https://chat.openai.com/?q=${encodedQuery}`;
    const popup = window.open(
      chatURL,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (popup) {
      popup.focus();
      return
    }

    alert('Popup blocked by browser!');

  } catch (error) {
    console.error('Error handling prompt:', error);
    alert('Error processing prompt. Check console for details.');
  }

  hideToolbox();
}

function handleOutBoundClick(event) {
  if (!toolbox.contains(event.target)) {
    hideToolbox();
  }
}


document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('click', handleOutBoundClick);
window.addEventListener('scroll', hideToolbox);

loadToolboxButtons();
browser.storage.onChanged.addListener((changes) => {
  if (changes.prompts) {
    loadToolboxButtons();
  }
});


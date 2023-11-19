
  const copyButton = document.getElementById('copyGameLink');

  copyButton.addEventListener('click', async () => {
    const gameLink = document.getElementById('gameLinkInput').value
  
    try {
      await navigator.clipboard.writeText(gameLink);
      copyButton.innerText = 'Copied'
    } catch (err) {
      console.error('Failed to copy: ', err);
      copyButton.innerText = 'Error Copy Manually'
    }
  });

import React from 'react'

const BrowserWarning = () => {
  if ('webkitSpeechRecognition' in window) {
    return null
  }

  return (
    <div className="browser-warning">
      <strong>⚠️ Voice commands work best in Chrome, Edge, or Safari</strong>
      <br />
      Your current browser doesn't support voice recognition. You can still use text commands.
    </div>
  )
}

export default BrowserWarning
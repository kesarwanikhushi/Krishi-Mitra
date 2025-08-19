export default function TestMic() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ff0000',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1>🚨 MICROPHONE TEST PAGE 🚨</h1>
      <p>If you can see this red page, the routing works!</p>
      
      <div style={{
        margin: '20px',
        padding: '20px',
        backgroundColor: '#0066ff',
        borderRadius: '50%',
        width: '100px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        cursor: 'pointer',
        border: '5px solid yellow'
      }}
      onClick={() => {
        alert('🎤 MICROPHONE BUTTON CLICKED!');
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          
          recognition.onstart = () => {
            alert('Listening started!');
          };
          
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            alert('You said: ' + transcript);
          };
          
          recognition.onerror = (event) => {
            alert('Error: ' + event.error);
          };
          
          recognition.start();
        } else {
          alert('Speech recognition not supported');
        }
      }}
      >
        🎤
      </div>
      
      <p>👆 Click the blue microphone button above!</p>
    </div>
  );
}

# Chess Game with AI Tutor and Player

## Features
- Play against AI opponent with adjustable difficulty
- AI tutor provides move suggestions
- Sound effects for moves, captures, checks and game end
- Dark/light theme toggle
- Responsive design works on mobile and desktop

## How to Run Locally
1. Install Python 3 if not already installed
2. Clone this repository
3. Run the server:
```bash
python3 server.py
```
4. Open http://localhost:8000 in your browser

## Deployment Options

### GitHub Pages
1. Push to a GitHub repository
2. Go to Settings → Pages
3. Select branch to deploy (main/master)
4. Set source to root folder
5. Your game will be live at:  
`https://<username>.github.io/<repo-name>/`

### Netlify/Vercel
1. Create account on netlify.com or vercel.com
2. Connect your GitHub repository
3. Deploy with default settings
4. Your game will get a public URL

## Future Improvements
- Add move history panel
- Implement game statistics tracking
- Add multiplayer functionality
- Include opening tutorials

## Credits
- Chess.js for game logic
- Stockfish.js for AI
- Tailwind CSS for styling
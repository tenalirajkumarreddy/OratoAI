# English Speaking Platform

An AI-powered English communication practice and interview preparation platform built with Next.js 15, TypeScript, and modern web technologies.

## Features

### 🎤 Voice Communication
- Real-time speech recognition with Web Speech API
- Text-to-speech synthesis with customizable voice settings
- Automatic microphone activation after AI responses
- Live transcript display during recording

### 📝 Practice Mode
- English conversation practice with AI corrections
- Real-time grammar and pronunciation feedback
- Scoring system for fluency and accuracy
- Personalized suggestions for improvement

### 💼 Interview Mode
- Mock interviews with customizable settings
- Role-specific questions (Software Developer, etc.)
- Difficulty levels: Easy, Medium, Hard
- Resume upload for personalized questions
- Comprehensive interview reports with detailed analysis
- Focus areas: Technical Skills, Communication, Problem Solving, etc.

### 📄 Document Processing
- PDF text extraction using PDF.js
- Image text extraction (OCR ready)
- Drag-and-drop file uploads
- Support for multiple file formats

### 🎨 Modern UI/UX
- Dark theme with sharp, professional design
- Responsive layout for all devices
- Smooth animations and transitions
- Intuitive user interface

### 🔄 Multi-User Support
- Session management for concurrent users
- Context preservation across sessions
- Real-time session switching

### 🤖 AI Integration
- **OpenRouter Integration**: Access to 100+ AI models from multiple providers
- **Model Variety**: OpenAI GPT, Anthropic Claude, Google Gemini, Meta Llama, Mistral, and more
- **Cost Optimization**: Choose models based on your needs and budget
- **No Vendor Lock-in**: Switch between AI providers seamlessly

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Speech**: Web Speech API
- **File Processing**: PDF.js, React Dropzone
- **AI Integration**: OpenRouter API for access to 100+ AI models (OpenAI, Anthropic, Google, Meta, Mistral, etc.)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (or compatible AI service)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd english-speaking-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Configuration

1. **API Setup**
   - Click the "Settings" button in the top-right corner
   - Enter your OpenRouter API key (get one free at [openrouter.ai/keys](https://openrouter.ai/keys))
   - Choose from multiple AI models (OpenAI, Anthropic Claude, Google Gemini, Meta Llama, etc.)
   - Configure voice settings (rate, pitch, volume)

2. **Browser Permissions**
   - Allow microphone access when prompted
   - Ensure your browser supports Web Speech API (Chrome recommended)

## Usage

### Practice Mode
1. Click "Start Practice Session"
2. Begin speaking or typing your message
3. Receive AI feedback with corrections and suggestions
4. Continue the conversation to improve your skills

### Interview Mode
1. Click "Start Interview Mode"
2. Configure interview settings:
   - Select role (Software Developer, etc.)
   - Choose difficulty level
   - Set duration and focus areas
   - Upload resume (optional but recommended)
3. Answer interview questions via voice or text
4. Receive a comprehensive report at the end

### General Mode
1. Click "Start General Session"
2. Upload documents for AI analysis
3. Engage in general conversation
4. Get assistance with various topics

## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── ChatInterface.tsx  # Main chat interface
│   ├── VoiceRecorder.tsx  # Voice recording component
│   ├── FileUpload.tsx     # File upload component
│   └── ...
├── contexts/              # React contexts
│   └── AppContext.tsx     # Global app state
├── hooks/                 # Custom React hooks
│   └── useSpeech.ts       # Speech recognition/synthesis
├── lib/                   # Utilities and services
│   ├── aiService.ts       # AI communication service
│   ├── fileProcessing.ts  # File processing utilities
│   └── utils.ts           # General utilities
└── types/                 # TypeScript type definitions
    └── index.ts           # Global types
```

## API Endpoints

### POST /api/chat
Handles AI communication requests.

**Request Body:**
```json
{
  "messages": [...],
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## Features in Detail

### Speech Recognition
- Continuous speech recognition
- Automatic silence detection
- Real-time transcript updates
- Multi-language support

### Voice Synthesis
- Customizable voice settings
- Multiple voice options
- Rate, pitch, and volume control
- Automatic playback of AI responses

### Interview Reports
- Overall score (0-100)
- Section-wise analysis:
  - Technical Skills
  - Communication
  - Problem Solving
  - Experience
- Strengths and weaknesses identification
- Actionable recommendations
- Downloadable reports

### File Processing
- PDF text extraction
- Image OCR (placeholder for production implementation)
- File validation and error handling
- Progress indicators

## Customization

### Adding New Interview Roles
1. Edit `src/components/InterviewSetup.tsx`
2. Add new roles to the `defaultRoles` array
3. Update AI prompts in `src/lib/aiService.ts`

### Modifying Voice Settings
1. Edit voice options in `src/components/SettingsDialog.tsx`
2. Update voice logic in `src/hooks/useSpeech.ts`

### Theming
1. Modify CSS variables in `src/app/globals.css`
2. Update component styles using Tailwind classes
3. Customize animations and transitions

## Deployment

### Vercel (Recommended)
1. Push to GitHub repository
2. Connect to Vercel
3. Deploy automatically

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```env
# For production deployment
OPENAI_API_KEY=your_api_key_here (optional, can be set in UI)
NEXT_PUBLIC_API_URL=your_api_endpoint
```

## Browser Support

- **Chrome**: Full support (recommended)
- **Firefox**: Limited speech API support
- **Safari**: Basic functionality
- **Edge**: Full support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

**Microphone not working:**
- Check browser permissions
- Ensure HTTPS connection
- Try refreshing the page

**AI responses not working:**
- Verify API key in settings
- Check network connectivity
- Ensure API endpoint is correct

**Voice synthesis not working:**
- Check browser support
- Verify voice settings
- Try different voice options

**PDF upload failing:**
- Ensure file is not corrupted
- Check file size limits
- Verify PDF format

### Performance Optimization

- Enable compression in production
- Optimize images and assets
- Use proper caching headers
- Monitor API usage and costs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for AI capabilities
- Radix UI for accessible components
- Lucide for beautiful icons
- PDF.js for document processing
- Tailwind CSS for styling

## Support

For support, please open an issue on GitHub or contact the development team.

# 🎯 Orato AI - AI-Powered English Speaking Platform

<div align="center">

![Orato AI Logo](https://img.shields.io/badge/Orato-AI-blue?style=for-the-badge&logo=artificial-intelligence)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Master English with AI Conversations | Practice Speaking | Ace Your Interviews**

[🚀 Live Demo](https://lovable.dev/projects/e6fb9509-f072-4a94-8e69-2d3bf6d7c5d0) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing) • [📞 Support](#support)

</div>

---

## 🌟 Overview

**Orato AI** is a cutting-edge, AI-powered English speaking platform designed to revolutionize language learning and interview preparation. Built with modern web technologies, it provides real-time feedback, intelligent conversations, and professional-grade interview simulations.

### ✨ Key Highlights

- 🎤 **Advanced Speech Recognition** - Real-time voice-to-text with Web Speech API
- 🤖 **Multi-Provider AI Integration** - Support for 5 AI providers with 20+ models
- 📝 **Smart Interview Simulator** - Resume upload, AI-generated questions, professional reports
- 🎯 **Real-time Feedback** - Instant pronunciation, fluency, and content analysis
- 📊 **Professional Reports** - Detailed competency scoring and recommendations
- 🎨 **Modern UI/UX** - Responsive design with accessibility-first approach

---

## 🚀 Features

### 💬 AI-Powered Conversations
- **Natural Language Processing** with advanced AI models
- **Context-Aware Responses** that maintain conversation flow
- **Grammar & Vocabulary Corrections** in real-time
- **Personalized Learning Path** based on user performance

### 🎯 Interview Simulation
- **Resume Upload & Analysis** - PDF/document processing
- **Dynamic Question Generation** - Role-specific interview questions
- **Real-time Performance Evaluation** - Live scoring and feedback
- **Professional Report Generation** - Detailed competency analysis
- **Multiple Difficulty Levels** - Beginner to expert practice

### 🗣️ Speech Technology
- **Real-time Speech Recognition** - Convert speech to text instantly
- **Natural Voice Synthesis** - AI-generated responses with natural voices
- **Pronunciation Analysis** - Detailed feedback on speaking clarity
- **Continuous Conversation Mode** - Seamless back-and-forth dialogue

### ⚙️ Advanced Configuration
- **Multi-Provider AI Support** - OpenAI, Anthropic, DeepSeek, OpenRouter, Perplexity
- **Model Selection** - Choose from GPT-4, Claude, Gemini, and more
- **Customizable Settings** - Voice, speed, difficulty, and feedback levels
- **Progress Tracking** - Monitor improvement over time

---

## 🛠️ Technology Stack

### Frontend
- **⚛️ React 18** - Modern component-based UI library
- **📘 TypeScript** - Type-safe JavaScript development
- **⚡ Vite** - Lightning-fast build tool and dev server
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🔧 shadcn/ui** - High-quality, accessible component library

### AI Integration
- **🤖 Multi-Provider Architecture** - OpenAI, Anthropic, DeepSeek, OpenRouter, Perplexity
- **🧠 Advanced Prompt Engineering** - Optimized for language learning
- **📊 Response Analysis** - Intelligent parsing of AI feedback
- **🔄 Dynamic Model Switching** - Real-time provider/model changes

### Speech Technology
- **🎤 Web Speech API** - Native browser speech recognition
- **🔊 Speech Synthesis API** - Natural voice generation
- **📝 Real-time Transcription** - Live speech-to-text conversion
- **🎯 Voice Commands** - Hands-free interaction support

---

## 🏁 Quick Start

### Prerequisites
- **Node.js** 18+ or **Bun** runtime
- Modern browser with Web Speech API support
- AI API key (OpenAI, OpenRouter, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/tenalirajkumarreddy/speak-with-spark-ai.git
cd speak-with-spark-ai

# Install dependencies (using Bun - recommended)
bun install

# Or using npm
npm install

# Start development server
bun run dev
# Or: npm run dev
```

### Environment Setup

1. **Get API Keys** from your preferred AI provider:
   - [OpenAI](https://platform.openai.com/api-keys)
   - [OpenRouter](https://openrouter.ai/keys)
   - [Anthropic](https://console.anthropic.com/)
   - [DeepSeek](https://platform.deepseek.com/)

2. **Configure in Settings** - Navigate to `/settings` in the app and add your API key

3. **Start Speaking** - Go to `/practice` or `/interview` to begin!

---

## 📚 Usage Guide

### 🎤 Practice Mode
1. Navigate to **Practice** page
2. Configure your AI provider and model in **Settings**
3. Click **Start Practice** and begin speaking
4. Receive real-time feedback and corrections
5. Continue conversations naturally

### 🎯 Interview Mode
1. Go to **Interview** page
2. Upload your resume (PDF/DOC format)
3. Configure job role, difficulty, and time limit
4. Start the interview simulation
5. Answer AI-generated questions
6. Download your professional performance report

### ⚙️ Customization
- **AI Settings**: Choose provider, model, temperature
- **Voice Settings**: Adjust speech recognition sensitivity
- **UI Preferences**: Theme, layout, accessibility options

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui component library
│   ├── Navigation.tsx  # App navigation bar
│   └── InterviewReport.tsx # Professional report component
├── pages/              # Main application pages
│   ├── Index.tsx       # Landing page
│   ├── Practice.tsx    # Speaking practice interface
│   ├── Interview.tsx   # Interview simulation
│   └── Settings.tsx    # Configuration panel
├── lib/                # Core services and utilities
│   ├── aiService.ts    # Multi-provider AI integration
│   ├── interviewService.ts # Interview-specific logic
│   └── utils.ts        # Shared utility functions
├── hooks/              # Custom React hooks
│   ├── use-speech.ts   # Speech recognition/synthesis
│   ├── use-mobile.tsx  # Mobile device detection
│   └── use-toast.ts    # Toast notification system
└── types/              # TypeScript type definitions
    └── index.ts        # Application-wide interfaces
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports
- Use the [Issues](https://github.com/tenalirajkumarreddy/speak-with-spark-ai/issues) tab
- Provide detailed reproduction steps
- Include browser/OS information

### 💡 Feature Requests
- Check existing [Issues](https://github.com/tenalirajkumarreddy/speak-with-spark-ai/issues) first
- Provide clear use cases and benefits
- Consider implementation complexity

### 🔧 Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### 📝 Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Community

### 📞 Get Help
- **Documentation**: Comprehensive guides and API reference
- **Issues**: Report bugs and request features
- **Discussions**: Community Q&A and general discussion

### 🌐 Connect With Us
- **Website**: [Orato AI](https://lovable.dev/projects/e6fb9509-f072-4a94-8e69-2d3bf6d7c5d0)
- **GitHub**: [@tenalirajkumarreddy](https://github.com/tenalirajkumarreddy)

---

## 🙏 Acknowledgments

- **OpenAI, Anthropic, DeepSeek** for powerful AI models
- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for rapid UI development
- **React & TypeScript** communities for excellent tooling
- **All contributors** who help improve Orato AI

---

<div align="center">

**⭐ If you find Orato AI helpful, please consider giving it a star!**

Made with ❤️ by [Tenali Raj Kumar Reddy](https://github.com/tenalirajkumarreddy)

</div>

# AI Journal 📝

A sleek, modern journaling app with AI-powered features, built with vanilla HTML, CSS, and JavaScript. Store your thoughts, memories, and experiences with intelligent summarization and insights.

![AI Journal Screenshot](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=AI+Journal+App)

## ✨ Features

### 📖 Core Journaling
- **Rich Text Editing**: Write entries with markdown support
- **Photo Uploads**: Attach photos to your entries
- **Location Tagging**: Automatically detect and tag your location
- **Smart Organization**: Tag and categorize your entries
- **Search & Filter**: Find entries by content, tags, or date

### 🤖 AI-Powered Features
- **Entry Summarization**: Get AI summaries of your entries
- **Smart Tag Suggestions**: AI suggests relevant tags
- **Writing Insights**: Analyze patterns and themes in your journaling
- **Batch Processing**: Summarize multiple entries at once

### 💾 Data Management
- **Export Options**: Download entries as PDF or Markdown
- **Trash System**: Safely delete entries with 30-day recovery
- **Batch Operations**: Select and delete multiple entries
- **Local Storage**: All data stored locally for privacy

### 🎨 User Experience
- **Dark Mode**: High-contrast dark theme optimized for writing
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Polished UI with smooth transitions
- **Keyboard Shortcuts**: Efficient navigation and editing

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-journal.git
   cd ai-journal
   ```

2. **Open the application**
   ```bash
   open index.html
   ```
   Or simply double-click `index.html` in your file explorer.

3. **Configure AI features (optional)**
   - Click the Settings gear icon
   - Enter your OpenAI API key
   - Choose your preferred AI model (GPT-3.5, GPT-4, or GPT-4 Turbo)

## 📖 How to Use

### Writing Entries
1. Click **"New Entry"** to start writing
2. Add a title, content, and tags
3. Use the **"Use current location"** button to auto-fill your location
4. Upload photos using the camera icon
5. Click **"Save Entry"** to store your entry

### AI Features
1. **Open the AI Panel**: Click the robot icon on the right side
2. **Summarize Entries**: Select entries and click "Summarize Selected"
3. **Get Tag Suggestions**: Click "Suggest Tags" for AI-generated tags
4. **Writing Insights**: Click "Generate Insights" for pattern analysis

### Managing Entries
- **Select Multiple**: Use the "Select" button on entry cards
- **Batch Delete**: Click "Delete Selected" in the header
- **Export**: Use Settings → Export & Backup for PDF/Markdown downloads
- **Search**: Use the Search tab to find specific entries

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup and modern features
- **CSS3**: Custom properties, flexbox, and animations
- **Vanilla JavaScript**: ES6+ features, async/await, modules
- **Local Storage**: Client-side data persistence
- **OpenAI API**: GPT models for AI features

### Architecture
- **Single Page Application**: All views managed in one HTML file
- **Component-based CSS**: Modular styling with CSS custom properties
- **Event-driven JavaScript**: Clean separation of concerns
- **Responsive Design**: Mobile-first approach with media queries

### Data Storage
- **Entries**: Stored in browser's localStorage
- **Photos**: Base64 encoded and stored locally
- **Settings**: User preferences saved locally
- **Trash**: Deleted entries preserved for 30 days

## 🔧 Configuration

### AI Settings
- **API Key**: Get yours from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Models Available**:
  - GPT-3.5 Turbo (faster, cheaper)
  - GPT-4 (more accurate)
  - GPT-4 Turbo (latest)

### Customization
- **Theme**: Dark mode optimized for writing
- **Export Formats**: PDF and Markdown supported
- **Storage**: All data remains local to your browser

## 📱 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For providing the GPT API
- **Font Awesome**: For the beautiful icons
- **Marked.js**: For markdown parsing
- **jsPDF**: For PDF generation

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ai-journal/issues) page
2. Create a new issue with detailed information
3. Include your browser version and steps to reproduce

## 🎯 Roadmap

- [ ] Cloud sync option
- [ ] More AI models (Claude, Gemini)
- [ ] Rich text editor with more formatting options
- [ ] Entry templates
- [ ] Export to more formats (Word, EPUB)
- [ ] Collaborative features
- [ ] Mobile app version

---

**Made with ❤️ by [Zach Bohl](https://www.zachbohl.com)**

*Happy journaling! 📝✨*
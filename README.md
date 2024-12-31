# README.md

## Project Overview
OReader is an advanced EPUB reader that leverages the power of [Epubjs](https://github.com/futurepress/epub.js/) for rendering EPUB books. It integrates with LLM to offer an in-context quick dictionary lookup feature, enhancing the bilingual reading experience by translating paragraphs within the EPUB file on-the-fly. Additionally, when a book is imported, all its content is processed through an embedding endpoint, enabling retrieval-augmented generation (RAG) capabilities.

## Features
- **EPUB Rendering**: Utilizes Epubjs to render EPUB books.
- **In-Context Quick Dictionary Lookup**: Provides real-time word explanations using LLM.
- **Bilingual Reading Experience**: Translates paragraphs within the EPUB file on-the-fly for a seamless bilingual reading experience.
- **Retrieval-Augmented Generation (RAG)**: Processes all book content upon import via an embedding endpoint to enable RAG features.

## Getting Started
### Prerequisites
- Node.js installed on your machine.
- An API key from LLM provider for accessing the LLM endpoint.

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/oreader.git
   cd oreader
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Start the server:
   * run `npm run start`

4. Set up:
    Open setting dialog to configure the API key, API endpoint, chat model Name, and embedding model name.

### Usage
1. Import an EPUB file into the application.
2. The system will automatically process the book content through the embedding endpoint.
3. Start reading and enjoy the in-context quick dictionary lookup and bilingual translation features (translation is disabled by default, enable it in theme settings popup).

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
For any questions or issues, please open an issue on the GitHub repository.
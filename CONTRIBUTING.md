# 🤝 Contributing to DOJ Forensic Analyzer

First off, thank you for considering contributing to the **Analyseur de Documents Judiciaires**! It's people like you that make investigative tools better for everyone.

## 📜 Code of Conduct
By participating in this project, you agree to abide by our Code of Conduct. Be respectful, professional, and ethical in your investigations and interactions.

## 🚀 How Can I Contribute?

### Reporting Bugs
- Check the [Issues](https://github.com/moonback/Analyseur-de-Documents-Judiciaires/issues) to see if the bug has already been reported.
- If not, open a new issue. Include steps to reproduce, expected vs. actual behavior, and environment details.

### Suggesting Enhancements
- Open an issue with the tag `enhancement`.
- Describe the feature, why it's needed, and how it fits into the forensic workflow.

### Pull Requests
1. **Fork the repo** and create your branch from `main`.
2. **Setup your environment**:
   ```bash
   npm install
   cp .env.example .env # Add your keys
   ```
3. **Make your changes**: Ensure your code follows the project's style (React 19, TypeScript, Tailwind).
4. **Test your changes**: Run `npm run dev` and verify functionality.
5. **Update documentation**: If you're adding a feature, update the relevant `.md` files.
6. **Submit the PR**: Provide a clear description of what you've done.

## 🛠️ Development Standards

- **TypeScript**: All new code must be typed. Avoid `any`.
- **UI/UX**: Maintain the "Premium Dark Mode" aesthetic. Use Tailwind CSS for consistency.
- **Services**: Keep business logic in `services/`. Components should only handle presentation.
- **Commits**: Use conventional commits (e.g., `feat: add network zoom`, `fix: parsing error`).

## ⚖️ Ethical Considerations
This tool is designed for analyzing public legal documents. Please ensure all contributions maintain data integrity and avoid spreading misinformation.

---

Questions? Open an issue or contact the maintainers. Happy investigating!

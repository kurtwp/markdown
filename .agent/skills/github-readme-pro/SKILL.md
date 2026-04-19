# \---

# name: github-readme-pro

# description: Use this skill to generate or update a professional GitHub README.md. Activates when asked to "document the project," "create a README," or "onboard users to this repo."

# \---

# 

# \# GitHub README Generation Skill

# This skill directs the agent to create comprehensive, well-structured documentation using GitHub Flavored Markdown (GFM).

# 

# \## Step 1: Gather Context

# Before writing, the agent must:

# \- Scan the root directory for `package.json`, `requirements.txt`, or config files to identify the \*\*tech stack\*\*.

# \- Read existing documentation (like `GEMINI.md` or code comments) to understand the \*\*core purpose\*\*.

# \- Check for existing images or logos in an `/assets` folder to include in the header.

# 

# \## Step 2: README Structure

# Generate the file following this standard hierarchy:

# 1\. \*\*Header\*\*: Project title, a one-sentence value proposition, and relevant badges.

# 2\. \*\*Visuals\*\*: Add a placeholder for a demo GIF or screenshot if not found.

# 3\. \*\*Features\*\*: Use a bulleted list to highlight 3-5 core capabilities.

# 4\. \*\*Getting Started\*\*:

# &#x20;  - \*\*Prerequisites\*\*: List required runtimes/tools.

# &#x20;  - \*\*Installation\*\*: Provide a code block with clear terminal commands.

# &#x20;  - \*\*Usage\*\*: Give a "quick start" code example or command.

# 5\. \*\*Configuration\*\*: Document key environment variables or config files.

# 6\. \*\*Contribution\*\*: A brief guide on how to open PRs or issues.

# 

# \## Implementation Rules

# \- \*\*Tone\*\*: Keep it professional, technical, yet accessible.

# \- \*\*Constraints\*\*: Do not include sections for "LICENSE" or "CONTRIBUTING" if those files already exist in the root; link to them instead.

# \- \*\*Formatting\*\*: Use \[GitHub Admonitions](https://github.com/orgs/community/discussions/16925) for tips or warnings (e.g., `> \[!TIP]`).

# 


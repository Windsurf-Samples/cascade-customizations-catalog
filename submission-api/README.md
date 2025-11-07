# Cascade Submission API

This FastAPI backend service enables users to submit customizations directly to the repository without requiring manual PR creation or GitHub issue workflows.

## Features

- Accepts form submissions from the web UI
- Validates submission data
- Generates properly formatted markdown files with YAML frontmatter
- Commits files directly to the repository using GitHub API
- Returns commit SHA and file path for verification

## Setup

### Prerequisites

- Python 3.12+
- Poetry for dependency management
- GitHub Personal Access Token with repo write permissions

### Installation

```bash
cd submission-api
poetry install
```

### Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_REPO_OWNER=Windsurf-Samples
GITHUB_REPO_NAME=cascade-customizations-catalog
```

**Important:** The GitHub token must have write access to the repository.

### Running Locally

```bash
poetry run fastapi dev app/main.py --port 8001
```

The API will be available at http://localhost:8001

## API Endpoints

### POST /api/submit

Submits a new customization to the repository.

**Request Body:**
```json
{
  "title": "My Customization",
  "description": "Description of what this does",
  "category": "Rule",
  "subcategory": "general",
  "labels": ["python", "testing"],
  "activation": "model_decision",
  "content": "Markdown content here...",
  "instructions": "Optional usage instructions",
  "examples": "Optional usage examples"
}
```

**Response:**
```json
{
  "success": true,
  "file_path": "customizations/general/my-customization.md",
  "commit_sha": "abc123...",
  "message": "Successfully submitted rule: My Customization"
}
```

## Deployment

### Fly.io (Recommended)

**Note:** Due to Fly.io region deprecations, you may need to specify a region manually.

```bash
cd submission-api
fly launch --region sjc  # or another active region
fly deploy
```

### Alternative Platforms

This FastAPI app can be deployed to:
- **Vercel**: Use the Vercel CLI
- **Railway**: Connect your GitHub repo
- **Render**: Configure as a web service
- **AWS/GCP/Azure**: Use container deployment

### Environment Variables

After deployment, configure these environment variables on your platform:

- `GITHUB_TOKEN`: Your GitHub Personal Access Token
- `GITHUB_REPO_OWNER`: Repository owner (default: Windsurf-Samples)
- `GITHUB_REPO_NAME`: Repository name (default: cascade-customizations-catalog)

## Frontend Integration

Update the frontend's `SubmissionFormManager.js` to point to your deployed backend:

```javascript
const apiUrl = 'https://your-deployed-backend-url.com/api/submit';
```

## Security Notes

- Never commit your GitHub token to the repository
- Use environment variables for all sensitive configuration
- Consider adding rate limiting for production deployments
- The API currently has no authentication - organizations should add this based on their needs

## File Structure

Submissions are stored at:
- Rules: `customizations/<subcategory>/<slugified-title>.md`
- Workflows: `customizations/workflows/<slugified-title>.md`

Files include YAML frontmatter:
- Rules: `trigger` and `description`
- Workflows: `description` only

## Troubleshooting

**Error: "GitHub token not configured"**
- Ensure your `.env` file has a valid `GITHUB_TOKEN`
- Verify the token has write permissions to the repository

**Error: "File already exists"**
- A file with the same slugified title already exists
- Choose a different title or manually delete the existing file

**Deployment fails with region error**
- Use a non-deprecated region (e.g., `sjc`, `lax`, `iad`)
- Check Fly.io documentation for current active regions

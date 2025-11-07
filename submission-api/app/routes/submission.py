from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from github import Github, GithubException
import os
from slugify import slugify

router = APIRouter()

class SubmissionRequest(BaseModel):
    title: str
    description: str
    category: str  # "Rule" or "Workflow"
    subcategory: Optional[str] = None  # Only for Rules
    labels: List[str]
    activation: Optional[str] = None  # Only for Rules
    content: str
    instructions: Optional[str] = None
    examples: Optional[str] = None

@router.post("/api/submit")
async def submit_customization(submission: SubmissionRequest):
    """
    Accept a customization submission and commit it directly to the GitHub repo.
    """
    try:
        github_token = os.getenv("GITHUB_TOKEN")
        repo_owner = os.getenv("GITHUB_REPO_OWNER", "Windsurf-Samples")
        repo_name = os.getenv("GITHUB_REPO_NAME", "cascade-customizations-catalog")
        
        if not github_token:
            raise HTTPException(
                status_code=500,
                detail="GitHub token not configured. Please contact the administrator."
            )
        
        if submission.category not in ["Rule", "Workflow"]:
            raise HTTPException(status_code=400, detail="Category must be 'Rule' or 'Workflow'")
        
        if submission.category == "Rule" and not submission.subcategory:
            raise HTTPException(status_code=400, detail="Subcategory is required for Rules")
        
        filename = slugify(submission.title) + ".md"
        
        if submission.category == "Rule":
            file_path = f"customizations/{submission.subcategory}/{filename}"
        else:  # Workflow
            file_path = f"customizations/workflows/{filename}"
        
        if submission.category == "Rule":
            activation_mode = submission.activation if submission.activation else "model_decision"
            frontmatter = f"---\ntrigger: {activation_mode}\ndescription: {submission.description}\n---\n\n"
        else:  # Workflow
            frontmatter = f"---\ndescription: {submission.description}\n---\n\n"
        
        file_content = frontmatter + submission.content
        
        if submission.instructions:
            file_content += f"\n\n## Usage Instructions\n\n{submission.instructions}"
        
        if submission.examples:
            file_content += f"\n\n## Usage Examples\n\n{submission.examples}"
        
        g = Github(github_token)
        repo = g.get_repo(f"{repo_owner}/{repo_name}")
        
        try:
            repo.get_contents(file_path)
            raise HTTPException(
                status_code=409,
                detail=f"A file already exists at {file_path}. Please choose a different title."
            )
        except GithubException as e:
            if e.status != 404:
                raise
        
        commit_message = f"Add {submission.category.lower()}: {submission.title} (via web UI)\n\nLabels: {', '.join(submission.labels)}"
        
        commit = repo.create_file(
            path=file_path,
            message=commit_message,
            content=file_content,
            branch="main"
        )
        
        return {
            "success": True,
            "file_path": file_path,
            "commit_sha": commit["commit"].sha,
            "message": f"Successfully submitted {submission.category.lower()}: {submission.title}"
        }
        
    except GithubException as e:
        raise HTTPException(
            status_code=500,
            detail=f"GitHub API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Submission failed: {str(e)}"
        )

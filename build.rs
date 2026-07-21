use sha2::{Digest, Sha256};
use std::fmt::Write as _;
use std::path::PathBuf;
use std::process::Command;

fn main() {
    let git_output = Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .output();

    let (git_sha, git_available) = match git_output {
        Ok(output) if output.status.success() => {
            let sha = String::from_utf8(output.stdout)
                .map(|s| s.trim().to_string())
                .unwrap_or_else(|_| "unknown".to_string());
            (sha, true)
        }
        _ => {
            println!(
                "cargo:warning=Unable to determine git SHA; using 'unknown' for build version."
            );
            ("unknown".to_string(), false)
        }
    };

    let is_dirty = if git_available {
        Command::new("git")
            .args(["status", "--porcelain"])
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .is_some_and(|s| !s.trim().is_empty())
    } else {
        false
    };

    let version = if is_dirty {
        format!("{git_sha}-dirty")
    } else {
        git_sha
    };

    println!("cargo:rustc-env=GIT_SHA={version}");
    println!("cargo:rerun-if-changed=.git/HEAD");
    println!("cargo:rerun-if-changed=.git/refs/heads");

    // Sync agent skills into public/.well-known/agent-skills/ for deployment.
    sync_agent_skills();
    println!("cargo:rerun-if-changed=.agents/skills");
}

/// Copy local agent skill files into `public/.well-known/agent-skills/` and
/// generate an Agent Skills Discovery index (`index.json`) with SHA-256
/// digests for each skill artifact.
fn sync_agent_skills() {
    let manifest_dir = PathBuf::from(
        std::env::var_os("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR should be set"),
    );
    let skills_dir = manifest_dir.join(".agents/skills");
    let public_skills_dir = manifest_dir.join("public/.well-known/agent-skills");

    std::fs::create_dir_all(&public_skills_dir)
        .expect("public/.well-known/agent-skills directory should be created");

    if !skills_dir.exists() {
        write_empty_skills_index(&public_skills_dir);
        return;
    }

    let mut skills: Vec<serde_json::Value> = Vec::new();

    for entry in std::fs::read_dir(&skills_dir)
        .unwrap_or_else(|e| panic!("Unable to read .agents/skills: {e}"))
    {
        let entry = entry.unwrap_or_else(|e| panic!("Invalid entry in .agents/skills: {e}"));
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let skill_md = path.join("SKILL.md");
        if !skill_md.exists() {
            continue;
        }

        let name = path
            .file_name()
            .expect("skill directory should have a name")
            .to_string_lossy()
            .to_string();
        let content = std::fs::read_to_string(&skill_md)
            .unwrap_or_else(|e| panic!("Unable to read {}: {e}", skill_md.display()));
        let description = parse_skill_description(&content).unwrap_or_else(|| {
            // Fall back to the first Markdown heading, if present.
            content
                .lines()
                .map(str::trim)
                .find(|l| l.starts_with("# "))
                .map(|l| l.trim_start_matches("# ").trim().to_string())
                .unwrap_or_else(|| format!("Skill: {name}"))
        });
        let digest = sha256_hex(&content);

        let target_dir = public_skills_dir.join(&name);
        std::fs::create_dir_all(&target_dir)
            .unwrap_or_else(|e| panic!("Unable to create {}: {e}", target_dir.display()));
        std::fs::copy(&skill_md, target_dir.join("SKILL.md"))
            .unwrap_or_else(|e| panic!("Unable to copy {}: {e}", skill_md.display()));

        skills.push(serde_json::json!({
            "name": name,
            "type": "skill-md",
            "description": description,
            "url": format!("https://xodium.org/.well-known/agent-skills/{name}/SKILL.md"),
            "digest": format!("sha256:{digest}"),
        }));
    }

    let index = serde_json::json!({
        "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
        "skills": skills,
    });

    std::fs::write(public_skills_dir.join("index.json"), index.to_string())
        .expect("agent skills index should be written");
}

fn write_empty_skills_index(public_skills_dir: &std::path::Path) {
    let index = serde_json::json!({
        "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
        "skills": [],
    });
    std::fs::write(public_skills_dir.join("index.json"), index.to_string())
        .expect("empty agent skills index should be written");
}

/// Extract the `description` field from YAML frontmatter, if present.
fn parse_skill_description(content: &str) -> Option<String> {
    let mut lines = content.lines();
    let first = lines.next()?;
    if first.trim() != "---" {
        return None;
    }

    for line in lines {
        let trimmed = line.trim();
        if trimmed == "---" {
            break;
        }
        if let Some(value) = trimmed.strip_prefix("description:") {
            return Some(value.trim().to_string());
        }
    }
    None
}

/// Compute the lowercase hex SHA-256 digest of a UTF-8 string.
fn sha256_hex(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let bytes = hasher.finalize();
    let mut out = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        write!(&mut out, "{b:02x}").expect("writing to a String should never fail");
    }
    out
}

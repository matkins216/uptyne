#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateFrontmatter(data) {
  return `---
title: "${data.title}"
description: "${data.description}"
date: "${data.date}"
author: "${data.author}"
tags: [${data.tags.map(tag => `"${tag}"`).join(', ')}]
excerpt: "${data.excerpt}"
featured: ${data.featured}
${data.image ? `image: "${data.image}"` : ''}
---

# ${data.title}

${data.excerpt}

## Introduction

Start your blog post here...

## Main Content

Add your main content sections here...

## Conclusion

Wrap up your post here...

---

*Need help with uptime monitoring? [Contact our team](mailto:support@uptyne.com) for assistance.*
`;
}

async function createBlogPost() {
  console.log('🚀 Creating a new blog post for Uptyne\n');

  try {
    // Get post details
    const title = await question('📝 Post title: ');
    const description = await question('📋 Description: ');
    const author = await question('✍️  Author: ');
    const tagsInput = await question('🏷️  Tags (comma-separated): ');
    const excerpt = await question('💬 Excerpt: ');
    const featured = await question('⭐ Featured post? (y/n): ');
    const image = await question('🖼️  Image path (optional, press Enter to skip): ');

    // Process inputs
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    const featuredBool = featured.toLowerCase() === 'y' || featured.toLowerCase() === 'yes';
    const date = new Date().toISOString().split('T')[0];
    const slug = slugify(title);

    // Create frontmatter data
    const frontmatterData = {
      title,
      description,
      date,
      author,
      tags,
      excerpt,
      featured: featuredBool,
      image: image.trim() || null
    };

    // Generate content
    const content = generateFrontmatter(frontmatterData);

    // Create file
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    const filePath = path.join(blogDir, `${slug}.md`);

    // Ensure blog directory exists
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, content);

    console.log('\n✅ Blog post created successfully!');
    console.log(`📁 File: ${filePath}`);
    console.log(`🔗 URL: /blog/${slug}`);
    console.log('\n📝 Next steps:');
    console.log('1. Edit the markdown file with your content');
    console.log('2. Add your featured image to the public/images/blog/ directory');
    console.log('3. Test your post by running the development server');
    console.log('4. Commit and push your changes');

  } catch (error) {
    console.error('❌ Error creating blog post:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
createBlogPost(); 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'learning');

// Helper to get all files in a dir recursively
const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.md') || file.endsWith('.mdx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
};

export const getTracks = (req, res) => {
    try {
        if (!fs.existsSync(CONTENT_DIR)) {
            return res.json([]);
        }

        const files = getAllFiles(CONTENT_DIR);
        const tracks = {};

        files.forEach(file => {
            const fileContents = fs.readFileSync(file, 'utf8');
            const { data } = matter(fileContents);
            
            if (data.track) {
                if (!tracks[data.track]) {
                    tracks[data.track] = {
                        title: data.track,
                        lessons: []
                    };
                }
                
                // Get a slug from the file path relative to content dir
                const relativePath = path.relative(CONTENT_DIR, file);
                const slug = relativePath.replace(/\\/g, '/').replace(/\.mdx?$/, '');
                
                tracks[data.track].lessons.push({
                    title: data.title,
                    description: data.description,
                    level: data.level,
                    order: data.order || 99,
                    slug
                });
            }
        });

        // Sort lessons by order
        Object.values(tracks).forEach(track => {
            track.lessons.sort((a, b) => a.order - b.order);
        });

        res.json(Object.values(tracks));
    } catch (error) {
        console.error("Error fetching tracks:", error);
        res.status(500).json({ error: "Failed to load learning tracks" });
    }
};

export const getLesson = (req, res) => {
    try {
        const { slug } = req.params; // Expects slug like "dsa/arrays/intro"
        // Prevent directory traversal
        const safeSlug = slug.replace(/\.\./g, '');
        const filePath = path.join(CONTENT_DIR, `${safeSlug}.md`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        res.json({
            metadata: data,
            content
        });
    } catch (error) {
        console.error("Error fetching lesson:", error);
        res.status(500).json({ error: "Failed to load lesson content" });
    }
};

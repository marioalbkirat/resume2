import { mkdir } from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

export const captureResumePreview = async (url: string, basename: string) => {
    const uploadDir = path.join(process.cwd(), "public", "user-resumes");
    await mkdir(uploadDir, { recursive: true });
    const filename = `${basename}-${Date.now()}.png`.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filePath = path.join(uploadDir, filename);
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0" });
    const resume = await page.$("#resume");
    if (resume) {
        await resume.screenshot({ path: filePath });
    } else {
        await page.screenshot({ path: filePath, fullPage: true });
    }
    await browser.close();
    return `/user-resumes/${filename}`;
};

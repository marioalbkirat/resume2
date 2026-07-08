import { mkdir } from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

export const captureResumePreview = async (url: string, basename: string) => {
    const uploadDir = path.join(process.cwd(), "public", "user-resumes");
    await mkdir(uploadDir, { recursive: true });
    const filename = `${basename}-${Date.now()}.png`.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filePath = path.join(uploadDir, filename);
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 1800, deviceScaleFactor: 2 });
        await page.goto(url, { waitUntil: "networkidle0" });
        await page.evaluateHandle("document.fonts.ready");

        const firstResumePage = await page.$('[data-resume-page="1"]');
        const resume = firstResumePage ?? await page.$("#resume");

        if (resume) {
            await resume.screenshot({ path: filePath, omitBackground: false });
        } else {
            await page.screenshot({ path: filePath, fullPage: false, omitBackground: false });
        }
    } finally {
        await browser.close();
    }

    return `/user-resumes/${filename}`;
};

import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

export class MarkdownPreview {
    static render(source: string, imageLabel: string): DocumentFragment {
        const markdown = new MarkdownIt({ html: false, linkify: false });
        markdown.renderer.rules.image = (tokens, index) => {
            const alt = tokens[index].content;
            return markdown.utils.escapeHtml(alt ? `[${imageLabel}: ${alt}]` : `[${imageLabel}]`);
        };
        const fragment = DOMPurify.sanitize(markdown.render(source), {
            RETURN_DOM_FRAGMENT: true,
            FORBID_TAGS: ["img", "svg", "math", "iframe", "style"]
        });
        fragment.querySelectorAll("a[href]").forEach(link => {
            const href = link.getAttribute("href") ?? "";
            if (!/^(https?:\/\/|mailto:|#)/i.test(href)) {
                link.removeAttribute("href");
            } else if (!href.startsWith("#")) {
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");
                link.setAttribute("referrerpolicy", "no-referrer");
            }
        });
        return fragment;
    }
}

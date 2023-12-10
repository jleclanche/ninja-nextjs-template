import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

const ExternalLink: React.FC<
    DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
> = ({ href, children, ...props }) => (
    <span className="flex items-center hover:underline">
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
        </a>
    </span>
);

export default ExternalLink;

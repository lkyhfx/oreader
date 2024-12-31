import { Book, Rendition } from "epubjs";
import { PackagingMetadataObject } from "epubjs/types/packaging";
import React, { useEffect, useState } from "react";
interface SidebarProps {
    book: Book | null;
    rendition: Rendition | null;
    visible: boolean;
}

const ReaderSidebar: React.FC<SidebarProps> = ({ book, rendition, visible }) => {
    const [metadata, setMetadata] = useState<PackagingMetadataObject | null>(null);

    useEffect(() => {
        const loadMetadata = async () => {
            if (book) {
                const loadedMetadata = await book.loaded.metadata;
                setMetadata(loadedMetadata);
            }
        };

        loadMetadata();
    }, [book]);

    const toggleSidebar = () => {
        // Implement toggle logic if needed
    };

    return (
        <div
            style={{
                width: "220px",
                position: "fixed",
                left: visible ? "0" : "-220px",
                top: "0",
                bottom: "0",
                backgroundColor: "#f8f9fa",
                transition: "left 0.3s ease-in-out",
                zIndex: 10,
                borderRight: "1px solid #dee2e6",
            }}
        >
            <h2>Book Details</h2>
            {metadata && (
                <div>
                    <h3>{metadata.title}</h3>
                    <p>Author: {metadata.creator}</p>
                    <p>Published: {metadata.pubdate}</p>
                </div>
            )}
            <button onClick={toggleSidebar}>
                {visible ? "Hide Sidebar" : "Show Sidebar"}
            </button>
        </div>
    );
};

export default ReaderSidebar;

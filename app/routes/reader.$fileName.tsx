import { json, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import Mustache from 'mustache';
import { useEffect, useRef, useState } from "react";
import * as R from 'remeda';
import ChatDialog from "~/components/ChatDialog";
import Popup from '~/components/Popup';
import SettingsDialog from "~/components/SettingsDialog";
import TOCDialog from "~/components/TOCDialog";
import TopBar from '~/components/TopBar';
import Epub, { Contents, NavItem, Rendition } from "epubjs";
import Section from "epubjs/types/section";
import { prisma } from "~/services/db";


async function fetchTranslation(text: string, prompt: string, author: string, title: string,
    previousParagraph: string, targetLanguage: string, apiKey: string, apiBaseUrl: string, chatModelName: string): Promise<string> {
    const finalPrompt = Mustache.render(prompt, { author, title, previousParagraph, targetLanguage });
    const response = await fetch("/reader/translate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, prompt: finalPrompt, apiKey, apiBaseUrl, chatModelName }),
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error);
    }
    return data.translation;
}

function copyAttribute(sourceElement: Element, targetElement: Element) {
    Array.from(sourceElement.attributes).forEach(attr => {
        targetElement.setAttribute(attr.name, attr.value);
    });
}



async function translateContent(contents: Contents, prompt: string, author: string, title: string, targetLanguage: string, apiKey: string, apiBaseUrl: string, chatModelName: string) {
    let previousParagraph = '';
    async function translateParagraph(paragraph: Element) {
        const originalText = paragraph.textContent?.trim();
        const translatedSpan = contents.document.createElement('p');
        if (originalText) {
            const translation = await fetchTranslation(originalText?.trim() || '', prompt, author, title, previousParagraph, targetLanguage, apiKey, apiBaseUrl, chatModelName)
            translatedSpan.textContent = translation;
            translatedSpan.style.display = 'block';
            translatedSpan.style.marginTop = '5px';

            copyAttribute(paragraph, translatedSpan);

            if (paragraph && paragraph.parentNode) {
                paragraph.parentNode.insertBefore(translatedSpan, paragraph.nextSibling);
            }
        }
        previousParagraph = originalText || '';
    }

    if (contents.document) {
        const paragraphs = contents.document.querySelectorAll('p, div');
        paragraphs.forEach(translateParagraph);
    }
}



async function translateRange(range: Range, author: string, title: string, prompt: string,
    targetLanguage: string, apiKey: string, apiBaseUrl: string, chatModelName: string) {
    const treeWalker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT, // Only show element nodes
        {
            acceptNode: (node) => {
                if (range.intersectsNode(node) &&
                    (node.nodeName === 'P' || node.nodeName === 'DIV') &&
                    node.textContent?.trim()) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
        }
    );
    let currentNode: Node | null;
    let previousParagraph = '';
    while ((currentNode = treeWalker.nextNode())) {
        const element = currentNode as Element
        if (element.hasAttribute('translated')) {
            continue;
        }
        const originalText = element.textContent?.trim();
        const translatedSpan = document.createElement('p');
        element.setAttribute('translated', 'true');
        if (originalText) {
            const translation = await fetchTranslation(originalText?.trim() || '', prompt, author, title,
                previousParagraph, targetLanguage, apiKey, apiBaseUrl, chatModelName)
            translatedSpan.textContent = translation;
            translatedSpan.style.display = 'block';
            translatedSpan.style.marginTop = '5px';
            // translatedSpan.setAttribute('translated', 'true');

            copyAttribute(element, translatedSpan);

            if (element.parentNode) {
                element.parentNode.insertBefore(translatedSpan, element.nextSibling);
            }

        }
        previousParagraph = originalText || '';
    }
}


function mergeCfiStartEnd(start: string, end: string): string {
    // Remove the 'epubcfi(' prefix and ')' suffix
    const startCfi = start.replace(/^epubcfi\(|\)$/g, '');
    const endCfi = end.replace(/^epubcfi\(|\)$/g, '');

    // Split the CFI into parts
    const startParts = startCfi.split('/');
    const endParts = endCfi.split('/');

    // Find the common part
    let commonParts: string[] = [];
    for (let i = 0; i < Math.min(startParts.length, endParts.length); i++) {
        if (startParts[i] === endParts[i]) {
            commonParts.push(startParts[i]);
        } else {
            break;
        }
    }

    // Extract the unique parts
    const startUnique = startParts.slice(commonParts.length).join('/');
    const endUnique = endParts.slice(commonParts.length).join('/');

    // Combine the parts
    const commonPart = commonParts.join('/');
    return `epubcfi(${commonPart},/${startUnique},/${endUnique})`;
}


const getColorFromBody = (css: string) => {
    const parsedCss = JSON.parse(css)
    if (parsedCss.body && parsedCss['*']) {
        const body = parsedCss.body
        return { color: parsedCss['*'].color.replace(' !important', ''), background: body.background.replace(' !important', '') }
    } else {
        return { color: '#000000', background: '#ffffff' }
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

const Reader: React.FC<{}> = () => {
    const renditionRef = useRef<Rendition | null>(null);
    const bookIframeRef = useRef<Window | null>(null);
    const { fileName, bookUrl, author, title, themeCss, translationPrompt, dictionaryPrompt,
        targetLanguage, apiKey, apiBaseUrl, chatModelName, embedModelName, translateActive } = useLoaderData<{
            fileName: string, bookUrl: string, author: string, title: string,
            themeCss: string, translationPrompt: string, dictionaryPrompt: string, targetLanguage: string, apiKey: string,
            apiBaseUrl: string, chatModelName: string, embedModelName: string, translateActive: boolean
        }>();
    const finalDictionaryPrompt = Mustache.render(dictionaryPrompt, { targetLanguage });
    const themeFetcher = useFetcher();
    const dictLookupFetcher = useFetcher();
    const [isTopBarVisible, setIsTopBarVisible] = useState(false);
    const showTopBar = () => setIsTopBarVisible(true);
    const hideTopBar = () => setIsTopBarVisible(false);
    const [isTOCVisible, setIsTOCVisible] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [toc, setToc] = useState<NavItem[]>([]);
    const closeTOC = () => setIsTOCVisible(false);
    const openTOC = () => setIsTOCVisible(true);
    const openSettings = () => setIsSettingsVisible(true);
    const openChat = () => setIsChatVisible(true);
    const [textColor, setTextColor] = useState<{ color: string, background: string }>(getColorFromBody(themeCss) || { color: '#000000', background: '#ffffff' });
    const [selectedFont, setSelectedFont] = useState<string>(JSON.parse(themeCss).p?.['font-family']?.[0] || 'Tahoma');
    const [popupText, setPopupText] = useState<string>('');
    const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [translationEnabled, setTranslationEnabled] = useState<boolean>(translateActive);
    const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
    const handleTOCItemClick = (navItem: NavItem) => {
        renditionRef.current?.display(navItem.href);
        closeTOC();
    }

    const handleFontChange = (font: string) => {
        setSelectedFont(font);
        const newTheme = {
            p: { 'font-family': [font, 'Noto Serif SC'], 'padding-top': '10px' },
            div: { 'font-family': [font, 'Noto Serif SC'], 'padding-top': '10px' }
        }
        themeFetcher.submit({ fileName, css: JSON.stringify(newTheme) }, { method: 'post', action: '/themes' })
    }
    const handleColorChange = (color: { color: string, background: string }) => {
        setTextColor(color)
        const newTheme = {
            body: { 'background': `${color.background} !important` },
            '*': { 'color': `${color.color} !important` }
        }
        themeFetcher.submit({ fileName, css: JSON.stringify(newTheme) }, { method: 'post', action: '/themes' })
    }

    const handleTranslateActiveChange = (translateActive: boolean) => {
        setTranslationEnabled(translateActive)
        themeFetcher.submit({ fileName, translateActive }, { method: 'post', action: '/themes/translate' })
    }

    useEffect(() => {
        if (themeFetcher.data) {
            const css = (themeFetcher.data as any).css
            renditionRef.current?.themes.default(css)

        }
    }, [themeFetcher.data])


    const handleTextSelection = async (event: MouseEvent) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const selection = bookIframeRef.current?.document.getSelection();
        //get div or p of selection
        const selectedText = selection?.toString().trim();
        if (selectedText) {
            // ancestor element which is not a p or div
            const selectedElement = selection?.anchorNode?.parentElement?.closest('p, div');
            const response = await fetch("/reader/dictLookup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: selectedText, context: selectedElement?.textContent, prompt: finalDictionaryPrompt, apiKey, apiBaseUrl, chatModelName }),
            });
            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let result = '';
            // Calculate popup position and ensure it doesn't overflow the screen
            const x = clamp(event.pageX % window.innerWidth, 0, window.innerWidth - 200); // Assuming popup width is 200px
            const y = clamp(event.pageY, 0, window.innerHeight - 300); // Assuming popup height is 100px
            setPopupPosition({ x, y });

            while (true) {
                const { done, value } = await reader?.read() || {};
                if (done) break;
                result += decoder.decode(value || new Uint8Array(), { stream: true });
                setPopupText(result);
            }
        } else {
            setPopupText('');
        }
    };

    const handleKeyDown = async (event: KeyboardEvent) => {
        if (renditionRef.current) {
            if (event.key === "ArrowRight") {
                await renditionRef.current.next();
            } else if (event.key === "ArrowLeft") {
                await renditionRef.current.prev();
            }
        }
    };

    const handleMouseMove = (event: MouseEvent) => {
        const screenHeight = window.innerHeight;
        const topBoundary = screenHeight * 0.05;
        if (event.clientY < topBoundary) {
            showTopBar();
        } else {
            hideTopBar();
        }
    };

    const handleTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0];
        const windowWidth = window.innerWidth;
        const touchX = touch.clientX % windowWidth;
        if (touchX < windowWidth / 3) {
            renditionRef.current?.prev();
        } else if (touchX > (2 * windowWidth) / 3) {
            renditionRef.current?.next();
        }
    }

    useEffect(() => {
        const book_ = Epub(bookUrl, { openAs: 'epub' });
        const rendition_ = book_.renderTo("viewer", {
            height: "100%",
            allowScriptedContent: true
        });


        renditionRef.current = rendition_;
        const savedLocation = localStorage.getItem(`epub-location-${fileName}`);
        if (savedLocation) {
            renditionRef.current.display(savedLocation);
        } else {
            renditionRef.current.display();
        }
        window.addEventListener("keydown", handleKeyDown)
        renditionRef.current?.themes.default(JSON.parse(themeCss))
        renditionRef.current.on("rendered", (section: Section, iframe: Window) => {
            bookIframeRef.current = iframe;
            const contents = (renditionRef.current?.getContents() as unknown) as Contents[];
            if (translationEnabled) {
                translateContent(contents[0], translationPrompt, author, title, targetLanguage, apiKey, apiBaseUrl, chatModelName).then(() => {
                    // @ts-ignore
                    renditionRef.current?.resize(undefined, undefined);
                });
            }

        })
        renditionRef.current?.on('locationChanged', (location: { start: string, end: string }) => {
            localStorage.setItem(`epub-location-${fileName}`, location.start)
        })

        renditionRef.current.on('keyup', handleKeyDown)
        renditionRef.current.on('mousemove', handleMouseMove)
        renditionRef.current.on('mouseup', handleTextSelection)
        renditionRef.current.on('touchstart', handleTouchStart)

        book_.loaded.navigation.then((navigation) => {
            setToc(navigation.toc);
        });

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            renditionRef.current?.destroy();
        }
    }, []);


    return (
        <div className="w-screen h-screen flex flex-col">

            <div id="viewer" className={`flex overflow-hidden h-[100%] bg-transparent`}> </div>
            <TopBar isVisible={isTopBarVisible} onOpenTOC={openTOC} onOpenSettings={openSettings} textColor={textColor}
                onOpenChat={openChat}
                translationEnabled={translationEnabled} handleTranslateActiveChange={handleTranslateActiveChange}
                handleColorChange={handleColorChange} selectedFont={selectedFont} handleFontChange={handleFontChange} />
            <TOCDialog toc={toc} onItemClick={handleTOCItemClick} isTOCVisible={isTOCVisible} setIsTOCVisible={setIsTOCVisible} />
            <SettingsDialog isSettingsVisible={isSettingsVisible} setIsSettingsVisible={setIsSettingsVisible}
                translationPrompt={translationPrompt} dictionaryPrompt={dictionaryPrompt} targetLanguage={targetLanguage}
                apiKey={apiKey} apiBaseUrl={apiBaseUrl} chatModelName={chatModelName} embedModelName={embedModelName} />
            <ChatDialog fileName={fileName} isChatVisible={isChatVisible} setIsChatVisible={setIsChatVisible} />
            {popupText !== '' && (
                <Popup text={popupText} position={popupPosition} />
            )}
        </div>
    );
};

export const loader: LoaderFunction = async ({ params }) => {
    const { fileName } = params;

    if (!fileName) {
        throw new Response("Filename is required", { status: 400 });
    }

    const url = `/bookManage/${fileName}`;
    const book = await prisma.book.findUnique({
        where: {
            fileName: fileName
        },
        include: {
            themes: true
        }
    })
    const settings = await prisma.setting.findMany(
        {
            where: {
                type: {
                    in: ['translationPrompt', 'dictionaryPrompt', 'targetLanguage', 'apiKey',
                        'apiBaseUrl', 'chatModelName', 'embedModelName']
                }
            }
        }
    )
    const settingsGrouped = R.groupBy(settings, setting => setting.type)
    const translationPrompt = settingsGrouped.translationPrompt[0].content
    const dictionaryPrompt = settingsGrouped.dictionaryPrompt[0].content
    const targetLanguage = settingsGrouped.targetLanguage[0].content
    const apiKey = settingsGrouped.apiKey[0].content
    const apiBaseUrl = settingsGrouped.apiBaseUrl[0].content
    const chatModelName = settingsGrouped.chatModelName[0].content
    const embedModelName = settingsGrouped.embedModelName[0].content

    return json({
        bookUrl: url, author: book?.author, title: book?.title, fileName, themeCss: book?.themes[0]?.css || '{}',
        translationPrompt, dictionaryPrompt, targetLanguage, apiKey, apiBaseUrl, chatModelName, embedModelName,
        translateActive: book?.themes[0]?.translateActive || false
    });
};

export default Reader;